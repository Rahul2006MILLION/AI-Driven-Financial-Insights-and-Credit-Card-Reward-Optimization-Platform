from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any, Optional
from decimal import Decimal, ROUND_HALF_UP
from collections import defaultdict
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.entities import Profile, Transaction, CreditCard, Income, UserBudget, CreditScoreRecord
from app.schemas.analytics import (
    SpendingAnalyticsResponse,
    RewardAnalyticsResponse,
    FinancialHealthResponse,
    CategorySpend,
    MonthlySpend,
    PaymentMethodSpend,
    CreditScoreCreateRequest,
    CreditScoreUpdateRequest,
    CreditScoreResponse,
    CreditHealthSummaryResponse,
    AdvancedFinancialAnalyticsResponse,
)
from app.security.dependencies import get_current_user
from app.services.financial_health.health_engine import FinancialHealthEngine

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

def get_cibil_band(score: int) -> str:
    if score >= 750:
        return "Excellent"
    if score >= 700:
        return "Good"
    if score >= 650:
        return "Fair"
    return "Needs Attention"

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
    method_spend: Dict[str, Decimal] = defaultdict(Decimal)
    method_counts: Dict[str, int] = defaultdict(int)

    for t in txns:
        amt = Decimal(str(t.amount))
        rew = Decimal(str(t.reward_earned_monetary))
        total_spending += amt
        cat_spend[t.category_id] += amt
        cat_counts[t.category_id] += 1
        merchant_spend[t.merchant_name] += amt

        pm = getattr(t, "payment_method", None) or ("CREDIT_CARD" if t.card_id else "OTHER")
        method_spend[pm] += amt
        method_counts[pm] += 1

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

    payment_method_breakdown: List[PaymentMethodSpend] = []
    for pm, amt in method_spend.items():
        pct = ((amt / total_spending) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP) if total_spending > 0 else Decimal("0.0")
        payment_method_breakdown.append(PaymentMethodSpend(
            payment_method=pm,
            total_amount=amt,
            percentage_of_total=pct,
            transaction_count=method_counts[pm]
        ))
    payment_method_breakdown.sort(key=lambda x: x.total_amount, reverse=True)

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
        top_merchants=top_merchants,
        payment_method_breakdown=payment_method_breakdown
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

    stmt_budget = select(UserBudget).where(UserBudget.user_id == current_user.id)
    budget = (await db.execute(stmt_budget)).scalar_one_or_none()

    stmt_incomes = select(Income).where(Income.user_id == current_user.id)
    incomes = (await db.execute(stmt_incomes)).scalars().all()

    health_report = FinancialHealthEngine.analyze_health(
        transactions=txns,
        cards=cards,
        budget=budget,
        incomes=incomes,
        financial_pathway=getattr(current_user, "financial_pathway", "CREDIT_CARD")
    )
    return health_report


@router.post("/credit-score", response_model=CreditScoreResponse)
async def create_credit_score_record(
    req: CreditScoreCreateRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.score < 300 or req.score > 900:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CIBIL Score must be between 300 and 900"
        )

    band = get_cibil_band(req.score)
    rec_time = req.recorded_at or datetime.utcnow()
    record = CreditScoreRecord(
        user_id=current_user.id,
        score=req.score,
        score_band=band,
        source=req.source or "User-Provided (Manual Entry)",
        notes=req.notes,
        recorded_at=rec_time
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return CreditScoreResponse(
        id=record.id,
        score=record.score,
        score_band=record.score_band,
        source=record.source,
        recorded_at=record.recorded_at,
        notes=record.notes
    )


@router.put("/credit-score/{record_id}", response_model=CreditScoreResponse)
async def update_credit_score_record(
    record_id: str,
    req: CreditScoreUpdateRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.score < 300 or req.score > 900:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CIBIL Score must be between 300 and 900"
        )

    stmt = select(CreditScoreRecord).where(
        CreditScoreRecord.id == record_id,
        CreditScoreRecord.user_id == current_user.id
    )
    record = (await db.execute(stmt)).scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit score record not found or unauthorized"
        )

    record.score = req.score
    record.score_band = get_cibil_band(req.score)
    if req.notes is not None:
        record.notes = req.notes
    if req.recorded_at is not None:
        record.recorded_at = req.recorded_at

    await db.commit()
    await db.refresh(record)

    return CreditScoreResponse(
        id=record.id,
        score=record.score,
        score_band=record.score_band,
        source=record.source,
        recorded_at=record.recorded_at,
        notes=record.notes
    )


