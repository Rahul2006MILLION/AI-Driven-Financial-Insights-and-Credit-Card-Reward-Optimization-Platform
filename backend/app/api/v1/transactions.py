from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.models.entities import Profile, Transaction, CreditCard, AuditLog
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.security.dependencies import get_current_user
from app.services.reward_optimization.engine import RewardOptimizationEngine

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    limit: int = 50,
    offset: int = 0,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc())
        .limit(min(limit, 100))
        .offset(offset)
    )
    result = await db.execute(stmt)
    txns = result.scalars().all()
    return txns

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    req: TransactionCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch all user active cards with rules for optimization
    stmt = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    user_cards = (await db.execute(stmt)).scalars().all()

    # Calculate actual reward earned on the selected card (if provided)
    reward_earned = Decimal("0.00")
    if req.card_id:
        card = next((c for c in user_cards if c.id == req.card_id), None)
        if card:
            eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
                card=card,
                amount=req.amount,
                category_id=req.category_id,
                merchant_name=req.merchant_name
            )
            reward_earned = eval_res.expected_reward_monetary

    # Calculate optimal reward possible across all user cards
    best_opt = RewardOptimizationEngine.optimize_transaction(
        cards=user_cards,
        amount=req.amount,
        category_id=req.category_id,
        merchant_name=req.merchant_name
    )

    optimal_reward = best_opt.recommended_card.expected_reward_monetary if best_opt.recommended_card else Decimal("0.00")
    optimal_card_id = best_opt.recommended_card.card_id if best_opt.recommended_card else None

    # If user did not specify a card, default to the optimal one
    chosen_card_id = req.card_id if req.card_id else optimal_card_id
    if not req.card_id:
        reward_earned = optimal_reward

    txn = Transaction(
        user_id=current_user.id,
        card_id=chosen_card_id,
        category_id=req.category_id.strip().lower(),
        merchant_name=req.merchant_name.strip(),
        amount=req.amount,
        currency=req.currency,
        transaction_date=req.transaction_date or datetime.utcnow(),
        is_recurring=req.is_recurring,
        reward_earned_monetary=reward_earned,
        potential_optimal_reward=optimal_reward,
        optimal_card_id=optimal_card_id,
        notes=req.notes
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return txn

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
    txn = (await db.execute(stmt)).scalar_one_or_none()
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found or unauthorized access."
        )

    await db.delete(txn)
    await db.commit()
    return None
