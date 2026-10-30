from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

class CardOfferBase(BaseModel):
    merchant_name: str = Field(..., min_length=2, max_length=128)
    offer_title: str = Field(..., min_length=3, max_length=255)
    category_id: str = Field(..., max_length=64)  # food_delivery, dining, shopping, travel, entertainment, grocery, utility, fuel
    discount_type: str = Field("PERCENTAGE", pattern="^(PERCENTAGE|FLAT_AMOUNT)$")
    discount_value: Decimal = Field(..., ge=Decimal("0.0"))
    min_transaction_value: Decimal = Field(Decimal("0.00"), ge=Decimal("0.00"))
    max_discount_amount: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    eligible_bank: Optional[str] = Field(None, max_length=128)
    eligible_network: Optional[str] = Field(None, pattern="^(VISA|MASTERCARD|AMEX|RUPAY|DINERS)$")
    eligible_card_names: List[str] = []
    valid_from: datetime = Field(default_factory=datetime.utcnow)
    valid_to: datetime
    payment_channel: str = Field("ONLINE", pattern="^(ONLINE|OFFLINE|BOTH)$")
    promo_code: Optional[str] = Field(None, max_length=64)
    activation_requirement: Optional[str] = Field(None, max_length=255)
    terms_and_conditions: Optional[str] = None
    source_url: Optional[str] = Field(None, max_length=512)
    verification_status: str = Field("VERIFIED", pattern="^(VERIFIED|SAMPLE|MANUALLY_ENTERED|EXPIRED)$")

class CardOfferCreate(CardOfferBase):
    pass

class CardOfferUpdate(BaseModel):
    merchant_name: Optional[str] = Field(None, min_length=2, max_length=128)
    offer_title: Optional[str] = Field(None, min_length=3, max_length=255)
    category_id: Optional[str] = Field(None, max_length=64)
    discount_type: Optional[str] = Field(None, pattern="^(PERCENTAGE|FLAT_AMOUNT)$")
    discount_value: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    min_transaction_value: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    max_discount_amount: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    eligible_bank: Optional[str] = Field(None, max_length=128)
    eligible_network: Optional[str] = Field(None, pattern="^(VISA|MASTERCARD|AMEX|RUPAY|DINERS)$")
    eligible_card_names: Optional[List[str]] = None
    valid_to: Optional[datetime] = None
    payment_channel: Optional[str] = Field(None, pattern="^(ONLINE|OFFLINE|BOTH)$")
    promo_code: Optional[str] = Field(None, max_length=64)
    activation_requirement: Optional[str] = Field(None, max_length=255)
    terms_and_conditions: Optional[str] = None
    source_url: Optional[str] = Field(None, max_length=512)
    verification_status: Optional[str] = Field(None, pattern="^(VERIFIED|SAMPLE|MANUALLY_ENTERED|EXPIRED)$")

class CardOfferResponse(BaseModel):
    id: str
    merchant_name: str
    offer_title: str
    category_id: str
    discount_type: str
    discount_value: Decimal
    min_transaction_value: Decimal
    max_discount_amount: Optional[Decimal] = None
    eligible_bank: Optional[str] = None
    eligible_network: Optional[str] = None
    eligible_card_names: List[str] = []
    valid_from: datetime
    valid_to: datetime
    payment_channel: str
    promo_code: Optional[str] = None
    activation_requirement: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    source_url: Optional[str] = None
    verification_status: str
    last_verified_timestamp: datetime
    created_at: datetime
    # Dynamic field when queried for user
    matching_user_card_names: List[str] = []
    is_applicable_to_user: bool = False

    model_config = {"from_attributes": True}

class ApplicableOfferSummary(BaseModel):
    offer_id: str
    merchant_name: str
    offer_title: str
    promo_code: Optional[str] = None
    discount_type: str
    discount_amount: Decimal
    terms_and_conditions: Optional[str] = None
    source_url: Optional[str] = None
    verification_status: str
