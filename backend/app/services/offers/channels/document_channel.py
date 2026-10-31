import os
import io
import uuid
import hashlib
from pathlib import Path
from typing import Optional, Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.entities import AdminOfferDocument, OfferSource
from app.services.offers.channels.base import BaseIngestionChannel, IngestionResult
from app.services.document_intelligence.circular_parser import CircularParserService

CIRCULAR_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "uploads" / "circulars"
CIRCULAR_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class AdminDocumentIngestionChannel(BaseIngestionChannel):
    name: str = "Admin-Uploaded Official Documents Channel"
    channel_type: str = "ADMIN_DOCUMENT"

    async def ingest(
        self,
        db: AsyncSession,
        source_id: Optional[str] = None,
        raw_payload: Optional[Any] = None,
        actor_id: Optional[str] = None,
        actor_name: str = "Administrator",
        actor_role: str = "ADMIN"
    ) -> IngestionResult:
        """
        Validates, saves, and extracts structured credit card offers from an
        admin-uploaded official PDF circular.
        Ensures idempotent document deduplication via SHA-256 fingerprinting.
        """
        if not isinstance(raw_payload, dict):
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["Invalid payload; expected dictionary with file bytes and filename."]
            )

        filename = raw_payload.get("filename", "official_circular.pdf")
        file_bytes = raw_payload.get("bytes")
        mime_type = raw_payload.get("mime_type", "application/pdf")

        if not file_bytes:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["No document file bytes provided."]
            )

        # 1. Validate MIME and magic bytes
        if not filename.lower().endswith(".pdf"):
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["Invalid file extension. Only official PDF circulars (.pdf) are supported."]
            )

        is_valid, validation_err = CircularParserService.validate_pdf_bytes(file_bytes)
        if not is_valid:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[validation_err or "Invalid PDF file."]
            )

        # 2. Duplicate Document Detection via SHA-256
        sha256 = hashlib.sha256(file_bytes).hexdigest()
        stmt_dup = select(AdminOfferDocument).where(AdminOfferDocument.sha256_hash == sha256)
        existing_doc = (await db.execute(stmt_dup)).scalars().first()
        if existing_doc:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[f"Duplicate document detected. This circular was already uploaded as '{existing_doc.filename}' on {existing_doc.uploaded_at.strftime('%Y-%m-%d')}."],
                telemetry={"is_duplicate": True, "existing_doc_id": existing_doc.id}
            )

        # 3. Save to isolated filesystem location with UUID prefix
        safe_name = f"{uuid.uuid4().hex}_{Path(filename).name}"
        saved_path = CIRCULAR_UPLOAD_DIR / safe_name
        with open(saved_path, "wb") as f:
            f.write(file_bytes)

        # 4. Extract Text & Metadata using pypdf
        stream = io.BytesIO(file_bytes)
        parsed_doc = CircularParserService.extract_text_and_metadata(stream)

        # 5. Lookup Source Details if provided
        source_name = "Official Bank / Merchant Circular"
        if source_id:
            src_entity = (await db.execute(select(OfferSource).where(OfferSource.id == source_id))).scalars().first()
            if src_entity:
                source_name = src_entity.source_name

        # 6. Extract Structured Offers
        raw_text_sample = parsed_doc["text"][:1000] if parsed_doc["text"] else None
        doc_record = AdminOfferDocument(
            source_id=source_id,
            filename=filename,
            file_path=str(saved_path),
            mime_type=mime_type,
            file_size_bytes=len(file_bytes),
            sha256_hash=sha256,
            uploaded_by_id=actor_id or "system-admin",
            uploaded_by_name=actor_name,
            processing_status="PROCESSING",
            ocr_supported=False,
            raw_text_sample=raw_text_sample
        )
        db.add(doc_record)
        await db.flush()

        canonical_offers = CircularParserService.extract_offers_from_text(
            text=parsed_doc["text"],
            filename=filename,
            source_url=f"doc://{doc_record.id}/{filename}",
            source_name=source_name,
            source_id=source_id,
            source_document_id=doc_record.id
        )

        doc_record.extracted_offers_count = len(canonical_offers)
        doc_record.processing_status = "EXTRACTED"
        if not parsed_doc["has_extractable_text"]:
            doc_record.error_message = "No extractable text found. Document may be a scanned image. OCR is currently unsupported."

        await db.commit()
        await db.refresh(doc_record)

        return IngestionResult(
            success=True,
            channel_name=self.name,
            source_id=source_id,
            items=canonical_offers,
            telemetry={
                "document_id": doc_record.id,
                "sha256": sha256,
                "file_size_bytes": len(file_bytes),
                "page_count": parsed_doc["page_count"],
                "has_extractable_text": parsed_doc["has_extractable_text"],
                "ocr_supported": False,
                "extracted_count": len(canonical_offers)
            }
        )
