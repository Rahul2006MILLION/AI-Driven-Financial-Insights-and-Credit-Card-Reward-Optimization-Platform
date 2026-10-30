from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

class CardRewardRuleCreate(BaseModel):
    category_id: Optional[str] = Field("all", max_length=64)
    merchant_pattern: Optional[str] = Field(None, max_length=128)
    reward_type: str = Field("CASHBACK", pattern="^(CASHBACK|REWARD_POINTS|MILES)$")
    reward_rate_percentage: Decimal = Field(..., ge=Decimal("0.0"), le=Decimal("100.0"))
    point_monetary_value: Decimal = Field(Decimal("1.0"), ge=Decimal("0.0"))
    min_transaction_amount: Decimal = Field(Decimal("0.0"), ge=Decimal("0.0"))
    max_reward_per_transaction: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    monthly_cap_amount: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    is_excluded: bool = False
    exclusion_reason: Optional[str] = Field(None, max_length=255)

class CardRewardRuleResponse(CardRewardRuleCreate):
    id: str
    card_id: str

    model_config = {"from_attributes": True}

class CardBenefitCreate(BaseModel):
    benefit_type: str = Field(..., max_length=64)  # PERMANENT, PROMOTIONAL, MERCHANT_SPECIFIC, NETWORK_SPECIFIC, LOUNGE_ACCESS, INSURANCE, GOLF, MILESTONE
    title: str = Field(..., max_length=255)
    description: str
    applicable_category: str = Field("all", max_length=64)
    reward_percentage_or_points: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    reward_basis: str = Field("COMPLIMENTARY", max_length=32)
    max_reward: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    min_transaction_amount: Decimal = Field(Decimal("0.0"), ge=Decimal("0.0"))
    cap_amount: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    cap_period: str = Field("NONE", max_length=32)
    eligibility_restrictions: Optional[str] = Field(None, max_length=255)
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    terms_and_conditions: Optional[str] = None
    source_reference: Optional[str] = Field(None, max_length=512)
    last_verified_date: Optional[datetime] = None
    annual_value_estimate: Decimal = Field(Decimal("0.0"), ge=Decimal("0.0"))

class CardBenefitResponse(CardBenefitCreate):
    id: str
    card_id: str

    model_config = {"from_attributes": True}

class CreditCardCreate(BaseModel):
    card_name: str = Field(..., min_length=2, max_length=128)
    bank_name: str = Field(..., min_length=2, max_length=128)
    network: str = Field("VISA", pattern="^(VISA|MASTERCARD|AMEX|RUPAY|DINERS)$")
    card_type: str = Field("CREDIT", max_length=32)
    card_variant: Optional[str] = Field(None, max_length=64)
    last_four_digits: Optional[str] = Field(None, min_length=4, max_length=4, pattern="^[0-9]{4}$")
    joining_fee: Decimal = Field(Decimal("0.00"), ge=Decimal("0.00"))
    annual_fee: Decimal = Field(Decimal("0.00"), ge=Decimal("0.00"))
    renewal_waiver_spend: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    fee_waiver_condition_details: Optional[str] = Field(None, max_length=255)
    renewal_date: Optional[datetime] = None
    billing_cycle_day: Optional[int] = Field(None, ge=1, le=31)
    terms_source_url: Optional[str] = Field(None, max_length=512)
    rules: List[CardRewardRuleCreate] = []
    benefits: List[CardBenefitCreate] = []

class CreditCardUpdate(BaseModel):
    card_name: Optional[str] = Field(None, min_length=2, max_length=128)
    bank_name: Optional[str] = Field(None, min_length=2, max_length=128)
    network: Optional[str] = Field(None, pattern="^(VISA|MASTERCARD|AMEX|RUPAY|DINERS)$")
    card_variant: Optional[str] = Field(None, max_length=64)
    last_four_digits: Optional[str] = Field(None, min_length=4, max_length=4, pattern="^[0-9]{4}$")
    joining_fee: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    annual_fee: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    renewal_waiver_spend: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    fee_waiver_condition_details: Optional[str] = Field(None, max_length=255)
    renewal_date: Optional[datetime] = None
    billing_cycle_day: Optional[int] = Field(None, ge=1, le=31)
    terms_source_url: Optional[str] = Field(None, max_length=512)
    is_active: Optional[bool] = None
    rules: Optional[List[CardRewardRuleCreate]] = None
    benefits: Optional[List[CardBenefitCreate]] = None

class CreditCardResponse(BaseModel):
    id: str
    user_id: str
    card_name: str
    bank_name: str
    network: str
    card_type: str
    card_variant: Optional[str] = None
    last_four_digits: Optional[str] = None
    joining_fee: Decimal = Decimal("0.00")
    annual_fee: Decimal
    renewal_waiver_spend: Optional[Decimal] = None
    fee_waiver_condition_details: Optional[str] = None
    renewal_date: Optional[datetime] = None
    billing_cycle_day: Optional[int] = None
    terms_source_url: Optional[str] = None
    is_active: bool
    reward_rules: List[CardRewardRuleResponse] = []
    benefits: List[CardBenefitResponse] = []

    model_config = {"from_attributes": True}
