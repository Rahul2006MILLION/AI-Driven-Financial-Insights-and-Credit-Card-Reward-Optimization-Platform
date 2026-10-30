from typing import List, Optional, Any, Dict
from decimal import Decimal
from pydantic import BaseModel, Field

class RecommendRequest(BaseModel):
    amount: Decimal = Field(..., gt=Decimal("0.0"))
    category_id: str = Field(..., max_length=64)
    merchant_name: Optional[str] = Field(None, max_length=255)
    include_annual_fee_net: bool = False

class CalculationStep(BaseModel):
    step_number: int
    rule_name: str
    rate_percentage: Decimal
    raw_reward: Decimal
    cap_applied: Optional[Decimal] = None
    final_monetary_value: Decimal
    reason: str

class CardRecommendation(BaseModel):
    card_id: str
    card_name: str
    bank_name: str
    network: str
    reward_type: str
    reward_rate_percentage: Decimal
    point_monetary_value: Decimal
    expected_reward_monetary: Decimal
    effective_rate_percentage: Decimal
    is_excluded: bool = False
    exclusion_reason: Optional[str] = None
    breakdown_steps: List[CalculationStep] = []

class RecommendResponse(BaseModel):
    transaction_amount: Decimal
    category_id: str
    merchant_name: Optional[str] = None
    recommended_card: Optional[CardRecommendation] = None
    alternatives: List[CardRecommendation] = []
    explanation: str
    language: str = "en"
    queried_at: str

class CompareRequest(BaseModel):
    card_ids: List[str] = Field(..., min_length=2, max_length=5)
    simulation_spend: Optional[Decimal] = Field(Decimal("50000.00"), gt=Decimal("0.0"))

class CompareCategoryYield(BaseModel):
    category_id: str
    display_name: str
    card_yields: Dict[str, Decimal]  # card_id -> effective_percentage

class CompareResponse(BaseModel):
    cards: List[CardRecommendation]
    category_matrix: List[CompareCategoryYield]
    annual_break_even_spends: Dict[str, Decimal]
    summary_verdict: str
