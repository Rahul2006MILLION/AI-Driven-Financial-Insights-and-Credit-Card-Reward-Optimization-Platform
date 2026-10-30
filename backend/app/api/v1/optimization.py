from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import json

from app.core.database import get_db
from app.models.entities import Profile, CreditCard, RewardAnalysis, AuditLog
from app.schemas.optimization import (
    RecommendRequest,
    RecommendResponse,
    CompareRequest,
    CompareResponse,
)
from app.security.dependencies import get_current_user
from app.services.reward_optimization.engine import RewardOptimizationEngine
from app.services.offers.offer_service import OfferService

router = APIRouter(prefix="/optimization", tags=["Reward Optimization"])

@router.post("/recommend", response_model=RecommendResponse)
async def recommend_card(
    req: RecommendRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    user_cards = (await db.execute(stmt)).scalars().all()

    # Pre-fetch applicable promotional offers for each card
    matched_card_offers_map = {}
    for card in user_cards:
        matched_card_offers_map[card.id] = await OfferService.get_applicable_offers_for_card(
            db=db,
            card=card,
            amount=req.amount,
            category_id=req.category_id,
            merchant_name=req.merchant_name,
            payment_channel=req.payment_channel
        )

    result = RewardOptimizationEngine.optimize_transaction(
        cards=user_cards,
        amount=req.amount,
        category_id=req.category_id,
        merchant_name=req.merchant_name,
        payment_channel=req.payment_channel,
        matched_card_offers_map=matched_card_offers_map,
        language=current_user.preferred_language or "en"
    )

    # Persist audit record in reward_analysis table if card recommended
    if result.recommended_card:
        analysis = RewardAnalysis(
            user_id=current_user.id,
            transaction_amount=req.amount,
            category_id=req.category_id,
            merchant_name=req.merchant_name,
            recommended_card_id=result.recommended_card.card_id,
            recommended_card_name=result.recommended_card.card_name,
            expected_monetary_reward=result.recommended_card.expected_reward_monetary,
            effective_reward_rate=result.recommended_card.effective_rate_percentage,
            calculation_breakdown_json=json.dumps([s.model_dump(mode="json") for s in result.recommended_card.breakdown_steps]),
            alternatives_json=json.dumps([a.model_dump(mode="json") for a in result.alternatives])
        )
        db.add(analysis)
        await db.commit()

    return result

@router.post("/compare", response_model=CompareResponse)
async def compare_cards(
    req: CompareRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CreditCard)
        .where(
            CreditCard.id.in_(req.card_ids),
            CreditCard.user_id == current_user.id,
            CreditCard.is_active == True
        )
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    cards = (await db.execute(stmt)).scalars().all()
    if len(cards) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comparison requires at least 2 valid active cards owned by your account."
        )

    res = RewardOptimizationEngine.compare_cards(
        cards=cards,
        simulation_spend=req.simulation_spend
    )
    return res
