from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
import json
import re

from app.core.database import get_db
from app.models.entities import Profile, Transaction, CreditCard, AuditLog
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionFeedbackUpdate,
    TransactionFeedbackSummaryResponse
)
from app.security.dependencies import get_current_user
from app.services.reward_optimization.engine import RewardOptimizationEngine

router = APIRouter(prefix="/transactions", tags=["Transactions"])

def serialize_feedback_notes(
    user_notes: Optional[str],
    status: str,
    actual: Optional[Decimal],
    predicted: Decimal,
    discrepancy: Optional[str]
) -> str:
    metadata = {
        "status": status,
        "actual": str(actual) if actual is not None else None,
        "predicted": str(predicted),
        "discrepancy": discrepancy
    }
    base_note = user_notes or ""
    # Strip any previous feedback comment tag
    clean_base = re.sub(r"<!--FEEDBACK:.*?-->", "", base_note).strip()
    return f"<!--FEEDBACK:{json.dumps(metadata)}--> {clean_base}".strip()

def parse_transaction_response(txn: Transaction) -> TransactionResponse:
    notes_raw = txn.notes or ""
    actual = None
    predicted = txn.reward_earned_monetary
    status_val = "CONFIRMED"
    discrepancy = None
    clean_notes = notes_raw

    match = re.search(r"<!--FEEDBACK:(.*?)-->", notes_raw)
    if match:
        try:
            meta = json.loads(match.group(1))
            status_val = meta.get("status", "CONFIRMED")
            if meta.get("actual") is not None:
                actual = Decimal(str(meta["actual"]))
            if meta.get("predicted") is not None:
                predicted = Decimal(str(meta["predicted"]))
            discrepancy = meta.get("discrepancy")
            clean_notes = re.sub(r"<!--FEEDBACK:.*?-->", "", notes_raw).strip() or None
        except Exception:
            pass
    elif txn.reward_earned_monetary > Decimal("0.00"):
        actual = txn.reward_earned_monetary
        predicted = txn.reward_earned_monetary
        status_val = "CONFIRMED"
    else:
        status_val = "PENDING"

    variance = None
    if actual is not None and predicted is not None:
        variance = (actual - predicted).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return TransactionResponse(
        id=txn.id,
        user_id=txn.user_id,
        card_id=txn.card_id,
        category_id=txn.category_id,
        merchant_name=txn.merchant_name,
        amount=txn.amount,
        currency=txn.currency,
        transaction_date=txn.transaction_date,
        is_recurring=txn.is_recurring,
        reward_earned_monetary=txn.reward_earned_monetary,
        potential_optimal_reward=txn.potential_optimal_reward,
        optimal_card_id=txn.optimal_card_id,
        actual_reward_earned=actual,
        predicted_reward=predicted,
        reward_variance=variance,
        reward_status=status_val,
        discrepancy_reason=discrepancy,
        notes=clean_notes,
        created_at=txn.created_at
    )

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
    return [parse_transaction_response(t) for t in txns]

