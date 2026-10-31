import io
import time
from typing import Optional, Any
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.entities import OfferSource
from app.services.offers.channels.base import BaseIngestionChannel, IngestionResult
from app.services.document_intelligence.circular_parser import CircularParserService
from app.services.offers.source_registry import SourceRegistryService

class PdfCircularIngestionChannel(BaseIngestionChannel):
    name: str = "Official Downloadable PDF Circular Channel"
    channel_type: str = "PDF_CIRCULAR"

    async def ingest(
        self,
        db: AsyncSession,
        source_id: Optional[str] = None,
        raw_payload: Optional[Any] = None,
        actor_id: Optional[str] = None,
        actor_name: str = "PDF Circular Worker",
        actor_role: str = "SYSTEM"
    ) -> IngestionResult:
        """
        Downloads and parses official bank/merchant PDF circular from URL or in-memory bytes.
        """
        source: Optional[OfferSource] = None
        if source_id:
            source = (await db.execute(select(OfferSource).where(OfferSource.id == source_id))).scalars().first()

        pdf_url = None
        pdf_bytes = None
        filename = "bank_circular.pdf"

        if isinstance(raw_payload, dict):
            pdf_url = raw_payload.get("url")
            pdf_bytes = raw_payload.get("bytes")
            filename = raw_payload.get("filename", filename)
        elif isinstance(raw_payload, bytes):
            pdf_bytes = raw_payload

        # Download if URL provided
        t0 = time.time()
        if pdf_url and not pdf_bytes:
            headers = {"User-Agent": "CLIQ-Financial-Intelligence-Auditor/1.0"}
            try:
                async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                    resp = await client.get(pdf_url, headers=headers)
                    if resp.status_code == 200:
                        pdf_bytes = resp.content
                    else:
                        if source:
                            await SourceRegistryService.log_failure(
                                db=db,
                                source_id=source.id,
                                error_type="CIRCULAR_FETCH_FAILED",
                                error_message=f"HTTP {resp.status_code} fetching circular from {pdf_url}",
                                http_status=resp.status_code
                            )
                        return IngestionResult(
                            success=False,
                            channel_name=self.name,
                            source_id=source_id,
                            errors=[f"Failed to download circular: HTTP {resp.status_code}"]
                        )
            except Exception as e:
                err_msg = f"{type(e).__name__}: {str(e)}"
                if source:
                    await SourceRegistryService.log_failure(
                        db=db,
                        source_id=source.id,
                        error_type="DOWNLOAD_TIMEOUT" if "Timeout" in err_msg else "NETWORK_ERROR",
                        error_message=err_msg
                    )
                return IngestionResult(
                    success=False,
                    channel_name=self.name,
                    source_id=source_id,
                    errors=[f"Network error downloading circular: {err_msg}"]
                )

        if not pdf_bytes:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["No PDF bytes or valid circular URL provided."]
            )

        # Validate PDF structure
        is_valid, validation_err = CircularParserService.validate_pdf_bytes(pdf_bytes)
        if not is_valid:
            if source:
                await SourceRegistryService.log_failure(
                    db=db,
                    source_id=source.id,
                    error_type="INVALID_PDF_FORMAT",
                    error_message=validation_err or "Invalid PDF format"
                )
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[validation_err or "Invalid PDF format."]
            )

        # Extract text & metadata
        stream = io.BytesIO(pdf_bytes)
        parsed_doc = CircularParserService.extract_text_and_metadata(stream)
        if parsed_doc["error"]:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[parsed_doc["error"]],
                telemetry={"ocr_supported": False, "is_encrypted": parsed_doc["is_encrypted"]}
            )

        extracted_offers = CircularParserService.extract_offers_from_text(
            text=parsed_doc["text"],
            filename=filename,
            source_url=pdf_url or f"https://www.{source.domain if source else 'bank'}/circulars/{filename}",
            source_name=source.source_name if source else "Official Bank Circular",
            source_id=source_id
        )

        elapsed_ms = int((time.time() - t0) * 1000)
        return IngestionResult(
            success=True,
            channel_name=self.name,
            source_id=source_id,
            items=extracted_offers,
            telemetry={
                "page_count": parsed_doc["page_count"],
                "has_extractable_text": parsed_doc["has_extractable_text"],
                "ocr_supported": False,
                "latency_ms": elapsed_ms,
                "extracted_count": len(extracted_offers)
            }
        )

