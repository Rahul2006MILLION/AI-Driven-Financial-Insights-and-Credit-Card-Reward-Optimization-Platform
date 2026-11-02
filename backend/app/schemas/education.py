from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

class QuizOption(BaseModel):
    id: int
    text: str

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[QuizOption]
    correct_option_id: int
    explanation: str

class LessonModuleSummary(BaseModel):
    id: str
    category_id: str
    order: int
    reading_time_minutes: int
    title: str
    summary: str
    is_completed: bool = False
    quiz_score: Optional[int] = None

class LessonModuleDetail(BaseModel):
    id: str
    category_id: str
    order: int
    reading_time_minutes: int
    title: str
    summary: str
    content_markdown: str
    key_takeaways: List[str]
    quiz: List[QuizQuestion]
    is_completed: bool = False
    quiz_score: Optional[int] = None

class CategorySummary(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    total_lessons: int
    completed_lessons: int

class UserLearningProgressUpdate(BaseModel):
    is_completed: bool = True
    quiz_score: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None

class UserLearningProgressResponse(BaseModel):
    total_topics: int
    completed_topics: int
    completion_percentage: float
    average_quiz_score: Optional[float] = None
    categories: List[CategorySummary]
    completed_topic_ids: List[str]

# Calculators
class InterestCalcRequest(BaseModel):
    balance: Decimal = Field(..., gt=0, description="Outstanding balance in INR")
    apr_percentage: Decimal = Field(42.0, ge=0, le=100, description="Annual Percentage Rate")
    monthly_payment: Decimal = Field(..., gt=0, description="Planned monthly payment in INR")
    new_monthly_charges: Decimal = Field(Decimal("0.00"), ge=0, description="New purchases added each month")

class MonthlyScheduleItem(BaseModel):
    month: int
    starting_balance: Decimal
    interest_charged: Decimal
    principal_paid: Decimal
    payment: Decimal
    ending_balance: Decimal

class InterestCalcResponse(BaseModel):
    monthly_interest_rate_pct: Decimal
    first_month_interest: Decimal
    total_interest_paid: Decimal
    total_amount_paid: Decimal
    months_to_payoff: int
    is_perpetual_debt: bool
    schedule_sample: List[MonthlyScheduleItem]
    disclaimer: str

class MinimumPaymentCalcRequest(BaseModel):
    balance: Decimal = Field(..., gt=0, description="Total statement balance")
    apr_percentage: Decimal = Field(42.0, ge=0, le=100)
    min_payment_pct: Decimal = Field(5.0, ge=1, le=50, description="Min due percentage (standard: 5%)")
    fixed_payment_option: Optional[Decimal] = Field(Decimal("2000.00"), description="Alternative fixed monthly payment")

class MinimumPaymentComparisonScenario(BaseModel):
    name: str
    monthly_payment_desc: str
    months_to_payoff: int
    total_interest_paid: Decimal
    total_amount_paid: Decimal
    interest_to_principal_ratio: Decimal

class MinimumPaymentCalcResponse(BaseModel):
    balance: Decimal
    apr_percentage: Decimal
    minimum_due_first_month: Decimal
    scenarios: List[MinimumPaymentComparisonScenario]
    interest_difference: Decimal
    time_saved_months: int
    educational_warning: str
    disclaimer: str

class BudgetPlannerRequest(BaseModel):
    monthly_income: Decimal = Field(..., gt=0)
    category_budgets: Dict[str, Decimal] = Field(default_factory=dict)
    actual_spends: Optional[Dict[str, Decimal]] = None

class BudgetCategoryAnalysis(BaseModel):
    category_id: str
    category_name: str
    allocated_amount: Decimal
    actual_amount: Decimal
    variance: Decimal
    utilization_pct: Decimal
    status: str

class BudgetPlannerResponse(BaseModel):
    monthly_income: Decimal
    total_allocated: Decimal
    unallocated_income: Decimal
    needs_amount: Decimal
    needs_percentage: Decimal
    wants_amount: Decimal
    wants_percentage: Decimal
    savings_amount: Decimal
    savings_percentage: Decimal
    rule_50_30_20_assessment: str
    categories: List[BudgetCategoryAnalysis]
    advice: List[str]

class CardUtilizationItem(BaseModel):
    card_name: str
    credit_limit: Decimal
    current_balance: Decimal
    utilization_pct: Decimal

class CreditUtilizationRequest(BaseModel):
    total_limit: Optional[Decimal] = None
    total_balance: Optional[Decimal] = None
    cards: Optional[List[CardUtilizationItem]] = None

class CreditUtilizationResponse(BaseModel):
    total_limit: Decimal
    total_balance: Decimal
    overall_utilization_pct: Decimal
    status: str  # IDEAL, MODERATE, HIGH, CRITICAL
    target_balance_for_30_pct: Decimal
    amount_to_pay_for_ideal: Decimal
    cibil_impact_assessment: str
    actionable_steps: List[str]
    disclaimer: str

class CardBreakEvenRequest(BaseModel):
    annual_fee: Decimal = Field(..., ge=0)
    monthly_spend: Decimal = Field(..., ge=0)
    reward_rate_pct: Decimal = Field(..., ge=0, le=100)
    annual_milestone_benefits: Decimal = Field(Decimal("0.00"), ge=0)
    waiver_spend_threshold: Optional[Decimal] = None

class CardBreakEvenResponse(BaseModel):
    annual_fee: Decimal
    annual_spend: Decimal
    annual_rewards_earned: Decimal
    total_annual_benefits: Decimal
    net_value: Decimal
    break_even_annual_spend: Decimal
    break_even_monthly_spend: Decimal
    is_fee_waived: bool
    is_card_worth_it: bool
    verdict: str
    disclaimer: str

# User Path & Budget Preferences
class FinancialPathUpdateRequest(BaseModel):
    financial_path: str = Field(..., pattern="^(NEW_TO_FINANCE|UNDERSTAND_CREDIT|OPTIMIZE_EXISTING|NO_CREDIT_CARD|CREDIT_CARD_USER)$")
    financial_pathway: Optional[str] = Field(None, pattern="^(CREDIT_CARD|NO_CREDIT_CARD)$")

class FinancialPathResponse(BaseModel):
    financial_path: str
    onboarding_completed: bool

class UserBudgetUpsertRequest(BaseModel):
    monthly_income: Optional[Decimal] = Field(None, ge=0)
    category_budgets: Dict[str, Decimal] = Field(..., description="Dict of category_id -> allocated amount")

class UserBudgetResponse(BaseModel):
    id: str
    monthly_income: Optional[Decimal] = None
    total_budget: Decimal
    category_budgets: Dict[str, Decimal]
    actual_spending_this_month: Optional[Decimal] = Decimal("0.00")
    spending_by_category: Optional[Dict[str, Decimal]] = None
    budget_utilization_pct: Optional[Decimal] = Decimal("0.00")
    alerts: List[str] = []

