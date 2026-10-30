from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.entities import Profile, CreditCard, CardRewardRule, CardBenefit, AuditLog
from app.schemas.card import (
    CreditCardCreate,
    CreditCardUpdate,
    CreditCardResponse,
)
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/cards", tags=["Credit Cards"])

@router.get("", response_model=List[CreditCardResponse])
async def list_cards(
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
        .order_by(CreditCard.created_at.desc())
    )
    result = await db.execute(stmt)
    cards = result.scalars().all()
    return cards

@router.post("", response_model=CreditCardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    req: CreditCardCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    card = CreditCard(
        user_id=current_user.id,
        card_name=req.card_name.strip(),
        bank_name=req.bank_name.strip(),
        network=req.network,
        card_type=req.card_type,
        last_four_digits=req.last_four_digits,
        annual_fee=req.annual_fee,
        renewal_waiver_spend=req.renewal_waiver_spend,
        billing_cycle_day=req.billing_cycle_day,
        is_active=True
    )
    db.add(card)
    await db.flush()

    # Add rules
    if req.rules:
        for r in req.rules:
            rule_entity = CardRewardRule(
                card_id=card.id,
                category_id=r.category_id,
                merchant_pattern=r.merchant_pattern,
                reward_type=r.reward_type,
                reward_rate_percentage=r.reward_rate_percentage,
                point_monetary_value=r.point_monetary_value,
                min_transaction_amount=r.min_transaction_amount,
                max_reward_per_transaction=r.max_reward_per_transaction,
                monthly_cap_amount=r.monthly_cap_amount,
                is_excluded=r.is_excluded,
                exclusion_reason=r.exclusion_reason
            )
            db.add(rule_entity)
    else:
        # Default 1.0% cashback rule
        default_rule = CardRewardRule(
            card_id=card.id,
            category_id="all",
            reward_type="CASHBACK",
            reward_rate_percentage=1.0,
            point_monetary_value=1.0,
            min_transaction_amount=0.0,
            is_excluded=False
        )
        db.add(default_rule)

    # Add benefits
    for b in req.benefits:
        ben_entity = CardBenefit(
            card_id=card.id,
            benefit_type=b.benefit_type,
            title=b.title,
            description=b.description,
            annual_value_estimate=b.annual_value_estimate
        )
        db.add(ben_entity)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="CARD_CREATED",
        status="SUCCESS",
        details_json=f'{{"card_name": "{card.card_name}", "bank_name": "{card.bank_name}"}}'
    )
    db.add(audit)

    await db.commit()

    # Reload with relationships
    stmt = (
        select(CreditCard)
        .where(CreditCard.id == card.id)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    fresh = (await db.execute(stmt)).scalar_one()
    return fresh

@router.get("/{card_id}", response_model=CreditCardResponse)
async def get_card(
    card_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforces strict ownership check (IDOR protection)
    stmt = (
        select(CreditCard)
        .where(CreditCard.id == card_id, CreditCard.user_id == current_user.id)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    card = (await db.execute(stmt)).scalar_one_or_none()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found or unauthorized access."
        )
    return card

@router.put("/{card_id}", response_model=CreditCardResponse)
async def update_card(
    card_id: str,
    req: CreditCardUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CreditCard)
        .where(CreditCard.id == card_id, CreditCard.user_id == current_user.id)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    card = (await db.execute(stmt)).scalar_one_or_none()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found or unauthorized access."
        )

    if req.card_name is not None:
        card.card_name = req.card_name.strip()
    if req.bank_name is not None:
        card.bank_name = req.bank_name.strip()
    if req.network is not None:
        card.network = req.network
    if req.last_four_digits is not None:
        card.last_four_digits = req.last_four_digits
    if req.annual_fee is not None:
        card.annual_fee = req.annual_fee
    if req.renewal_waiver_spend is not None:
        card.renewal_waiver_spend = req.renewal_waiver_spend
    if req.billing_cycle_day is not None:
        card.billing_cycle_day = req.billing_cycle_day
    if req.is_active is not None:
        card.is_active = req.is_active

    card.updated_at = datetime.utcnow()
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CreditCard).where(CreditCard.id == card_id, CreditCard.user_id == current_user.id)
    card = (await db.execute(stmt)).scalar_one_or_none()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found or unauthorized access."
        )

    # Soft delete / deactivation to preserve historical transaction integrity
    card.is_active = False
    card.updated_at = datetime.utcnow()
    db.add(card)

    audit = AuditLog(
        user_id=current_user.id,
        action="CARD_DELETED",
        status="SUCCESS",
        details_json=f'{{"card_id": "{card_id}"}}'
    )
    db.add(audit)

    await db.commit()
    return None
