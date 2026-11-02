from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
import json
import re
import uuid

from app.core.database import get_db
from app.models.entities import Profile, Transaction, CreditCard, AuditLog
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionFeedbackUpdate,
    TransactionFeedbackSummaryResponse,
    TransactionImportPreviewRow,
    TransactionImportPreviewResponse,
    TransactionImportCommitRequest,
    TransactionImportCommitResponse,
    TransactionImportCommitRow
)
from app.security.dependencies import get_current_user
from app.services.reward_optimization.engine import RewardOptimizationEngine
from app.services.reward_optimization.merchant_normalizer import MerchantNormalizer
from app.services.statement_parser.csv_parser import CSVStatementParser
from app.services.statement_parser.deduplication import DeduplicationEngine

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
        payment_method=getattr(txn, "payment_method", "CREDIT_CARD" if txn.card_id else "UPI"),
        reward_earned_monetary=txn.reward_earned_monetary,
        potential_optimal_reward=txn.potential_optimal_reward,
        optimal_card_id=txn.optimal_card_id,
        raw_description=txn.raw_description,
        reference_number=txn.reference_number,
        deduplication_hash=txn.deduplication_hash,
        import_batch_id=txn.import_batch_id,
        category_confidence=txn.category_confidence,
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

# --- CSV Statement Ingestion Endpoints ---

