from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.models.entities import Profile, CreditCard, CardOffer, OfferAuditLog, AuditLog
from app.schemas.offer import (
    CardOfferCreate,
    CardOfferUpdate,
    CardOfferResponse,
    AdminOfferApproveRequest,
    AdminOfferRejectRequest,
    AdminOfferEditRequest,
    AdminReverificationRequest,
    OfferAuditLogResponse,
    DiscoverySyncResponse,
)
from app.security.dependencies import get_current_user, require_admin
from app.services.offers.offer_service import OfferService
from app.services.offers.discovery_pipeline import DiscoveryPipeline

router = APIRouter(prefix="/offers", tags=["Offers Discovery"])
admin_router = APIRouter(prefix="/admin/offers", tags=["Admin Offer Verification Desk"])

# ==============================================================================
# USER / PUBLIC ENDPOINTS
# ==============================================================================

@router.get("", response_model=List[CardOfferResponse])
async def list_offers(
    category: Optional[str] = Query(None, description="Category filter (shopping, dining, food_delivery, travel, entertainment, grocery, utility)"),
    merchant: Optional[str] = Query(None, description="Filter by merchant name e.g. Swiggy, Amazon"),
    only_user_cards: bool = Query(False, description="Filter to offers applicable to user's registered cards"),
    expiring_soon: bool = Query(False, description="Filter offers expiring within 7 days"),
    verification_status: Optional[str] = Query(None, description="VERIFIED, SAMPLE, MANUALLY_ENTERED"),
    query: Optional[str] = Query(None, description="Free text search query"),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch active user cards for applicability matching
    card_stmt = select(CreditCard).where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
    user_cards = (await db.execute(card_stmt)).scalars().all()

    is_admin = bool(current_user.is_admin or current_user.role == "ADMIN")

    # Query offers via OfferService (strictly filtered to VERIFIED for regular users)
    offers = await OfferService.list_offers(
        db=db,
        user_cards=user_cards,
        category=category,
        merchant_name=merchant,
        only_user_cards=only_user_cards,
        expiring_soon=expiring_soon,
        verification_status=verification_status,
        query=query,
        is_admin=is_admin
    )
    return offers

@router.get("/{offer_id}", response_model=CardOfferResponse)
async def get_offer(
    offer_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CardOffer).where(CardOffer.id == offer_id)
    offer = (await db.execute(stmt)).scalar_one_or_none()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found."
        )

    # If regular user, do not expose unverified / rejected offers
    is_admin = bool(current_user.is_admin or current_user.role == "ADMIN")
    if not is_admin and offer.verification_status not in ["VERIFIED", "SAMPLE"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found or under review."
        )

    card_stmt = select(CreditCard).where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
    user_cards = (await db.execute(card_stmt)).scalars().all()
    matching_cards = OfferService.find_matching_user_cards(offer, user_cards)

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=matching_cards,
        is_applicable_to_user=len(matching_cards) > 0
    )

@router.post("", response_model=CardOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    req: CardOfferCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    is_admin = bool(current_user.is_admin or current_user.role == "ADMIN")
    # Ordinary users cannot self-verify offers; status defaults to PENDING_REVIEW
    v_status = req.verification_status if (is_admin and req.verification_status) else "PENDING_REVIEW"

    offer = CardOffer(
        merchant_name=req.merchant_name.strip(),
        offer_title=req.offer_title.strip(),
        category_id=req.category_id.strip(),
        discount_type=req.discount_type,
        discount_value=req.discount_value,
        min_transaction_value=req.min_transaction_value,
        max_discount_amount=req.max_discount_amount,
        eligible_bank=req.eligible_bank.strip() if req.eligible_bank else None,
        eligible_network=req.eligible_network,
        eligible_card_names_json=json.dumps(req.eligible_card_names),
        valid_from=req.valid_from,
        valid_to=req.valid_to,
        payment_channel=req.payment_channel,
        promo_code=req.promo_code.strip() if req.promo_code else None,
        activation_requirement=req.activation_requirement,
        terms_and_conditions=req.terms_and_conditions,
        source_url=req.source_url,
        source_name=req.source_name or "Manual Submission",
        source_evidence=req.source_evidence,
        extraction_confidence=req.extraction_confidence,
        verification_status=v_status,
        version=1,
        last_verified_timestamp=datetime.utcnow()
    )
    db.add(offer)
    await db.flush()

    audit = OfferAuditLog(
        offer_id=offer.id,
        action="USER_SUBMITTED" if not is_admin else "ADMIN_CREATED",
        actor_id=current_user.id,
        actor_name=current_user.full_name or current_user.email,
        actor_role="ADMIN" if is_admin else "USER",
        from_status="DISCOVERED",
        to_status=v_status,
        notes="Offer created through API portal."
    )
    db.add(audit)
    await db.commit()
    await db.refresh(offer)

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=req.eligible_card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

# ==============================================================================
# ADMINISTRATOR OFFER REVIEW DESK ENDPOINTS
# ==============================================================================

@admin_router.get("/review-queue", response_model=List[CardOfferResponse])
async def get_admin_review_queue(
    status_filter: Optional[str] = Query(None, description="PENDING_REVIEW, NEEDS_REVERIFICATION, VERIFIED, REJECTED, EXPIRED, ALL"),
    query: Optional[str] = Query(None, description="Search query across merchant, title, promo code"),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.get_admin_review_queue(
        db=db,
        status_filter=status_filter,
        query=query
    )

@admin_router.post("/{offer_id}/approve", response_model=CardOfferResponse)
async def admin_approve_offer(
    offer_id: str,
    req: AdminOfferApproveRequest = AdminOfferApproveRequest(),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.approve_offer(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            notes=req.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.post("/{offer_id}/reject", response_model=CardOfferResponse)
async def admin_reject_offer(
    offer_id: str,
    req: AdminOfferRejectRequest,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.reject_offer(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            rejection_reason=req.rejection_reason,
            notes=req.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.put("/{offer_id}", response_model=CardOfferResponse)
async def admin_edit_offer(
    offer_id: str,
    req: AdminOfferEditRequest,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.edit_offer(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            req=req
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.post("/{offer_id}/reverification", response_model=CardOfferResponse)
async def admin_trigger_reverification(
    offer_id: str,
    req: AdminReverificationRequest = AdminReverificationRequest(),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.trigger_reverification(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            reason=req.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.get("/{offer_id}/audit-trail", response_model=List[OfferAuditLogResponse])
async def get_offer_audit_trail(
    offer_id: str,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.get_offer_audit_trail(db=db, offer_id=offer_id)

@admin_router.post("/sync-discovery", response_model=DiscoverySyncResponse)
async def sync_discovery(
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stats = await DiscoveryPipeline.run_discovery_pipeline(
        db=db,
        actor_id=admin_user.id,
        actor_name=admin_user.full_name or admin_user.email
    )
    return DiscoverySyncResponse(
        discovered_count=stats["discovered_count"],
        extracted_count=stats["extracted_count"],
        pending_review_count=stats["pending_review_count"],
        reverification_triggered_count=stats["reverification_triggered_count"],
        unchanged_count=stats["unchanged_count"],
        errors=stats["errors"]
    )

