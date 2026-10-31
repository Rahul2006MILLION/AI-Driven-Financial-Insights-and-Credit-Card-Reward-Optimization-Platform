import json
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

from app.models.entities import CardOffer, OfferAuditLog, OfferSource
from app.services.offers.normalization import CanonicalOfferPayload, OfferNormalizer
from app.services.offers.discovery_pipeline import DiscoveryPipeline
from app.services.offers.channels.base import IngestionResult

class OfferIngestionEngine:
    """
    Central ingestion engine for all 5 CLIQ offer channels.
    Enforces common canonical normalization, SHA-256 deduplication, zero-tolerance
    material change detection, immediate quarantine, and source health tracking.
    """

    @classmethod
    async def process_and_stage_payloads(
        cls,
        db: AsyncSession,
        payloads: List[CanonicalOfferPayload],
        channel_name: str,
        source_id: Optional[str] = None,
        actor_id: Optional[str] = None,
        actor_name: str = "System Ingestion Engine",
        actor_role: str = "SYSTEM"
    ) -> IngestionResult:
        now = datetime.utcnow()
        staged_count = 0
        quarantined_count = 0
        unchanged_count = 0
        errors: List[str] = []

        # Find source entity if ID given
        source_entity = None
        if source_id:
            source_entity = (await db.execute(select(OfferSource).where(OfferSource.id == source_id))).scalars().first()

        for payload in payloads:
            try:
                content_hash = OfferNormalizer.compute_canonical_hash(payload)

                # Deduplication query: Match by content_hash or (merchant, promo_code, bank)
                stmt = select(CardOffer).where(
                    or_(
                        CardOffer.content_hash == content_hash,
                        and_(
                            CardOffer.merchant_name.ilike(payload.merchant_name.strip()),
                            CardOffer.promo_code == payload.promo_code,
                            CardOffer.eligible_bank == payload.eligible_bank
                        )
                    )
                )
                existing = (await db.execute(stmt)).scalars().first()

                if existing:
                    # 1. Check if offer has expired
                    if payload.valid_to and payload.valid_to < now:
                        if existing.verification_status != "EXPIRED":
                            prev_st = existing.verification_status
                            existing.verification_status = "EXPIRED"
                            existing.freshness_state = "EXPIRED"
                            existing.updated_at = now
                            db.add(existing)

                            audit = OfferAuditLog(
                                offer_id=existing.id,
                                action="EXPIRED",
                                actor_id=actor_id,
                                actor_name=actor_name,
                                actor_role=actor_role,
                                from_status=prev_st,
                                to_status="EXPIRED",
                                notes=f"Offer expired on {payload.valid_to.strftime('%Y-%m-%d')}. Automatically decommissioned.",
                                snapshot_json=None
                            )
                            db.add(audit)
                        unchanged_count += 1
                        continue

                    # 2. Check material changes for previously VERIFIED offer
                    if existing.verification_status == "VERIFIED":
                        material_changed, change_reasons = DiscoveryPipeline.is_material_change(existing, payload)

                        if material_changed:
                            # Preserve previous version snapshot
                            previous_snapshot = {
                                "version": existing.version,
                                "offer_title": existing.offer_title,
                                "discount_value": str(existing.discount_value),
                                "discount_type": existing.discount_type,
                                "max_discount_amount": str(existing.max_discount_amount) if existing.max_discount_amount else None,
                                "min_transaction_value": str(existing.min_transaction_value),
                                "valid_to": existing.valid_to.isoformat() if existing.valid_to else None,
                                "promo_code": existing.promo_code,
                                "eligible_bank": existing.eligible_bank,
                                "eligible_network": existing.eligible_network,
                                "eligible_cards": existing.eligible_card_names_json,
                                "terms": existing.terms_and_conditions,
                                "source_evidence": existing.source_evidence,
                                "verified_at": existing.last_verified_timestamp.isoformat() if existing.last_verified_timestamp else None
                            }
                            existing.previous_version_json = json.dumps(previous_snapshot)
                            existing.version += 1
                            existing.verification_status = "NEEDS_REVERIFICATION"
                            existing.freshness_state = "QUARANTINED"
                            existing.source_evidence = payload.source_evidence
                            existing.extraction_confidence = payload.extraction_confidence
                            existing.content_hash = content_hash
                            existing.updated_at = now
                            db.add(existing)

                            # Audit log
                            audit = OfferAuditLog(
                                offer_id=existing.id,
                                action="REVERIFICATION_TRIGGERED",
                                actor_id=actor_id,
                                actor_name=actor_name,
                                actor_role=actor_role,
                                from_status="VERIFIED",
                                to_status="NEEDS_REVERIFICATION",
                                notes=f"Material changes detected via {channel_name}: {'; '.join(change_reasons)}. Quarantined pending re-verification.",
                                snapshot_json=existing.previous_version_json
                            )
                            db.add(audit)
                            quarantined_count += 1
                        else:
                            # Refresh verification timestamp and freshness
                            existing.last_verified_timestamp = now
                            existing.freshness_state = OfferNormalizer.compute_freshness_state(existing, now)
                            existing.content_hash = content_hash
                            unchanged_count += 1
                    elif existing.verification_status in ["PENDING_REVIEW", "DISCOVERED"]:
                        # Refresh evidence and confidence
                        existing.extraction_confidence = payload.extraction_confidence
                        existing.source_evidence = payload.source_evidence
                        existing.content_hash = content_hash
                        existing.freshness_state = OfferNormalizer.compute_freshness_state(existing, now)
                        unchanged_count += 1
                    else:
                        unchanged_count += 1

                else:
                    # 3. New Offer discovered -> Always enters PENDING_REVIEW
                    new_offer = CardOffer(
                        source_id=payload.source_id or source_id,
                        ingestion_channel=payload.ingestion_channel,
                        source_document_id=payload.source_document_id,
                        merchant_name=payload.merchant_name.strip(),
                        offer_title=payload.offer_title.strip(),
                        category_id=payload.category_id.strip(),
                        discount_type=payload.discount_type,
                        discount_value=payload.discount_value,
                        min_transaction_value=payload.min_transaction_value,
                        max_discount_amount=payload.max_discount_amount,
                        eligible_bank=payload.eligible_bank.strip() if payload.eligible_bank else None,
                        eligible_network=payload.eligible_network,
                        eligible_card_names_json=json.dumps(payload.eligible_card_names),
                        valid_from=payload.valid_from,
                        valid_to=payload.valid_to,
                        payment_channel=payload.payment_channel,
                        promo_code=payload.promo_code.strip() if payload.promo_code else None,
                        activation_requirement=payload.activation_requirement,
                        terms_and_conditions=payload.terms_and_conditions,
                        source_url=payload.source_url,
                        source_name=payload.source_name,
                        source_evidence=payload.source_evidence,
                        extraction_confidence=payload.extraction_confidence,
                        verification_status="PENDING_REVIEW",
                        freshness_state="FRESH",
                        content_hash=content_hash,
                        version=1,
                        last_verified_timestamp=now
                    )
                    db.add(new_offer)
                    await db.flush()

                    audit = OfferAuditLog(
                        offer_id=new_offer.id,
                        action="DISCOVERED",
                        actor_id=actor_id,
                        actor_name=actor_name,
                        actor_role=actor_role,
                        from_status="DISCOVERED",
                        to_status="PENDING_REVIEW",
                        notes=f"Discovered via {channel_name} from {payload.source_name}. Staged for human verification.",
                        snapshot_json=None
                    )
                    db.add(audit)
                    staged_count += 1

            except Exception as e:
                errors.append(f"Failed to process offer '{payload.offer_title}': {str(e)}")

        # Update source active offers count and health
        if source_entity:
            count_stmt = select(func.count(CardOffer.id)).where(
                CardOffer.source_id == source_entity.id,
                CardOffer.verification_status == "VERIFIED"
            )
            cnt = (await db.execute(count_stmt)).scalar() or 0
            source_entity.active_offers_count = cnt
            source_entity.last_successful_fetch = now
            source_entity.updated_at = now

        await db.commit()

        return IngestionResult(
            success=len(errors) == 0,
            channel_name=channel_name,
            source_id=source_id,
            staged_count=staged_count,
            quarantined_count=quarantined_count,
            unchanged_count=unchanged_count,
            errors=errors,
            items=payloads
        )

