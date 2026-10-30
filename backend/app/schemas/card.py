from typing import List, Optional
from decimal import Decimal
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
    benefit_type: str = Field(..., max_length=64)
    title: str = Field(..., max_length=255)
    description: str
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
    last_four_digits: Optional[str] = Field(None, min_length=4, max_length=4, pattern="^[0-9]{4}$")
    annual_fee: Decimal = Field(Decimal("0.00"), ge=Decimal("0.00"))
    renewal_waiver_spend: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    billing_cycle_day: Optional[int] = Field(None, ge=1, le=31)
    rules: List[CardRewardRuleCreate] = []
    benefits: List[CardBenefitCreate] = []

class CreditCardUpdate(BaseModel):
    card_name: Optional[str] = Field(None, min_length=2, max_length=128)
    bank_name: Optional[str] = Field(None, min_length=2, max_length=128)
    network: Optional[str] = Field(None, pattern="^(VISA|MASTERCARD|AMEX|RUPAY|DINERS)$")
    last_four_digits: Optional[str] = Field(None, min_length=4, max_length=4, pattern="^[0-9]{4}$")
    annual_fee: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    renewal_waiver_spend: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    billing_cycle_day: Optional[int] = Field(None, ge=1, le=31)
    is_active: Optional[bool] = None

class CreditCardResponse(BaseModel):
    id: str
    user_id: str
    card_name: str
    bank_name: str
    network: str
    card_type: str
    last_four_digits: Optional[str] = None
    annual_fee: Decimal
    renewal_waiver_spend: Optional[Decimal] = None
    billing_cycle_day: Optional[int] = None
    is_active: bool
    reward_rules: List[CardRewardRuleResponse] = []
    benefits: List[CardBenefitResponse] = []

    model_config = {"from_attributes": True}
