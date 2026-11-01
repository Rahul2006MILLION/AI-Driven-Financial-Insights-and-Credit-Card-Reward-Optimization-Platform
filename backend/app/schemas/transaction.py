from typing import Optional, Dict, List, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class TransactionCreate(BaseModel):
    card_id: Optional[str] = None
    category_id: Optional[str] = Field(None, max_length=64)
    merchant_name: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=Decimal("0.0"))
    currency: str = Field("INR", max_length=10)
    transaction_date: Optional[datetime] = None
    is_recurring: bool = False
    raw_description: Optional[str] = Field(None, max_length=500)
    reference_number: Optional[str] = Field(None, max_length=128)
    actual_reward_earned: Optional[Decimal] = Field(None, ge=Decimal("0.00"), description="Actual statement reward if verified by user")
    reward_status: Optional[str] = Field("PENDING", pattern="^(CONFIRMED|PENDING|DISCREPANCY|UNKNOWN)$")
    discrepancy_reason: Optional[str] = None
    notes: Optional[str] = None

class TransactionFeedbackUpdate(BaseModel):
    actual_reward_earned: Decimal = Field(..., ge=Decimal("0.00"))
    reward_status: str = Field("CONFIRMED", pattern="^(CONFIRMED|PENDING|DISCREPANCY|UNKNOWN)$")
    discrepancy_reason: Optional[str] = None  # e.g., MERCHANT_MCC_MISMATCH, CAP_REACHED_ON_BANK_SIDE, EXCLUDED_BY_BANK, OFFER_CODE_FAILED
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    card_id: Optional[str] = None
    category_id: str
    merchant_name: str
    amount: Decimal
    currency: str
    transaction_date: datetime
    is_recurring: bool
    reward_earned_monetary: Decimal
    potential_optimal_reward: Decimal
    optimal_card_id: Optional[str] = None
    # Statement / Ingestion Metadata
    raw_description: Optional[str] = None
    reference_number: Optional[str] = None
    deduplication_hash: Optional[str] = None
    import_batch_id: Optional[str] = None
    category_confidence: Optional[Decimal] = None
    # Extended Transaction Feedback Fields
    actual_reward_earned: Optional[Decimal] = None
    predicted_reward: Optional[Decimal] = None
    reward_variance: Optional[Decimal] = None
    reward_status: Optional[str] = "PENDING"
    discrepancy_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class TransactionFeedbackSummaryResponse(BaseModel):
    total_transactions_tracked: int
    confirmed_count: int
    pending_count: int
    discrepancy_count: int
    prediction_accuracy_percentage: Decimal
    total_predicted_rewards: Decimal
    total_actual_rewards: Decimal
    total_variance: Decimal
    discrepancy_reasons_breakdown: Dict[str, int]

# --- CSV Ingestion & Preview Schemas ---

class TransactionImportPreviewRow(BaseModel):
    temp_id: str
    row_index: int
    transaction_date: datetime
    raw_description: str
    merchant_name: str
    amount: Decimal
    currency: str = "INR"
    reference_number: Optional[str] = None
    category_id: str
    category_confidence: Decimal
    requires_category_review: bool
    duplicate_status: str  # "NEW", "EXACT_DUPLICATE", "AMBIGUOUS_DUPLICATE", "INVALID", "EXCLUDED"
    duplicate_reason: Optional[str] = None
    deduplication_hash: str
    predicted_reward: Decimal
    potential_optimal_reward: Decimal
    optimal_card_id: Optional[str] = None
    selected_for_import: bool
    is_valid: bool = True
    error_message: Optional[str] = None

class TransactionImportPreviewResponse(BaseModel):
    filename: str
    detected_format: str
    total_rows_parsed: int
    valid_rows_count: int
    duplicate_rows_count: int
    ambiguous_rows_count: int
    invalid_rows_count: int
    excluded_rows_count: int
    total_spend_amount: Decimal
    total_predicted_rewards: Decimal
    rows: List[TransactionImportPreviewRow]

class TransactionImportCommitRow(BaseModel):
    transaction_date: datetime
    raw_description: str
    merchant_name: str
    amount: Decimal = Field(..., gt=Decimal("0.0"))
    currency: str = "INR"
    reference_number: Optional[str] = None
    category_id: str
    category_confidence: Optional[Decimal] = None
    deduplication_hash: Optional[str] = None
    notes: Optional[str] = None

class TransactionImportCommitRequest(BaseModel):
    card_id: Optional[str] = None
    rows: List[TransactionImportCommitRow]
    skip_duplicates: bool = True

class TransactionImportCommitResponse(BaseModel):
    import_batch_id: str
    imported_count: int
    skipped_duplicates_count: int
    total_spend_imported: Decimal
    total_rewards_predicted: Decimal
    imported_transactions: List[TransactionResponse]
