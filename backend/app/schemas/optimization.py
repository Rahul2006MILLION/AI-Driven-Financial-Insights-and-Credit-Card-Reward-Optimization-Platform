from typing import List, Optional, Any, Dict
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.offer import ApplicableOfferSummary

class RecommendRequest(BaseModel):
    amount: Decimal = Field(..., gt=Decimal("0.0"))
    category_id: str = Field(..., max_length=64)
    merchant_name: Optional[str] = Field(None, max_length=255)
    payment_channel: str = Field("ONLINE", pattern="^(ONLINE|OFFLINE|BOTH)$")
    include_annual_fee_net: bool = False
    reward_basis_mode: Optional[str] = Field("NET_CHARGED_AMOUNT", pattern="^(NET_CHARGED_AMOUNT|ORIGINAL_TRANSACTION_AMOUNT)$")

class CalculationStep(BaseModel):
    step_number: int
    rule_name: str
    rate_percentage: Decimal
    raw_reward: Decimal
    cap_applied: Optional[Decimal] = None
    final_monetary_value: Decimal
    reason: str

class IneligibleOfferSummary(BaseModel):
    offer_id: str
    merchant_name: str
    offer_title: str
    rejection_reasons: List[str]
    rejection_details: List[str] = []

class EligibilityDecision(BaseModel):
    entity_type: str  # "CARD" or "OFFER"
    entity_id: str
    entity_name: str
    is_eligible: bool
    decision_reasons: List[str] = []

class CardRecommendation(BaseModel):
    card_id: str
    card_name: str
    bank_name: str
    network: str
    card_variant: Optional[str] = None
    reward_type: str
    reward_rate_percentage: Decimal
    point_monetary_value: Decimal
    instant_discount_monetary: Decimal = Decimal("0.00")
    post_reward_monetary: Decimal = Decimal("0.00")
    expected_reward_monetary: Decimal = Decimal("0.00")
    net_financial_benefit: Decimal = Decimal("0.00")
    effective_rate_percentage: Decimal
    is_excluded: bool = False
    exclusion_reason: Optional[str] = None
    applicable_offers: List[ApplicableOfferSummary] = []
    ineligible_offers: List[IneligibleOfferSummary] = []
    eligibility_decisions: List[EligibilityDecision] = []
    amount_charged: Decimal = Decimal("0.00")
    expected_instant_discount: Decimal = Decimal("0.00")
    expected_cashback: Decimal = Decimal("0.00")
    expected_reward_points: Decimal = Decimal("0.00")
    unvalued_points_count: Optional[int] = None
    ranking_rationale: Optional[str] = None
    calculation_assumptions: List[str] = []
    data_freshness_notes: List[str] = []
    missing_information_notes: List[str] = []
    source_references: List[str] = []
    breakdown_steps: List[CalculationStep] = []

class RecommendResponse(BaseModel):
    transaction_amount: Decimal
    amount_charged: Optional[Decimal] = None
    category_id: str
    merchant_name: Optional[str] = None
    normalized_merchant: Optional[str] = None
    canonical_merchant: Optional[str] = None
    merchant_confidence: Optional[float] = None
    payment_channel: str = "ONLINE"
    recommended_card: Optional[CardRecommendation] = None
    alternatives: List[CardRecommendation] = []
    all_evaluated_cards_count: int = 0
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

# ==============================================================================
# WHAT-IF PURCHASE SIMULATOR SCHEMAS
# ==============================================================================

class SimulateRequest(BaseModel):
    category_id: str = Field(..., max_length=64)
    merchant_name: Optional[str] = Field(None, max_length=255)
    payment_channel: str = Field("ONLINE", pattern="^(ONLINE|OFFLINE|BOTH)$")
    amounts: Optional[List[Decimal]] = Field(None, description="Explicit list of test transaction amounts")
    start_amount: Optional[Decimal] = Field(None, ge=Decimal("100.00"))
    end_amount: Optional[Decimal] = Field(None, ge=Decimal("100.00"))
    step_amount: Optional[Decimal] = Field(None, ge=Decimal("100.00"))
    card_ids: Optional[List[str]] = Field(None, description="Optional subset of user card IDs to simulate")
    language: str = Field("en", pattern="^(en|hi|kn)$")

class SimulatedCardYield(BaseModel):
    card_id: str
    card_name: str
    bank_name: str
    network: str
    amount_charged: Decimal
    instant_discount: Decimal
    post_reward: Decimal
    net_financial_benefit: Decimal
    effective_rate_percentage: Decimal
    is_recommended: bool
    cap_exhausted: bool = False
    rank: int

class SimulateScenarioResult(BaseModel):
    spend_amount: Decimal
    recommended_card_id: str
    recommended_card_name: str
    net_benefit: Decimal
    effective_rate: Decimal
    amount_charged: Decimal
    applied_offer_titles: List[str] = []
    card_yields: List[SimulatedCardYield]
    insight: str

class SimulateResponse(BaseModel):
    category_id: str
    merchant_name: Optional[str] = None
    normalized_merchant: Optional[str] = None
    canonical_merchant: Optional[str] = None
    scenarios: List[SimulateScenarioResult]
    sweet_spot_spend: Optional[Decimal] = None
    summary: str
    language: str = "en"
    queried_at: str
