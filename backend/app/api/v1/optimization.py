from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Tuple, Any
from datetime import datetime
from decimal import Decimal
import json

from app.core.database import get_db
from app.models.entities import Profile, CreditCard, RewardAnalysis, Transaction, CardOffer
from app.schemas.optimization import (
    RecommendRequest,
    RecommendResponse,
    CompareRequest,
    CompareResponse,
    SimulateRequest,
    SimulateResponse
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

    # Compute current month's spent rewards per card for monthly cap tracking
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    tx_stmt = (
        select(Transaction.card_id, func.sum(Transaction.reward_earned_monetary))
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= month_start,
            Transaction.card_id.isnot(None)
        )
        .group_by(Transaction.card_id)
    )
    month_results = (await db.execute(tx_stmt)).all()
    card_monthly_spend_map = {row[0]: Decimal(str(row[1])) for row in month_results if row[0]}

    result = RewardOptimizationEngine.optimize_transaction(
        cards=user_cards,
        amount=req.amount,
        category_id=req.category_id,
        merchant_name=req.merchant_name,
        payment_channel=req.payment_channel,
        matched_card_offers_map=matched_card_offers_map,
        card_monthly_spend_map=card_monthly_spend_map,
        reward_basis_mode=req.reward_basis_mode or "NET_CHARGED_AMOUNT",
        language=req.language or current_user.preferred_language or "en"
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

@router.post("/simulate", response_model=SimulateResponse)
async def simulate_purchase_scenarios(
    req: SimulateRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    What-If Purchase Simulator:
    Reuses the exact same purchase intelligence engine across multiple purchase brackets.
    Determines optimal spend thresholds, cap limits, and tier changes.
    """
    card_query = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    if req.card_ids:
        card_query = card_query.where(CreditCard.id.in_(req.card_ids))

    target_cards = (await db.execute(card_query)).scalars().all()

    if not target_cards:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active credit cards available for simulation."
        )

    # Resolve simulation amounts
    test_amounts: List[Decimal] = []
    if req.amounts:
        test_amounts = [Decimal(str(a)) for a in req.amounts if Decimal(str(a)) > Decimal("0.00")]
    elif req.start_amount and req.end_amount and req.step_amount:
        curr = Decimal(str(req.start_amount))
        end = Decimal(str(req.end_amount))
        step = Decimal(str(req.step_amount))
        while curr <= end and len(test_amounts) < 25:
            test_amounts.append(curr)
            curr += step
    else:
        test_amounts = [Decimal("500.00"), Decimal("1000.00"), Decimal("2500.00"), Decimal("5000.00"), Decimal("10000.00")]

    test_amounts = sorted(list(set(test_amounts)))

    # Compute current month rewards per card
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    tx_stmt = (
        select(Transaction.card_id, func.sum(Transaction.reward_earned_monetary))
        .where(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= month_start,
            Transaction.card_id.isnot(None)
        )
        .group_by(Transaction.card_id)
    )
    month_results = (await db.execute(tx_stmt)).all()
    card_monthly_spend_map = {row[0]: Decimal(str(row[1])) for row in month_results if row[0]}

    # Pre-fetch applicable offers for each test amount
    offers_cache: Dict[Tuple[str, Decimal], List[Tuple[CardOffer, Decimal]]] = {}
    for amt in test_amounts:
        for card in target_cards:
            offers_cache[(card.id, amt)] = await OfferService.get_applicable_offers_for_card(
                db=db,
                card=card,
                amount=amt,
                category_id=req.category_id,
                merchant_name=req.merchant_name,
                payment_channel=req.payment_channel
            )

    def offers_generator(amt: Decimal) -> Dict[str, List[Any]]:
        return {c.id: offers_cache.get((c.id, amt), []) for c in target_cards}

    result = RewardOptimizationEngine.simulate_scenarios(
        cards=target_cards,
        category_id=req.category_id,
        amounts=test_amounts,
        merchant_name=req.merchant_name,
        payment_channel=req.payment_channel,
        matched_card_offers_map_generator=offers_generator,
        card_monthly_spend_map=card_monthly_spend_map,
        language=req.language or current_user.preferred_language or "en"
    )

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
            detail="At least 2 active credit cards from your portfolio are required for comparison."
        )

    now = datetime.utcnow()
    offer_stmt = (
        select(CardOffer)
        .where(
            CardOffer.verification_status.in_(["VERIFIED", "SAMPLE"]),
            CardOffer.valid_to >= now
        )
    )
    available_offers = (await db.execute(offer_stmt)).scalars().all()

    result = RewardOptimizationEngine.compare_cards(
        cards=cards,
        simulation_spend=req.simulation_spend,
        available_offers=available_offers,
        demo_mode=bool(req.demo_mode)
    )
    return result
