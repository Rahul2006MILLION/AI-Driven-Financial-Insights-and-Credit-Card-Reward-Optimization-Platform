from typing import List, Optional, Any
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

STATUS_PATTERN = "^(DISCOVERED|PENDING_REVIEW|VERIFIED|REJECTED|EXPIRED|NEEDS_REVERIFICATION|SOURCE_UNAVAILABLE|SAMPLE|MANUALLY_ENTERED)$"

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
    source_name: Optional[str] = Field(None, max_length=128)
    source_evidence: Optional[str] = None
    extraction_confidence: Decimal = Field(Decimal("0.85"), ge=Decimal("0.0"), le=Decimal("1.0"))
    verification_status: str = Field("PENDING_REVIEW", pattern=STATUS_PATTERN)

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
    source_name: Optional[str] = Field(None, max_length=128)
    source_evidence: Optional[str] = None
    extraction_confidence: Optional[Decimal] = Field(None, ge=Decimal("0.0"), le=Decimal("1.0"))
    verification_status: Optional[str] = Field(None, pattern=STATUS_PATTERN)

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
    source_name: Optional[str] = None
    source_evidence: Optional[str] = None
    extraction_confidence: Decimal = Decimal("0.85")
    verification_status: str
    content_hash: Optional[str] = None
    version: int = 1
    previous_version_json: Optional[str] = None
    rejection_reason: Optional[str] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
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

# Admin Review Schemas
class AdminOfferApproveRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=500)

class AdminOfferRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=3, max_length=255)
    notes: Optional[str] = Field(None, max_length=500)

class AdminOfferEditRequest(BaseModel):
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
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    payment_channel: Optional[str] = Field(None, pattern="^(ONLINE|OFFLINE|BOTH)$")
    promo_code: Optional[str] = Field(None, max_length=64)
    activation_requirement: Optional[str] = Field(None, max_length=255)
    terms_and_conditions: Optional[str] = None
    source_url: Optional[str] = Field(None, max_length=512)
    source_evidence: Optional[str] = None
    approve_immediately: bool = False
    notes: Optional[str] = Field(None, max_length=500)

class AdminReverificationRequest(BaseModel):
    reason: str = Field("Material terms modified at official source", min_length=3, max_length=255)

class OfferAuditLogResponse(BaseModel):
    id: str
    offer_id: str
    action: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    actor_role: str = "ADMIN"
    from_status: Optional[str] = None
    to_status: Optional[str] = None
    notes: Optional[str] = None
    snapshot_json: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}

class DiscoverySyncResponse(BaseModel):
    discovered_count: int
    extracted_count: int
    pending_review_count: int
    reverification_triggered_count: int
    unchanged_count: int
    errors: List[str] = []

