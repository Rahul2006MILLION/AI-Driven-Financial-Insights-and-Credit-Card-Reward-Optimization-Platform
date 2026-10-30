from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any
from decimal import Decimal, ROUND_HALF_UP
from collections import defaultdict
from datetime import datetime

from app.core.database import get_db
from app.models.entities import Profile, Transaction, CreditCard
from app.schemas.analytics import (
    SpendingAnalyticsResponse,
    RewardAnalyticsResponse,
    FinancialHealthResponse,
    CategorySpend,
    MonthlySpend,
)
from app.security.dependencies import get_current_user
from app.services.financial_health.health_engine import FinancialHealthEngine

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

@router.get("/spending", response_model=SpendingAnalyticsResponse)
async def get_spending_analytics(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.asc())
    )
    txns = (await db.execute(stmt)).scalars().all()

    total_spending = Decimal("0.00")
    cat_spend: Dict[str, Decimal] = defaultdict(Decimal)
    cat_counts: Dict[str, int] = defaultdict(int)
    monthly_data: Dict[str, Dict[str, Decimal]] = defaultdict(lambda: {"spend": Decimal("0.00"), "rewards": Decimal("0.00"), "count": 0})
    merchant_spend: Dict[str, Decimal] = defaultdict(Decimal)

    for t in txns:
        amt = Decimal(str(t.amount))
        rew = Decimal(str(t.reward_earned_monetary))
        total_spending += amt
        cat_spend[t.category_id] += amt
        cat_counts[t.category_id] += 1
        merchant_spend[t.merchant_name] += amt

        month_key = t.transaction_date.strftime("%Y-%m")
        monthly_data[month_key]["spend"] += amt
        monthly_data[month_key]["rewards"] += rew
        monthly_data[month_key]["count"] += 1

    category_breakdown: List[CategorySpend] = []
    for cat_id, amt in cat_spend.items():
        pct = ((amt / total_spending) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP) if total_spending > 0 else Decimal("0.0")
        category_breakdown.append(CategorySpend(
            category_id=cat_id,
            category_name=cat_id.replace("_", " ").title(),
            total_amount=amt,
            percentage_of_total=pct,
            transaction_count=cat_counts[cat_id]
        ))
    category_breakdown.sort(key=lambda x: x.total_amount, reverse=True)

    monthly_trend: List[MonthlySpend] = []
    for m_key in sorted(monthly_data.keys()):
        monthly_trend.append(MonthlySpend(
            month=m_key,
            total_amount=monthly_data[m_key]["spend"],
            rewards_earned=monthly_data[m_key]["rewards"],
            transaction_count=monthly_data[m_key]["count"]
        ))

    top_merchants = [
        {"merchant_name": m, "amount": float(amt)}
        for m, amt in sorted(merchant_spend.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    return SpendingAnalyticsResponse(
        total_spending=total_spending,
        total_transactions=len(txns),
        category_breakdown=category_breakdown,
        monthly_trend=monthly_trend,
        top_merchants=top_merchants
    )

@router.get("/rewards", response_model=RewardAnalyticsResponse)
async def get_reward_analytics(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
    )
    txns = (await db.execute(stmt)).scalars().all()

    total_rewards = Decimal("0.00")
    optimal_rewards = Decimal("0.00")
    card_rewards: Dict[str, Decimal] = defaultdict(Decimal)

    for t in txns:
        r_actual = Decimal(str(t.reward_earned_monetary))
        r_opt = Decimal(str(t.potential_optimal_reward))
        total_rewards += r_actual
        optimal_rewards += r_opt
        c_id = t.card_id or "Unassigned"
        card_rewards[c_id] += r_actual

    leakage = max(Decimal("0.00"), optimal_rewards - total_rewards)
    efficiency = ((total_rewards / optimal_rewards) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP) if optimal_rewards > 0 else Decimal("100.0")

    # Fetch card names for presentation
    stmt_cards = select(CreditCard).where(CreditCard.user_id == current_user.id)
    cards = (await db.execute(stmt_cards)).scalars().all()
    card_name_map = {c.id: c.card_name for c in cards}

    rewards_by_card = [
        {
            "card_id": c_id,
            "card_name": card_name_map.get(c_id, "Other / Direct"),
            "rewards_earned": float(amt)
        }
        for c_id, amt in card_rewards.items()
    ]

    return RewardAnalyticsResponse(
        total_rewards_earned=total_rewards,
        total_optimal_possible=optimal_rewards,
        reward_leakage_amount=leakage,
        optimization_efficiency_rate=efficiency,
        rewards_by_card=rewards_by_card
    )

@router.get("/financial-health", response_model=FinancialHealthResponse)
async def get_financial_health(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch transactions and cards
    stmt_tx = select(Transaction).where(Transaction.user_id == current_user.id)
    txns = (await db.execute(stmt_tx)).scalars().all()

    stmt_cards = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
        .options(selectinload(CreditCard.benefits))
    )
    cards = (await db.execute(stmt_cards)).scalars().all()

    health_report = FinancialHealthEngine.analyze_health(transactions=txns, cards=cards)
    return health_report
