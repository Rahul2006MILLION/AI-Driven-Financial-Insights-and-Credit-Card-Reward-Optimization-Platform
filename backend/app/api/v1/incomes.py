import uuid
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
import statistics

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.models.entities import Profile, Income
from app.schemas.income import (
    IncomeCreate,
    IncomeUpdate,
    IncomeResponse,
    IncomeSummaryResponse,
    IncomeSourceBreakdown,
)
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/incomes", tags=["Income Management"])

def normalize_to_monthly(amount: Decimal, frequency: str) -> Decimal:
    """Normalizes an income amount with a given cadence to a monthly equivalent."""
    freq = frequency.upper()
    if freq == "MONTHLY":
        return amount
    elif freq == "WEEKLY":
        return (amount * Decimal("52") / Decimal("12")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    elif freq == "BI_WEEKLY":
        return (amount * Decimal("26") / Decimal("12")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    elif freq == "ONE_TIME":
        # Amortized over 3-month buffer when active in the current window
        return (amount / Decimal("3")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    elif freq == "IRREGULAR":
        return amount
    return amount

@router.get("", response_model=List[IncomeResponse])
async def list_incomes(
    frequency: Optional[str] = Query(None, pattern="^(MONTHLY|BI_WEEKLY|WEEKLY|IRREGULAR|ONE_TIME)$"),
    is_irregular: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lists all income streams belonging to the authenticated user."""
    conditions = [Income.user_id == current_user.id]
    if frequency:
        conditions.append(Income.frequency == frequency)
    if is_irregular is not None:
        conditions.append(Income.is_irregular == is_irregular)

    stmt = (
        select(Income)
        .where(and_(*conditions))
        .order_by(Income.received_date.desc())
        .limit(min(limit, 100))
        .offset(offset)
    )
    result = await db.execute(stmt)
    incomes = result.scalars().all()
    return incomes

@router.post("", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(
    req: IncomeCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Records a new income stream for the authenticated user."""
    income = Income(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        source_name=req.source_name.strip(),
        amount=req.amount,
        currency=req.currency,
        frequency=req.frequency,
        is_irregular=req.is_irregular or (req.frequency == "IRREGULAR"),
        received_date=req.received_date or datetime.utcnow(),
        expected_date=req.expected_date,
        notes=req.notes
    )
    db.add(income)
    await db.commit()
    await db.refresh(income)
    return income

@router.get("/summary", response_model=IncomeSummaryResponse)
async def get_income_summary(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Computes aggregated monthly income, regular vs irregular breakdown,
    rolling 90-day median income, and source contributions.
    """
    stmt = (
        select(Income)
        .where(Income.user_id == current_user.id)
        .order_by(Income.received_date.desc())
    )
    incomes = (await db.execute(stmt)).scalars().all()

    if not incomes:
        return IncomeSummaryResponse(
            total_monthly_income=Decimal("0.00"),
            regular_income=Decimal("0.00"),
            irregular_income=Decimal("0.00"),
            rolling_90d_median_monthly_income=None,
            income_sources_count=0,
            sources=[],
            has_income_data=False,
            data_sufficiency_explanation="No income streams recorded. Add your salary, freelance payments, or other earnings to unlock cash-flow analytics and savings guidance."
        )

    now = datetime.utcnow()
    ninety_days_ago = now - timedelta(days=90)

    total_monthly = Decimal("0.00")
    reg_monthly = Decimal("0.00")
    irreg_monthly = Decimal("0.00")
    sources_map: Dict[str, Dict[str, Any]] = {}

    for inc in incomes:
        # DEF-04: One-time incomes are only amortized into active monthly cash flow if received within the 90-day window.
        # Historical one-time incomes older than 90 days and future-dated one-time incomes do not contribute to ongoing monthly cash flow.
        if inc.frequency == "ONE_TIME":
            if ninety_days_ago <= inc.received_date <= now:
                monthly_equiv = normalize_to_monthly(inc.amount, inc.frequency)
            else:
                monthly_equiv = Decimal("0.00")
        else:
            monthly_equiv = normalize_to_monthly(inc.amount, inc.frequency)

        total_monthly += monthly_equiv
        if inc.is_irregular or inc.frequency in ("IRREGULAR", "ONE_TIME"):
            irreg_monthly += monthly_equiv
        else:
            reg_monthly += monthly_equiv

        src_key = inc.source_name.strip()
        if src_key not in sources_map:
            sources_map[src_key] = {
                "source_name": src_key,
                "amount": inc.amount,
                "frequency": inc.frequency,
                "is_irregular": inc.is_irregular,
                "monthly_equivalent": monthly_equiv
            }
        else:
            sources_map[src_key]["amount"] += inc.amount
            sources_map[src_key]["monthly_equivalent"] += monthly_equiv

    # Build sources breakdown with percentage
    sources_list: List[IncomeSourceBreakdown] = []
    for s_name, data in sources_map.items():
        pct = (
            ((data["monthly_equivalent"] / total_monthly) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            if total_monthly > Decimal("0.00")
            else Decimal("0.0")
        )
        sources_list.append(IncomeSourceBreakdown(
            source_name=s_name,
            amount=data["amount"],
            frequency=data["frequency"],
            is_irregular=data["is_irregular"],
            monthly_equivalent=data["monthly_equivalent"],
            percentage_of_total=pct
        ))
    sources_list.sort(key=lambda x: x.monthly_equivalent, reverse=True)

    # DEF-03: 90-day rolling monthly median income calculation
    # Requirements:
    # 1. Date boundary: actual received within [now - 90 days, now]. Exclude future expected income.
    # 2. Aggregate actual received income by calendar month (year, month).
    # 3. Calculate calendar month totals before calculating the median.
    # 4. Handle insufficient historical data without fabricating zero months.
    recent_received_incomes = [
        i for i in incomes
        if ninety_days_ago <= i.received_date <= now
    ]

    rolling_median = None
    monthly_buckets: Dict[Tuple[int, int], Decimal] = {}
    if recent_received_incomes:
        for i in recent_received_incomes:
            month_key = (i.received_date.year, i.received_date.month)
            if month_key not in monthly_buckets:
                monthly_buckets[month_key] = Decimal("0.00")
            monthly_buckets[month_key] += i.amount

        month_totals = list(monthly_buckets.values())
        if month_totals:
            median_val = statistics.median([float(t) for t in month_totals])
            rolling_median = Decimal(str(round(median_val, 2)))

    data_sufficiency = "COMPLETE" if len(incomes) >= 2 else "PARTIAL"
    expl = f"Calculated across {len(incomes)} recorded income stream(s)."
    if rolling_median is not None:
        expl += f" 90-day rolling monthly median is ₹{rolling_median:,.2f} based on {len(monthly_buckets)} active monthly period(s)."
    has_active_income = total_monthly > Decimal("0.00")
    if not has_active_income:
        expl = "No active recurring income streams. Historical one-time incomes older than 90 days are excluded from recurring cash flow."
    elif irreg_monthly > Decimal("0.00") and total_monthly > Decimal("0.00"):
        expl += f" Irregular income constitutes {((irreg_monthly / total_monthly) * Decimal('100.0')).quantize(Decimal('0.1'))}% of monthly inflow; using rolling median for resilience forecasting."

    return IncomeSummaryResponse(
        total_monthly_income=total_monthly,
        regular_income=reg_monthly,
        irregular_income=irreg_monthly,
        rolling_90d_median_monthly_income=rolling_median,
        income_sources_count=len(sources_list),
        sources=sources_list,
        has_income_data=has_active_income,
        data_sufficiency_explanation=expl
    )

@router.get("/{income_id}", response_model=IncomeResponse)
async def get_income(
    income_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves a single income stream by ID, enforcing strict tenant isolation."""
    stmt = select(Income).where(Income.id == income_id, Income.user_id == current_user.id)
    income = (await db.execute(stmt)).scalar_one_or_none()
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income record not found or access denied."
        )
    return income

@router.put("/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: str,
    req: IncomeUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates an income stream by ID, enforcing strict tenant isolation."""
    stmt = select(Income).where(Income.id == income_id, Income.user_id == current_user.id)
    income = (await db.execute(stmt)).scalar_one_or_none()
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income record not found or access denied."
        )

    if req.source_name is not None:
        income.source_name = req.source_name.strip()
    if req.amount is not None:
        income.amount = req.amount
    if req.currency is not None:
        income.currency = req.currency
    if req.frequency is not None:
        income.frequency = req.frequency
    if req.is_irregular is not None:
        income.is_irregular = req.is_irregular
    if req.received_date is not None:
        income.received_date = req.received_date
    if req.expected_date is not None:
        income.expected_date = req.expected_date
    if req.notes is not None:
        income.notes = req.notes

    income.updated_at = datetime.utcnow()
    db.add(income)
    await db.commit()
    await db.refresh(income)
    return income

@router.delete("/{income_id}", status_code=status.HTTP_200_OK)
async def delete_income(
    income_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deletes an income stream by ID, enforcing strict tenant isolation."""
    stmt = select(Income).where(Income.id == income_id, Income.user_id == current_user.id)
    income = (await db.execute(stmt)).scalar_one_or_none()
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income record not found or access denied."
        )

    await db.delete(income)
    await db.commit()
    return {"status": "SUCCESS", "deleted_id": income_id, "message": "Income record deleted successfully."}

