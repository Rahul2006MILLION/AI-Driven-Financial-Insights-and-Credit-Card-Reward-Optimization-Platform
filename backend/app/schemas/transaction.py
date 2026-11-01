from typing import Optional, Dict
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class TransactionCreate(BaseModel):
    card_id: Optional[str] = None
    category_id: str = Field(..., max_length=64)
    merchant_name: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=Decimal("0.0"))
    currency: str = Field("INR", max_length=10)
    transaction_date: Optional[datetime] = None
    is_recurring: bool = False
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