@router.get("/feedback/summary", response_model=TransactionFeedbackSummaryResponse)
async def get_transaction_feedback_summary(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns aggregated reward reconciliation analytics and prediction accuracy metrics.
    Compares predicted rewards against statement-confirmed actual rewards.
    """
    stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    txns = (await db.execute(stmt)).scalars().all()

    total_tracked = len(txns)
    confirmed_count = 0
    pending_count = 0
    discrepancy_count = 0
    accurate_predictions_count = 0

    total_predicted = Decimal("0.00")
    total_actual = Decimal("0.00")
    total_variance = Decimal("0.00")
    discrepancy_reasons: Dict[str, int] = {}

    for t in txns:
        parsed = parse_transaction_response(t)
        pred = parsed.predicted_reward or Decimal("0.00")
        act = parsed.actual_reward_earned

        total_predicted += pred

        if parsed.reward_status == "CONFIRMED":
            confirmed_count += 1
            if act is not None:
                total_actual += act
                diff = act - pred
                total_variance += diff
                if diff == Decimal("0.00"):
                    accurate_predictions_count += 1
                else:
                    discrepancy_count += 1
                    reason = parsed.discrepancy_reason or "VARIANCE_UNSPECIFIED"
                    discrepancy_reasons[reason] = discrepancy_reasons.get(reason, 0) + 1
        elif parsed.reward_status == "DISCREPANCY":
            discrepancy_count += 1
            if act is not None:
                total_actual += act
                total_variance += (act - pred)
            reason = parsed.discrepancy_reason or "DISCREPANCY_REPORTED"
            discrepancy_reasons[reason] = discrepancy_reasons.get(reason, 0) + 1
        else:
            pending_count += 1

    total_evaluated = confirmed_count + discrepancy_count
    if total_evaluated > 0:
        accuracy_pct = ((Decimal(accurate_predictions_count) / Decimal(total_evaluated)) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    else:
        accuracy_pct = Decimal("100.0")

    return TransactionFeedbackSummaryResponse(
        total_transactions_tracked=total_tracked,
        confirmed_count=confirmed_count,
        pending_count=pending_count,
        discrepancy_count=discrepancy_count,
        prediction_accuracy_percentage=accuracy_pct,
        total_predicted_rewards=total_predicted.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        total_actual_rewards=total_actual.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        total_variance=total_variance.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        discrepancy_reasons_breakdown=discrepancy_reasons
    )

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

    # Calculate predicted reward on the selected card (if provided)
    predicted_reward = Decimal("0.00")
    if req.card_id:
        card = next((c for c in user_cards if c.id == req.card_id), None)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit card not found or unauthorized access."
            )
        eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=req.amount,
            category_id=req.category_id,
            merchant_name=req.merchant_name
        )
        predicted_reward = eval_res.expected_reward_monetary

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
        predicted_reward = optimal_reward

    # Handle Actual vs Predicted Reward
    if req.actual_reward_earned is not None:
        reward_earned = req.actual_reward_earned
        status_val = req.reward_status or ("CONFIRMED" if reward_earned == predicted_reward else "DISCREPANCY")
    else:
        reward_earned = predicted_reward
        status_val = req.reward_status or "PENDING"

    final_notes = serialize_feedback_notes(
        user_notes=req.notes,
        status=status_val,
        actual=req.actual_reward_earned,
        predicted=predicted_reward,
        discrepancy=req.discrepancy_reason
    )

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
        notes=final_notes
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)

    return parse_transaction_response(txn)

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a single transaction by ID, strictly enforcing user tenant isolation.
    """
    stmt = select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
    txn = (await db.execute(stmt)).scalar_one_or_none()
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found or unauthorized access."
        )
    return parse_transaction_response(txn)

@router.put("/{transaction_id}/feedback", response_model=TransactionResponse)
async def update_transaction_feedback(
    transaction_id: str,
    req: TransactionFeedbackUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits user statement feedback on actual rewards received from the bank.
    Captures variance from predicted rewards and records discrepancy rationale.
    """
    stmt = select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
    txn = (await db.execute(stmt)).scalar_one_or_none()
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found or unauthorized access."
        )

    parsed = parse_transaction_response(txn)
    predicted = parsed.predicted_reward or txn.reward_earned_monetary
    variance = (req.actual_reward_earned - predicted).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    status_val = req.reward_status
    if variance != Decimal("0.00") and status_val == "CONFIRMED":
        status_val = "DISCREPANCY"

    discrepancy = req.discrepancy_reason
    if variance != Decimal("0.00") and not discrepancy:
        discrepancy = "MERCHANT_MCC_MISMATCH"

    notes_text = req.notes if req.notes is not None else parsed.notes
    txn.notes = serialize_feedback_notes(
        user_notes=notes_text,
        status=status_val,
        actual=req.actual_reward_earned,
        predicted=predicted,
        discrepancy=discrepancy
    )
    txn.reward_earned_monetary = req.actual_reward_earned

    db.add(txn)
    await db.commit()
    await db.refresh(txn)

    return parse_transaction_response(txn)

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
