import hmac
import hashlib
from typing import Optional, Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.entities import OfferSource
from app.services.offers.channels.base import BaseIngestionChannel, IngestionResult
from app.services.offers.normalization import OfferNormalizer, CanonicalOfferPayload

# Partner integration shared secret for sandbox HMAC verification
PARTNER_FEED_SANDBOX_SECRET = "CLIQ_PARTNER_SECRET_SANDBOX_2026"

class PartnerFeedIngestionChannel(BaseIngestionChannel):
    name: str = "Authorized APIs and Partner Feeds Channel"
    channel_type: str = "AUTHORIZED_API"

    @classmethod
    def verify_partner_signature(cls, payload_bytes: bytes, signature_header: Optional[str]) -> bool:
        """Verifies SHA-256 HMAC signature on incoming partner feed payload."""
        if not signature_header:
            return False
        expected_sig = hmac.new(
            PARTNER_FEED_SANDBOX_SECRET.encode("utf-8"),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature_header.strip())

    async def ingest(
        self,
        db: AsyncSession,
        source_id: Optional[str] = None,
        raw_payload: Optional[Any] = None,
        actor_id: Optional[str] = None,
        actor_name: str = "Authorized Partner API",
        actor_role: str = "SYSTEM"
    ) -> IngestionResult:
        """
        Ingests standardized, signed partner offer feed payloads.
        Validates structure and normalizes into CanonicalOfferPayload.
        """
        if not isinstance(raw_payload, dict):
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["Invalid partner payload; expected dictionary."]
            )

        # Lookup partner source in registry
        source = None
        if source_id:
            source = (await db.execute(select(OfferSource).where(OfferSource.id == source_id))).scalars().first()
        else:
            source = (await db.execute(select(OfferSource).where(OfferSource.source_key == "partner_feed"))).scalars().first()
            if source:
                source_id = source.id

        offers_data = raw_payload.get("offers")
        if not isinstance(offers_data, list):
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["Partner feed missing 'offers' list in payload."]
            )

        canonical_items: List[CanonicalOfferPayload] = []
        errors: List[str] = []

        for idx, item in enumerate(offers_data):
            if not isinstance(item, dict):
                errors.append(f"Offer item at index {idx} is not an object.")
                continue

            try:
                canonical = OfferNormalizer.validate_and_normalize(
                    raw_data=item,
                    ingestion_channel="AUTHORIZED_API",
                    source_id=source_id,
                    source_name=source.source_name if source else "Authorized Partner Network",
                    source_url=item.get("source_url") or "https://api.partner.cliq.finance/feed/v1"
                )
                canonical_items.append(canonical)
            except Exception as e:
                errors.append(f"Failed to normalize partner item {idx}: {str(e)}")

        return IngestionResult(
            success=len(errors) == 0 or len(canonical_items) > 0,
            channel_name=self.name,
            source_id=source_id,
            items=canonical_items,
            errors=errors,
            telemetry={
                "partner_items_received": len(offers_data),
                "partner_items_parsed": len(canonical_items),
                "source_name": source.source_name if source else "Partner Network"
            }
        )

