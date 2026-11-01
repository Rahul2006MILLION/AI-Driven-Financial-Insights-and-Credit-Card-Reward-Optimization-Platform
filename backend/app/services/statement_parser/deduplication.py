import hashlib
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple

from app.models.entities import Transaction
from app.services.statement_parser.csv_parser import ParsedStatementRow

class DeduplicationEngine:
    """
    Deterministic duplicate prevention and transaction fingerprinting engine.
    Ensures that re-importing statements never inflates spending totals,
    while carefully discerning between exact duplicates and legitimate repeat transactions.
    """

    @classmethod
    def compute_deduplication_hash(
        cls,
        user_id: str,
        txn_date: datetime,
        amount: Decimal,
        normalized_merchant: str,
        card_id: Optional[str] = None
    ) -> str:
        date_str = txn_date.strftime("%Y-%m-%d")
        amt_str = f"{amount:.2f}"
        merch_str = normalized_merchant.strip().lower()
        card_str = card_id.strip() if card_id else "unassigned"

        raw_payload = f"{user_id}:{date_str}:{amt_str}:{merch_str}:{card_str}"
        return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

    @classmethod
    def evaluate_row_duplicates(
        cls,
        user_id: str,
        row: ParsedStatementRow,
        card_id: Optional[str],
        existing_txns: List[Transaction]
    ) -> Tuple[str, Optional[str], str]:
        """
        Evaluates duplicate state for a parsed statement row against existing user transactions.
        Returns: (duplicate_status, duplicate_reason, deduplication_hash)
        duplicate_status in: 'NEW', 'EXACT_DUPLICATE', 'AMBIGUOUS_DUPLICATE', 'INVALID', 'EXCLUDED'
        """
        if not row.is_valid:
            return "INVALID", row.error_message, ""

        if row.is_credit:
            return "EXCLUDED", "Payment/Credit transaction excluded from spend tracking.", ""

        dedup_hash = cls.compute_deduplication_hash(
            user_id=user_id,
            txn_date=row.parsed_date,
            amount=row.parsed_amount,
            normalized_merchant=row.canonical_merchant or row.raw_description,
            card_id=card_id
        )

        # 1. Primary Check: External bank reference number if available
        if row.reference_number:
            ref_clean = row.reference_number.strip().lower()
            matching_ref = next(
                (t for t in existing_txns if t.reference_number and t.reference_number.strip().lower() == ref_clean),
                None
            )
            if matching_ref:
                return (
                    "EXACT_DUPLICATE",
                    f"Transaction with bank reference #{row.reference_number} already recorded on {matching_ref.transaction_date.strftime('%Y-%m-%d')}.",
                    dedup_hash
                )

        # 2. Secondary Check: Ambiguous duplicate candidate
        # When statements lack stable bank reference numbers, transactions with identical merchant,
        # amount, and date are flagged for user review rather than automatically dropped.
        row_merch_clean = (row.canonical_merchant or "").strip().lower()
        matching_ambiguous = next(
            (
                t for t in existing_txns
                if t.transaction_date.date() == row.parsed_date.date()
                and Decimal(str(t.amount)) == row.parsed_amount
                and t.merchant_name.strip().lower() == row_merch_clean
            ),
            None
        )
        if matching_ambiguous:
            return (
                "AMBIGUOUS_DUPLICATE",
                f"A similar transaction of ₹{row.parsed_amount} at {row.canonical_merchant} was recorded on {row.parsed_date.strftime('%Y-%m-%d')}. Please verify if this is a repeat purchase or a duplicate entry.",
                dedup_hash
            )

        # 3. Check exact matching hash (if card_id and all attributes match)
        matching_hash = next(
            (t for t in existing_txns if t.deduplication_hash and t.deduplication_hash == dedup_hash),
            None
        )
        if matching_hash:
            return (
                "EXACT_DUPLICATE",
                f"Exact match already exists in portfolio (₹{row.parsed_amount} at {row.canonical_merchant} on {row.parsed_date.strftime('%Y-%m-%d')}).",
                dedup_hash
            )

        return "NEW", None, dedup_hash
