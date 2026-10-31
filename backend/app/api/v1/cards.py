from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
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
    query: Optional[str] = Query(None, description="Search by card name, bank, or variant"),
    bank: Optional[str] = Query(None, description="Filter by bank name"),
    network: Optional[str] = Query(None, description="Filter by network: VISA, MASTERCARD, RUPAY, AMEX, DINERS"),
    is_active: Optional[bool] = Query(True, description="Filter active/inactive cards"),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )

    if is_active is not None:
        stmt = stmt.where(CreditCard.is_active == is_active)

    if bank:
        stmt = stmt.where(CreditCard.bank_name.ilike(f"%{bank.strip()}%"))

    if network:
        stmt = stmt.where(CreditCard.network == network.upper().strip())

    if query:
        q_clean = f"%{query.strip()}%"
        stmt = stmt.where(
            or_(
                CreditCard.card_name.ilike(q_clean),
                CreditCard.bank_name.ilike(q_clean),
                CreditCard.card_variant.ilike(q_clean),
                CreditCard.network.ilike(q_clean),
                CreditCard.cardholder_name.ilike(q_clean),
                CreditCard.nickname.ilike(q_clean),
            )
        )

    stmt = stmt.order_by(CreditCard.created_at.desc())
    result = await db.execute(stmt)
    cards = result.scalars().all()
    return cards

@router.post("", response_model=CreditCardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    req: CreditCardCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Duplicate prevention: Check if user already registered this active card
    dup_stmt = select(CreditCard).where(
        CreditCard.user_id == current_user.id,
        CreditCard.is_active == True,
        CreditCard.bank_name.ilike(req.bank_name.strip()),
        CreditCard.card_name.ilike(req.card_name.strip()),
    )
    if req.last_four_digits:
        dup_stmt = dup_stmt.where(CreditCard.last_four_digits == req.last_four_digits)
    existing_dup = (await db.execute(dup_stmt)).first()
    if existing_dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have an active {req.bank_name} {req.card_name} registered" + (f" ending in {req.last_four_digits}." if req.last_four_digits else ".")
        )

    card = CreditCard(
        user_id=current_user.id,
        card_name=req.card_name.strip(),
        bank_name=req.bank_name.strip(),
        network=req.network,
        card_type=req.card_type,
        card_variant=req.card_variant.strip() if req.card_variant else None,
        cardholder_name=req.cardholder_name.strip() if req.cardholder_name else None,
        nickname=req.nickname.strip() if req.nickname else None,
        last_four_digits=req.last_four_digits,
        joining_fee=req.joining_fee,
        annual_fee=req.annual_fee,
        renewal_waiver_spend=req.renewal_waiver_spend,
        fee_waiver_condition_details=req.fee_waiver_condition_details,
        renewal_date=req.renewal_date,
        billing_cycle_day=req.billing_cycle_day,
        terms_source_url=req.terms_source_url,
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
            applicable_category=b.applicable_category,
            reward_percentage_or_points=b.reward_percentage_or_points,
            reward_basis=b.reward_basis,
            max_reward=b.max_reward,
            min_transaction_amount=b.min_transaction_amount,
            cap_amount=b.cap_amount,
            cap_period=b.cap_period,
            eligibility_restrictions=b.eligibility_restrictions,
            valid_from=b.valid_from,
            valid_to=b.valid_to,
            terms_and_conditions=b.terms_and_conditions,
            source_reference=b.source_reference,
            last_verified_date=b.last_verified_date or datetime.utcnow(),
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
    if req.card_variant is not None:
        card.card_variant = req.card_variant.strip()
    if req.cardholder_name is not None:
        card.cardholder_name = req.cardholder_name.strip() if req.cardholder_name else None
    if req.nickname is not None:
        card.nickname = req.nickname.strip() if req.nickname else None
    if req.last_four_digits is not None:
        card.last_four_digits = req.last_four_digits
    if req.joining_fee is not None:
        card.joining_fee = req.joining_fee
    if req.annual_fee is not None:
        card.annual_fee = req.annual_fee
    if req.renewal_waiver_spend is not None:
        card.renewal_waiver_spend = req.renewal_waiver_spend
    if req.fee_waiver_condition_details is not None:
        card.fee_waiver_condition_details = req.fee_waiver_condition_details
    if req.renewal_date is not None:
        card.renewal_date = req.renewal_date
    if req.billing_cycle_day is not None:
        card.billing_cycle_day = req.billing_cycle_day
    if req.terms_source_url is not None:
        card.terms_source_url = req.terms_source_url
    if req.is_active is not None:
        card.is_active = req.is_active

    # Optionally replace rules if provided
    if req.rules is not None:
        card.reward_rules = [
            CardRewardRule(
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
            ) for r in req.rules
        ]

    # Optionally replace benefits if provided
    if req.benefits is not None:
        card.benefits = [
            CardBenefit(
                card_id=card.id,
                benefit_type=b.benefit_type,
                title=b.title,
                description=b.description,
                applicable_category=b.applicable_category,
                reward_percentage_or_points=b.reward_percentage_or_points,
                reward_basis=b.reward_basis,
                max_reward=b.max_reward,
                min_transaction_amount=b.min_transaction_amount,
                cap_amount=b.cap_amount,
                cap_period=b.cap_period,
                eligibility_restrictions=b.eligibility_restrictions,
                valid_from=b.valid_from,
                valid_to=b.valid_to,
                terms_and_conditions=b.terms_and_conditions,
                source_reference=b.source_reference,
                last_verified_date=b.last_verified_date or datetime.utcnow(),
                annual_value_estimate=b.annual_value_estimate
            ) for b in req.benefits
        ]

    card.updated_at = datetime.utcnow()
    db.add(card)

    audit = AuditLog(
        user_id=current_user.id,
        action="CARD_UPDATED",
        status="SUCCESS",
        details_json=f'{{"card_id": "{card.id}", "card_name": "{card.card_name}"}}'
    )
    db.add(audit)

    await db.commit()
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