@router.post("/import/preview", response_model=TransactionImportPreviewResponse)
async def preview_csv_import(
    file: UploadFile = File(...),
    card_id: Optional[str] = Form(None),
    bank_format: Optional[str] = Form("AUTO"),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Parses an uploaded credit card statement CSV, performs merchant normalization,
    evaluates duplicate status against existing transactions, and computes rewards.
    Returns preview rows with validation errors and ambiguous flags for user reconciliation.
    """
    # 1. Validate file extension
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are supported for statement import."
        )

    # 2. Read and validate size (5 MB limit)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file exceeds maximum allowed size of 5MB."
        )
    if not contents or not contents.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty."
        )

    # 3. Decode safely
    try:
        content_str = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            content_str = contents.decode("latin-1")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to decode CSV file. Please ensure it is saved in UTF-8 or standard CSV format."
            )

    # 4. Parse CSV
    detected_format, parsed_rows = CSVStatementParser.parse_csv_content(content_str, forced_format=bank_format)

    # 5. Fetch user active cards with rules & benefits
    stmt_cards = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    user_cards = (await db.execute(stmt_cards)).scalars().all()

    target_card = None
    if card_id:
        target_card = next((c for c in user_cards if c.id == card_id), None)
        if not target_card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target credit card not found or unauthorized access."
            )

    # 6. Fetch existing transactions to evaluate duplicates
    stmt_tx = select(Transaction).where(Transaction.user_id == current_user.id)
    existing_txns = (await db.execute(stmt_tx)).scalars().all()

    preview_rows: List[TransactionImportPreviewRow] = []
    valid_count = 0
    duplicate_count = 0
    ambiguous_count = 0
    invalid_count = 0
    excluded_count = 0
    total_spend = Decimal("0.00")
    total_predicted_rewards = Decimal("0.00")

    for r in parsed_rows:
        temp_id = uuid.uuid4().hex

        if r.is_credit:
            excluded_count += 1
            preview_rows.append(TransactionImportPreviewRow(
                temp_id=temp_id,
                row_index=r.row_index,
                transaction_date=r.parsed_date or datetime.utcnow(),
                raw_description=r.raw_description,
                merchant_name=r.raw_description or "Credit / Payment",
                amount=r.parsed_amount or Decimal("0.00"),
                currency=r.currency,
                reference_number=r.reference_number,
                category_id="other",
                category_confidence=Decimal("0.00"),
                requires_category_review=False,
                duplicate_status="EXCLUDED",
                duplicate_reason="Statement payment/credit row; excluded from spend tracking.",
                deduplication_hash="",
                predicted_reward=Decimal("0.00"),
                potential_optimal_reward=Decimal("0.00"),
                optimal_card_id=None,
                selected_for_import=False,
                is_valid=False,
                error_message="Payment/Credit row excluded"
            ))
            continue

        if not r.is_valid:
            invalid_count += 1
            preview_rows.append(TransactionImportPreviewRow(
                temp_id=temp_id,
                row_index=r.row_index,
                transaction_date=r.parsed_date or datetime.utcnow(),
                raw_description=r.raw_description,
                merchant_name=r.raw_description or "Unknown",
                amount=r.parsed_amount or Decimal("0.00"),
                currency=r.currency,
                reference_number=r.reference_number,
                category_id="other",
                category_confidence=Decimal("0.00"),
                requires_category_review=True,
                duplicate_status="INVALID",
                duplicate_reason=None,
                deduplication_hash="",
                predicted_reward=Decimal("0.00"),
                potential_optimal_reward=Decimal("0.00"),
                optimal_card_id=None,
                selected_for_import=False,
                is_valid=False,
                error_message=r.error_message
            ))
            continue

        # Evaluate duplicate state
        dup_status, dup_reason, dedup_hash = DeduplicationEngine.evaluate_row_duplicates(
            user_id=current_user.id,
            row=r,
            card_id=card_id,
            existing_txns=existing_txns
        )

        if dup_status == "EXACT_DUPLICATE":
            duplicate_count += 1
            selected = False
        elif dup_status == "AMBIGUOUS_DUPLICATE":
            ambiguous_count += 1
            selected = True
            valid_count += 1
        else:
            valid_count += 1
            selected = True

        # DEF-06: Resolve payment method for preview row
        raw_desc_lower = r.raw_description.lower()
        if target_card:
            row_payment_method = "CREDIT_CARD"
        elif "upi" in raw_desc_lower or "@" in raw_desc_lower:
            row_payment_method = "UPI"
        elif any(k in raw_desc_lower for k in ["neft", "rtgs", "imps", "transfer", "bank"]):
            row_payment_method = "BANK_TRANSFER"
        elif any(k in raw_desc_lower for k in ["pos", "atm", "debit"]):
            row_payment_method = "DEBIT_CARD"
        elif current_user.financial_pathway == "NO_CREDIT_CARD":
            row_payment_method = "BANK_TRANSFER"
        elif user_cards:
            row_payment_method = "CREDIT_CARD"
        else:
            row_payment_method = "OTHER"

        # Reward evaluation
        pred_reward = Decimal("0.00")
        opt_reward = Decimal("0.00")
        opt_card_id = None

        if row_payment_method == "CREDIT_CARD":
            if target_card:
                eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
                    card=target_card,
                    amount=r.parsed_amount,
                    category_id=r.category_id,
                    merchant_name=r.canonical_merchant
                )
                pred_reward = eval_res.expected_reward_monetary

            best_opt = RewardOptimizationEngine.optimize_transaction(
                cards=user_cards,
                amount=r.parsed_amount,
                category_id=r.category_id,
                merchant_name=r.canonical_merchant
            )
            opt_reward = best_opt.recommended_card.expected_reward_monetary if best_opt.recommended_card else Decimal("0.00")
            opt_card_id = best_opt.recommended_card.card_id if best_opt.recommended_card else None

            if not target_card:
                pred_reward = opt_reward

        if selected and dup_status != "EXACT_DUPLICATE":
            total_spend += r.parsed_amount
            total_predicted_rewards += pred_reward

        preview_rows.append(TransactionImportPreviewRow(
            temp_id=temp_id,
            row_index=r.row_index,
            transaction_date=r.parsed_date,
            raw_description=r.raw_description,
            merchant_name=r.canonical_merchant,
            amount=r.parsed_amount,
            currency=r.currency,
            reference_number=r.reference_number,
            category_id=r.category_id,
            category_confidence=r.category_confidence,
            requires_category_review=r.requires_category_review,
            duplicate_status=dup_status,
            duplicate_reason=dup_reason,
            deduplication_hash=dedup_hash,
            payment_method=row_payment_method,
            predicted_reward=pred_reward,
            potential_optimal_reward=opt_reward,
            optimal_card_id=opt_card_id,
            selected_for_import=selected,
            is_valid=True,
            error_message=None
        ))

    return TransactionImportPreviewResponse(
        filename=file.filename,
        detected_format=detected_format,
        total_rows_parsed=len(parsed_rows),
        valid_rows_count=valid_count,
        duplicate_rows_count=duplicate_count,
        ambiguous_rows_count=ambiguous_count,
        invalid_rows_count=invalid_count,
        excluded_rows_count=excluded_count,
        total_spend_amount=total_spend,
        total_predicted_rewards=total_predicted_rewards,
        rows=preview_rows
    )

@router.post("/import/commit", response_model=TransactionImportCommitResponse, status_code=status.HTTP_201_CREATED)
async def commit_csv_import(
    req: TransactionImportCommitRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Atomically commits confirmed statement transactions into the portfolio.
    Enforces deduplication, merchant normalization, and deterministic reward calculations.
    """
    if not req.rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No rows provided for transaction import."
        )

    # 1. Verify card if specified
    user_cards_stmt = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    user_cards = (await db.execute(user_cards_stmt)).scalars().all()

    target_card = None
    if req.card_id:
        target_card = next((c for c in user_cards if c.id == req.card_id), None)
        if not target_card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target credit card not found or unauthorized access."
            )

    # 2. Existing transactions for duplicate check
    existing_stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    existing_txns = (await db.execute(existing_stmt)).scalars().all()
    existing_hashes = {t.deduplication_hash for t in existing_txns if t.deduplication_hash}
    existing_refs = {t.reference_number.strip().lower() for t in existing_txns if t.reference_number}

    import_batch_id = uuid.uuid4().hex
    imported_txns: List[Transaction] = []
    skipped_duplicates_count = 0
    total_spend = Decimal("0.00")
    total_rewards = Decimal("0.00")

    seen_batch_hashes = set()
    seen_batch_refs = set()

    for row in req.rows:
        clean_ref = row.reference_number.strip().lower() if row.reference_number else None

        dedup_hash = row.deduplication_hash or DeduplicationEngine.compute_deduplication_hash(
            user_id=current_user.id,
            txn_date=row.transaction_date,
            amount=row.amount,
            normalized_merchant=row.merchant_name,
            card_id=req.card_id
        )

        if req.skip_duplicates:
            is_dup = False
            if clean_ref and (clean_ref in existing_refs or clean_ref in seen_batch_refs):
                is_dup = True
            elif dedup_hash in existing_hashes or dedup_hash in seen_batch_hashes:
                is_dup = True

            if is_dup:
                skipped_duplicates_count += 1
                continue

        if clean_ref:
            seen_batch_refs.add(clean_ref)
        seen_batch_hashes.add(dedup_hash)

        # DEF-06: Resolve payment method accurately for each imported row
        raw_desc_lower = row.raw_description.lower()
        if row.payment_method:
            row_payment_method = row.payment_method.strip().upper()
        elif req.payment_method:
            row_payment_method = req.payment_method.strip().upper()
        elif req.card_id:
            row_payment_method = "CREDIT_CARD"
        elif "upi" in raw_desc_lower or "@" in raw_desc_lower:
            row_payment_method = "UPI"
        elif any(k in raw_desc_lower for k in ["neft", "rtgs", "imps", "transfer", "bank"]):
            row_payment_method = "BANK_TRANSFER"
        elif any(k in raw_desc_lower for k in ["pos", "atm", "debit"]):
            row_payment_method = "DEBIT_CARD"
        elif current_user.financial_pathway == "NO_CREDIT_CARD":
            row_payment_method = "BANK_TRANSFER"
        elif user_cards:
            row_payment_method = "CREDIT_CARD"
        else:
            row_payment_method = "OTHER"

        # Rewards evaluation & Card binding: ONLY for eligible CREDIT_CARD transactions
        predicted_reward = Decimal("0.00")
        optimal_reward = Decimal("0.00")
        optimal_card_id = None
        chosen_card_id = None

        if row_payment_method == "CREDIT_CARD":
            if target_card:
                eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
                    card=target_card,
                    amount=row.amount,
                    category_id=row.category_id,
                    merchant_name=row.merchant_name
                )
                predicted_reward = eval_res.expected_reward_monetary

            best_opt = RewardOptimizationEngine.optimize_transaction(
                cards=user_cards,
                amount=row.amount,
                category_id=row.category_id,
                merchant_name=row.merchant_name
            )
            optimal_reward = best_opt.recommended_card.expected_reward_monetary if best_opt.recommended_card else Decimal("0.00")
            optimal_card_id = best_opt.recommended_card.card_id if best_opt.recommended_card else None

            chosen_card_id = req.card_id if req.card_id else optimal_card_id
            if not req.card_id:
                predicted_reward = optimal_reward
        else:
            # Non-card imports: never bind a credit card or fabricate rewards
            chosen_card_id = None
            predicted_reward = Decimal("0.00")
            optimal_reward = Decimal("0.00")
            optimal_card_id = None

        final_notes = serialize_feedback_notes(
            user_notes=row.notes or f"Imported statement line: {row.raw_description}",
            status="PENDING",
            actual=None,
            predicted=predicted_reward,
            discrepancy=None
        )

        txn = Transaction(
            user_id=current_user.id,
            card_id=chosen_card_id,
            payment_method=row_payment_method,
            category_id=row.category_id.strip().lower(),
            merchant_name=row.merchant_name.strip(),
            raw_description=row.raw_description.strip(),
            amount=row.amount,
            currency=row.currency or "INR",
            transaction_date=row.transaction_date,
            is_recurring=False,
            reward_earned_monetary=predicted_reward,
            potential_optimal_reward=optimal_reward,
            optimal_card_id=optimal_card_id,
            reference_number=row.reference_number,
            deduplication_hash=dedup_hash,
            import_batch_id=import_batch_id,
            category_confidence=row.category_confidence,
            notes=final_notes
        )
        db.add(txn)
        imported_txns.append(txn)
        total_spend += row.amount
        total_rewards += predicted_reward

    audit = AuditLog(
        user_id=current_user.id,
        action="TRANSACTIONS_CSV_IMPORTED",
        status="SUCCESS",
        details_json=json.dumps({
            "batch_id": import_batch_id,
            "imported_count": len(imported_txns),
            "skipped_duplicates": skipped_duplicates_count,
            "total_spend": str(total_spend),
            "card_id": req.card_id
        })
    )
    db.add(audit)

    await db.commit()

    for t in imported_txns:
        await db.refresh(t)

    return TransactionImportCommitResponse(
        import_batch_id=import_batch_id,
        imported_count=len(imported_txns),
        skipped_duplicates_count=skipped_duplicates_count,
        total_spend_imported=total_spend,
        total_rewards_predicted=total_rewards,
        imported_transactions=[parse_transaction_response(t) for t in imported_txns]
    )