@router.delete("/credit-score/{record_id}")
async def delete_credit_score_record(
    record_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CreditScoreRecord).where(
        CreditScoreRecord.id == record_id,
        CreditScoreRecord.user_id == current_user.id
    )
    record = (await db.execute(stmt)).scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit score record not found or unauthorized"
        )

    await db.delete(record)
    await db.commit()
    return {"message": "Credit score record deleted successfully", "id": record_id}


@router.get("/credit-score", response_model=CreditHealthSummaryResponse)
async def get_credit_score_summary(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CreditScoreRecord)
        .where(CreditScoreRecord.user_id == current_user.id)
        .order_by(CreditScoreRecord.recorded_at.asc())
    )
    records = (await db.execute(stmt)).scalars().all()

    stmt_cards = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
    )
    cards = (await db.execute(stmt_cards)).scalars().all()

    stmt_tx = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id, Transaction.card_id.isnot(None))
    )
    card_txns = (await db.execute(stmt_tx)).scalars().all()

    tot_limit = sum(Decimal(str(getattr(c, "credit_limit", 0) or 0)) for c in cards)
    tot_bal = sum(Decimal(str(getattr(c, "current_balance", 0) or 0)) for c in cards)
    if tot_bal == Decimal("0.00") and card_txns:
        tot_bal = sum(Decimal(str(t.amount)) for t in card_txns)

    util_pct = None
    if tot_limit > Decimal("0.00"):
        util_pct = ((tot_bal / tot_limit) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    latest = records[-1] if records else None

    return CreditHealthSummaryResponse(
        current_score=latest.score if latest else None,
        score_band=latest.score_band if latest else None,
        source=latest.source if latest else None,
        last_updated=latest.recorded_at.strftime("%d %b %Y") if latest else None,
        score_history=[
            CreditScoreResponse(
                id=r.id,
                score=r.score,
                score_band=r.score_band,
                source=r.source,
                recorded_at=r.recorded_at,
                notes=r.notes
            )
            for r in records
        ],
        credit_utilization_pct=util_pct,
        total_credit_limit=tot_limit,
        total_outstanding_balance=tot_bal,
        cards_count=len(cards),
        financial_pathway=getattr(current_user, "financial_pathway", "CREDIT_CARD")
    )


@router.get("/advanced-statistical-health", response_model=AdvancedFinancialAnalyticsResponse)
async def get_advanced_statistical_health(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch transactions, incomes, budget, credit cards, credit score records
    stmt_tx = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.asc())
    )
    txns = (await db.execute(stmt_tx)).scalars().all()

    stmt_incomes = (
        select(Income)
        .where(Income.user_id == current_user.id)
        .order_by(Income.received_date.asc())
    )
    incomes = (await db.execute(stmt_incomes)).scalars().all()

    stmt_budget = select(UserBudget).where(UserBudget.user_id == current_user.id)
    budget = (await db.execute(stmt_budget)).scalar_one_or_none()

    stmt_cards = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
    )
    cards = (await db.execute(stmt_cards)).scalars().all()

    stmt_scores = (
        select(CreditScoreRecord)
        .where(CreditScoreRecord.user_id == current_user.id)
        .order_by(CreditScoreRecord.recorded_at.asc())
    )
    scores = (await db.execute(stmt_scores)).scalars().all()

    # 2. Total Income calculation from user's authentic records
    total_income = Decimal("0.00")
    for inc in incomes:
        total_income += Decimal(str(inc.amount))
    if total_income == Decimal("0.00") and budget and budget.monthly_income:
        total_income = Decimal(str(budget.monthly_income))

    # Total Expenses
    total_expenses = Decimal("0.00")
    cat_spend: Dict[str, Decimal] = defaultdict(Decimal)
    cat_txns_map: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    monthly_spends: Dict[str, Decimal] = defaultdict(Decimal)
    monthly_incomes: Dict[str, Decimal] = defaultdict(Decimal)

    for t in txns:
        amt = Decimal(str(t.amount))
        total_expenses += amt
        cat_spend[t.category_id] += amt
        cat_txns_map[t.category_id].append({
            "id": t.id,
            "merchant_name": t.merchant_name,
            "amount": float(amt),
            "transaction_date": t.transaction_date.strftime("%d %b %Y"),
            "payment_method": getattr(t, "payment_method", "CREDIT_CARD" if t.card_id else "OTHER")
        })
        m_key = t.transaction_date.strftime("%Y-%m")
        monthly_spends[m_key] += amt

    for inc in incomes:
        inc_amt = Decimal(str(inc.amount))
        dt = inc.received_date or inc.created_at
        if dt:
            m_key = dt.strftime("%Y-%m")
            monthly_incomes[m_key] += inc_amt

    # If incomes exist but monthly spread is empty or budget monthly income is used
    if not monthly_incomes and total_income > Decimal("0.00"):
        # Distribute baseline monthly income to active spend months
        for m_key in monthly_spends.keys():
            monthly_incomes[m_key] = total_income

    net_savings = total_income - total_expenses
    savings_rate = (
        ((net_savings / total_income) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        if total_income > Decimal("0.00")
        else Decimal("0.0")
    )

    distinct_months_count = max(1, len(set(list(monthly_spends.keys()) + list(monthly_incomes.keys()))))
    avg_monthly_spending = (total_expenses / Decimal(str(distinct_months_count))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    income_to_expense_ratio = (
        (total_income / total_expenses).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if total_expenses > Decimal("0.00")
        else (Decimal("1.00") if total_income > Decimal("0.00") else Decimal("0.00"))
    )

    overview_kpis = {
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "net_savings": float(net_savings),
        "savings_rate": float(savings_rate),
        "avg_monthly_spending": float(avg_monthly_spending),
        "income_to_expense_ratio": float(income_to_expense_ratio),
    }

    # 3. Category distribution with clickable drilldown
    category_distribution = []
    for cid, amt in cat_spend.items():
        pct = (
            ((amt / total_expenses) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            if total_expenses > Decimal("0.00")
            else Decimal("0.0")
        )
        category_distribution.append({
            "category_id": cid,
            "category_name": cid.replace("_", " ").title(),
            "amount": float(amt),
            "percentage": float(pct),
            "count": len(cat_txns_map[cid]),
            "transactions": cat_txns_map[cid][:50]
        })
    category_distribution.sort(key=lambda x: x["amount"], reverse=True)

    # 4. Multi-period Time Series (7D, 30D, 3M, 6M, 1Y)
    now = datetime.utcnow()
    if txns:
        latest_txn_date = max(t.transaction_date for t in txns)
        ref_date = max(now, latest_txn_date)
    else:
        ref_date = now

    def build_daily_series(days_count: int) -> List[Dict[str, Any]]:
        points = []
        for d in range(days_count - 1, -1, -1):
            target_day = (ref_date - timedelta(days=d)).date()
            day_label = target_day.strftime("%b %d")
            day_exp = sum(
                Decimal(str(t.amount))
                for t in txns
                if t.transaction_date.date() == target_day
            )
            day_inc = sum(
                Decimal(str(i.amount))
                for i in incomes
                if (i.received_date or i.created_at) and (i.received_date or i.created_at).date() == target_day
            )
            # Recurring monthly salary check
            if day_inc == Decimal("0.00"):
                for i in incomes:
                    if getattr(i, "frequency", None) == "MONTHLY":
                        pay_day = i.received_date.day if i.received_date else 1
                        if target_day.day == pay_day:
                            day_inc += Decimal(str(i.amount))
                if day_inc == Decimal("0.00") and not incomes and budget and budget.monthly_income and target_day.day == 1:
                    day_inc = Decimal(str(budget.monthly_income))

            sav = day_inc - day_exp
            s_rate = float(((sav / day_inc) * Decimal("100.0")).quantize(Decimal("0.1"))) if day_inc > 0 else 0.0
            points.append({
                "date": day_label,
                "income": float(day_inc),
                "expenses": float(day_exp),
                "savings": float(sav),
                "savings_rate": s_rate,
            })
        return points

    def build_monthly_series(months_count: int) -> List[Dict[str, Any]]:
        points = []
        curr_year = ref_date.year
        curr_month = ref_date.month
        month_keys = []
        for _ in range(months_count):
            month_keys.append((curr_year, curr_month))
            curr_month -= 1
            if curr_month == 0:
                curr_month = 12
                curr_year -= 1
        month_keys.reverse()

        for yr, mo in month_keys:
            dt = datetime(yr, mo, 1)
            m_label = dt.strftime("%b %Y")
            m_code = dt.strftime("%Y-%m")
            m_exp = monthly_spends.get(m_code, Decimal("0.00"))
            m_inc = monthly_incomes.get(m_code, Decimal("0.00"))
            if m_inc == Decimal("0.00"):
                recurring_monthly = sum(
                    Decimal(str(i.amount))
                    for i in incomes
                    if getattr(i, "frequency", "MONTHLY") in ("MONTHLY", "BI_WEEKLY")
                )
                if recurring_monthly > Decimal("0.00"):
                    m_inc = recurring_monthly
                elif budget and budget.monthly_income:
                    m_inc = Decimal(str(budget.monthly_income))

            sav = m_inc - m_exp
            s_rate = float(((sav / m_inc) * Decimal("100.0")).quantize(Decimal("0.1"))) if m_inc > 0 else 0.0
            points.append({
                "date": m_label,
                "income": float(m_inc),
                "expenses": float(m_exp),
                "savings": float(sav),
                "savings_rate": s_rate,
            })
        return points

    time_series = {
        "7d": build_daily_series(7),
        "30d": build_daily_series(30),
        "3m": build_monthly_series(3),
        "6m": build_monthly_series(6),
        "1y": build_monthly_series(12),
    }

    # 5. Monthly Insights
    all_months_sorted = sorted(set(list(monthly_spends.keys()) + list(monthly_incomes.keys())))
    highest_spend_month = None
    lowest_spend_month = None
    highest_savings_month = None

    if monthly_spends:
        highest_m = max(monthly_spends.items(), key=lambda x: x[1])
        lowest_m = min(monthly_spends.items(), key=lambda x: x[1])
        highest_spend_month = {
            "month": datetime.strptime(highest_m[0], "%Y-%m").strftime("%B %Y"),
            "amount": float(highest_m[1])
        }
        lowest_spend_month = {
            "month": datetime.strptime(lowest_m[0], "%Y-%m").strftime("%B %Y"),
            "amount": float(lowest_m[1])
        }

    monthly_savings_map = {}
    for m in all_months_sorted:
        monthly_savings_map[m] = monthly_incomes.get(m, Decimal("0.00")) - monthly_spends.get(m, Decimal("0.00"))

    if monthly_savings_map:
        best_sav_m = max(monthly_savings_map.items(), key=lambda x: x[1])
        highest_savings_month = {
            "month": datetime.strptime(best_sav_m[0], "%Y-%m").strftime("%B %Y"),
            "amount": float(best_sav_m[1])
        }

    mom_spending_change_pct = None
    if len(all_months_sorted) >= 2:
        last_m = all_months_sorted[-1]
        prev_m = all_months_sorted[-2]
        spend_last = monthly_spends.get(last_m, Decimal("0.00"))
        spend_prev = monthly_spends.get(prev_m, Decimal("0.00"))
        if spend_prev > Decimal("0.00"):
            mom_spending_change_pct = float(
                (((spend_last - spend_prev) / spend_prev) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            )

    savings_trend_direction = "neutral"
    if len(all_months_sorted) >= 2:
        last_sav = monthly_savings_map.get(all_months_sorted[-1], Decimal("0.00"))
        prev_sav = monthly_savings_map.get(all_months_sorted[-2], Decimal("0.00"))
        if last_sav > prev_sav:
            savings_trend_direction = "increasing"
        elif last_sav < prev_sav:
            savings_trend_direction = "decreasing"

    monthly_insights = {
        "highest_spending_month": highest_spend_month,
        "lowest_spending_month": lowest_spend_month,
        "highest_savings_month": highest_savings_month,
        "avg_monthly_expenditure": float(avg_monthly_spending),
        "mom_spending_change_pct": mom_spending_change_pct,
        "savings_trend_direction": savings_trend_direction,
    }

    # 6. Credit health summary
    tot_limit = sum(Decimal(str(getattr(c, "credit_limit", 0) or 0)) for c in cards)
    tot_bal = sum(Decimal(str(getattr(c, "current_balance", 0) or 0)) for c in cards)
    card_txns = [t for t in txns if t.card_id]
    if tot_bal == Decimal("0.00") and card_txns:
        tot_bal = sum(Decimal(str(t.amount)) for t in card_txns)

    util_pct = None
    if tot_limit > Decimal("0.00"):
        util_pct = ((tot_bal / tot_limit) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    latest_score = scores[-1] if scores else None
    credit_health = CreditHealthSummaryResponse(
        current_score=latest_score.score if latest_score else None,
        score_band=latest_score.score_band if latest_score else None,
        source=latest_score.source if latest_score else None,
        last_updated=latest_score.recorded_at.strftime("%d %b %Y") if latest_score else None,
        score_history=[
            CreditScoreResponse(
                id=s.id,
                score=s.score,
                score_band=s.score_band,
                source=s.source,
                recorded_at=s.recorded_at,
                notes=s.notes
            )
            for s in scores
        ],
        credit_utilization_pct=util_pct,
        total_credit_limit=tot_limit,
        total_outstanding_balance=tot_bal,
        cards_count=len(cards),
        financial_pathway=getattr(current_user, "financial_pathway", "CREDIT_CARD")
    )

    return AdvancedFinancialAnalyticsResponse(
        overview_kpis=overview_kpis,
        time_series=time_series,
        category_distribution=category_distribution,
        monthly_insights=monthly_insights,
        credit_health=credit_health
    )

