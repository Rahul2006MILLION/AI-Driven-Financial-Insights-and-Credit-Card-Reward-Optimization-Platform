from typing import Optional
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
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
