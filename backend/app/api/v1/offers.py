from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.models.entities import Profile, CreditCard, CardOffer, AuditLog
from app.schemas.offer import CardOfferCreate, CardOfferUpdate, CardOfferResponse
from app.security.dependencies import get_current_user
from app.services.offers.offer_service import OfferService

router = APIRouter(prefix="/offers", tags=["Offers Discovery"])

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

    # Query offers via OfferService
    offers = await OfferService.list_offers(
        db=db,
        user_cards=user_cards,
        category=category,
        merchant_name=merchant,
        only_user_cards=only_user_cards,
        expiring_soon=expiring_soon,
        verification_status=verification_status,
        query=query
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
        verification_status=offer.verification_status,
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
        verification_status=req.verification_status,
        last_verified_timestamp=datetime.utcnow()
    )
    db.add(offer)

    audit = AuditLog(
        user_id=current_user.id,
        action="OFFER_CREATED",
        status="SUCCESS",
        details_json=f'{{"merchant": "{offer.merchant_name}", "title": "{offer.offer_title}"}}'
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
        verification_status=offer.verification_status,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )
