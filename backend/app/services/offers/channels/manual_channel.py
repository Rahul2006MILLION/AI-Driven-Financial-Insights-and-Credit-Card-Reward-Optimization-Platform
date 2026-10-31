from typing import Optional, Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.entities import OfferSource
from app.services.offers.channels.base import BaseIngestionChannel, IngestionResult
from app.services.offers.normalization import OfferNormalizer, CanonicalOfferPayload

class AdminManualIngestionChannel(BaseIngestionChannel):
    name: str = "Admin-Entered Manual Ingestion Channel"
    channel_type: str = "MANUAL_ENTRY"

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
        Validates manual offer registration submitted by an authorized administrator.
        Enforces mandatory source URL and verbatim source evidence.
        """
        if not isinstance(raw_payload, dict):
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["Invalid manual offer payload; expected dictionary."]
            )

        # Mandatory Field Validations
        errors: List[str] = []
        source_url = raw_payload.get("source_url")
        if not source_url or not str(source_url).strip().startswith(("http://", "https://", "doc://", "partner://")):
            errors.append("A valid official source URL (starting with http:// or https://) is mandatory.")

        source_evidence = raw_payload.get("source_evidence")
        if not source_evidence or len(str(source_evidence).strip()) < 10:
            errors.append("Verbatim source evidence snippet (min 10 characters) from official terms is mandatory.")

        merchant_name = raw_payload.get("merchant_name")
        if not merchant_name or len(str(merchant_name).strip()) < 2:
            errors.append("Valid merchant name is required.")

        offer_title = raw_payload.get("offer_title")
        if not offer_title or len(str(offer_title).strip()) < 5:
            errors.append("Descriptive offer title (min 5 characters) is required.")

        if errors:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=errors
            )

        source_name = raw_payload.get("source_name")
        if source_id and not source_name:
            src = (await db.execute(select(OfferSource).where(OfferSource.id == source_id))).scalars().first()
            if src:
                source_name = src.source_name

        canonical = OfferNormalizer.validate_and_normalize(
            raw_data=raw_payload,
            ingestion_channel="MANUAL_ENTRY",
            source_id=source_id,
            source_name=source_name or "Manual Administrator Registration",
            source_url=source_url
        )

        return IngestionResult(
            success=True,
            channel_name=self.name,
            source_id=source_id,
            items=[canonical],
            telemetry={
                "actor_name": actor_name,
                "actor_role": actor_role,
                "confidence_score": str(canonical.extraction_confidence)
            }
        )