# --- Standard Transaction CRUD Endpoints ---

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    req: TransactionCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Normalize merchant & auto-categorize if needed
    norm_res = MerchantNormalizer.resolve_merchant(req.merchant_name)
    canonical_merchant = norm_res.canonical_name if norm_res.canonical_name else req.merchant_name.strip()

    category = req.category_id
    cat_conf = Decimal("1.00") if req.category_id else None
    if not category:
        if norm_res.is_confident_match and norm_res.category_hint:
            category = norm_res.category_hint
            cat_conf = Decimal(str(round(norm_res.confidence, 2)))
        elif norm_res.category_hint:
            category = norm_res.category_hint
            cat_conf = Decimal(str(round(norm_res.confidence, 2)))
        else:
            category = "other"
            cat_conf = Decimal("0.30")

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

    # --- DEF-01: Payment Method and Card Association Consistency ---
    # Validate payment_method and card_id consistency
    non_card_methods = {"CASH", "UPI", "BANK_TRANSFER", "DEBIT_CARD", "OTHER"}
    
    # Resolve initial payment method
    if req.payment_method:
        resolved_payment_method = req.payment_method.strip().upper()
    elif req.card_id:
        resolved_payment_method = "CREDIT_CARD"
    elif current_user.financial_pathway == "NO_CREDIT_CARD":
        resolved_payment_method = "UPI"
    elif user_cards:
        resolved_payment_method = "CREDIT_CARD"
    else:
        resolved_payment_method = "UPI"

    # Strict consistency enforcement: non-card methods cannot be associated with a credit card
    if resolved_payment_method in non_card_methods and req.card_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"card_id cannot be specified for {resolved_payment_method} transactions. Non-card expenses must not be bound to a credit card."
        )

    # Calculate predicted and optimal rewards
    predicted_reward = Decimal("0.00")
    optimal_reward = Decimal("0.00")
    optimal_card_id = None
    chosen_card_id = None

    if resolved_payment_method == "CREDIT_CARD":
        # Calculate optimal reward possible across all user cards
        best_opt = RewardOptimizationEngine.optimize_transaction(
            cards=user_cards,
            amount=req.amount,
            category_id=category,
            merchant_name=canonical_merchant
        )
        optimal_reward = best_opt.recommended_card.expected_reward_monetary if best_opt.recommended_card else Decimal("0.00")
        optimal_card_id = best_opt.recommended_card.card_id if best_opt.recommended_card else None

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
                category_id=category,
                merchant_name=canonical_merchant
            )
            predicted_reward = eval_res.expected_reward_monetary
            chosen_card_id = req.card_id
        else:
            # If user did not specify a card, fallback to optimal if user has active cards
            chosen_card_id = optimal_card_id if user_cards else None
            predicted_reward = optimal_reward if user_cards else Decimal("0.00")
    else:
        # DEF-01: Non-card transactions (CASH, UPI, BANK_TRANSFER, DEBIT_CARD, OTHER)
        # MUST NEVER receive credit-card binding or rewards
        chosen_card_id = None
        predicted_reward = Decimal("0.00")
        optimal_reward = Decimal("0.00")
        optimal_card_id = None

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

    txn_date = req.transaction_date or datetime.utcnow()
    dedup_hash = DeduplicationEngine.compute_deduplication_hash(
        user_id=current_user.id,
        txn_date=txn_date,
        amount=req.amount,
        normalized_merchant=canonical_merchant,
        card_id=chosen_card_id
    )

    txn = Transaction(
        user_id=current_user.id,
        card_id=chosen_card_id,
        category_id=category.strip().lower(),
        merchant_name=canonical_merchant,
        raw_description=req.raw_description or req.merchant_name.strip(),
        amount=req.amount,
        currency=req.currency,
        transaction_date=txn_date,
        is_recurring=req.is_recurring,
        reward_earned_monetary=reward_earned,
        potential_optimal_reward=optimal_reward,
        optimal_card_id=optimal_card_id,
        reference_number=req.reference_number,
        deduplication_hash=dedup_hash,
        category_confidence=cat_conf,
        payment_method=resolved_payment_method,
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
