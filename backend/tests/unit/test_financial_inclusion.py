import pytest
from decimal import Decimal
from app.services.education.calculators import EducationCalculators
from app.services.education.curriculum import CurriculumService, LESSONS_DATA, CATEGORIES_DATA
from app.schemas.education import (
    InterestCalcRequest,
    MinimumPaymentCalcRequest,
    BudgetPlannerRequest,
    CreditUtilizationRequest,
    CardBreakEvenRequest
)
from app.services.language_intelligence.assistant import MultilingualAssistantService

def test_curriculum_categories_and_modules():
    categories_en = CurriculumService.get_categories("en")
    assert len(categories_en) == 5
    assert any(c["id"] == "credit_fundamentals" for c in categories_en)
    assert any(c["id"] == "financial_safety" for c in categories_en)

    categories_hi = CurriculumService.get_categories("hi")
    assert len(categories_hi) == 5
    assert categories_hi[0]["title"] != categories_en[0]["title"]

    categories_kn = CurriculumService.get_categories("kn")
    assert len(categories_kn) == 5
    assert categories_kn[0]["title"] != categories_en[0]["title"]

    modules = CurriculumService.get_modules()
    assert len(modules) >= 10

    # Test detailed lesson with quiz
    detail = CurriculumService.get_module_detail("cf-01-how-cards-work", "en")
    assert detail is not None
    assert "revolving" in detail["content_markdown"].lower()
    assert len(detail["quiz"]) == 2
    assert len(detail["key_takeaways"]) >= 3

def test_interest_calculator_standard():
    req = InterestCalcRequest(
        balance=Decimal("20000.00"),
        apr_percentage=Decimal("42.0"),
        monthly_payment=Decimal("2000.00"),
        new_monthly_charges=Decimal("0.00")
    )
    res = EducationCalculators.calculate_interest(req)
    assert res.monthly_interest_rate_pct == Decimal("3.50")
    assert res.first_month_interest == Decimal("700.00")
    assert res.is_perpetual_debt is False
    assert res.months_to_payoff > 0
    assert res.total_interest_paid > Decimal("0.00")
    assert len(res.schedule_sample) > 0

def test_interest_calculator_perpetual_debt():
    # If payment is less than monthly interest, debt never amortizes
    req = InterestCalcRequest(
        balance=Decimal("20000.00"),
        apr_percentage=Decimal("42.0"),
        monthly_payment=Decimal("500.00"),  # Interest alone is ₹700!
        new_monthly_charges=Decimal("0.00")
    )
    res = EducationCalculators.calculate_interest(req)
    assert res.is_perpetual_debt is True
    assert res.months_to_payoff == 999

def test_minimum_payment_calculator():
    req = MinimumPaymentCalcRequest(
        balance=Decimal("20000.00"),
        apr_percentage=Decimal("42.0"),
        min_payment_pct=Decimal("5.0"),
        fixed_payment_option=Decimal("2000.00")
    )
    res = EducationCalculators.calculate_minimum_due(req)
    assert res.minimum_due_first_month == Decimal("1000.00")
    assert len(res.scenarios) == 3
    # Scenario 0 is Pay in Full (1 month, 0 interest)
    assert res.scenarios[0].months_to_payoff == 1
    assert res.scenarios[0].total_interest_paid == Decimal("0.00")
    # Scenario 2 is Minimum Due only
    min_scenario = res.scenarios[2]
    assert min_scenario.months_to_payoff > 40
    assert min_scenario.total_interest_paid > Decimal("10000.00")
    assert res.interest_difference > Decimal("0.00")

def test_budget_calculator_50_30_20():
    req = BudgetPlannerRequest(
        monthly_income=Decimal("50000.00"),
        category_budgets={
            "grocery": Decimal("15000.00"),  # Needs
            "utility": Decimal("10000.00"),  # Needs
            "dining": Decimal("8000.00"),    # Wants
            "shopping": Decimal("7000.00"),  # Wants
            "savings": Decimal("10000.00"),  # Savings
        }
    )
    res = EducationCalculators.calculate_budget(req)
    assert res.needs_amount == Decimal("25000.00")
    assert res.needs_percentage == Decimal("50.0")
    assert res.wants_amount == Decimal("15000.00")
    assert res.wants_percentage == Decimal("30.0")
    assert res.savings_amount == Decimal("10000.00")
    assert res.savings_percentage == Decimal("20.0")
    assert len(res.advice) > 0

def test_credit_utilization_calculator():
    # Test ideal ratio (<30%)
    req_ideal = CreditUtilizationRequest(
        total_limit=Decimal("100000.00"),
        total_balance=Decimal("25000.00")
    )
    res_ideal = EducationCalculators.calculate_utilization(req_ideal)
    assert res_ideal.overall_utilization_pct == Decimal("25.0")
    assert res_ideal.status == "IDEAL"
    assert res_ideal.amount_to_pay_for_ideal == Decimal("0.00")

    # Test high ratio (>50%)
    req_high = CreditUtilizationRequest(
        total_limit=Decimal("100000.00"),
        total_balance=Decimal("70000.00")
    )
    res_high = EducationCalculators.calculate_utilization(req_high)
    assert res_high.overall_utilization_pct == Decimal("70.0")
    assert res_high.status == "HIGH"
    assert res_high.target_balance_for_30_pct == Decimal("30000.00")
    assert res_high.amount_to_pay_for_ideal == Decimal("40000.00")

def test_card_break_even_calculator():
    # Card with fee waived on spending threshold
    req = CardBreakEvenRequest(
        annual_fee=Decimal("1500.00"),
        monthly_spend=Decimal("20000.00"),
        reward_rate_pct=Decimal("2.0"),
        annual_milestone_benefits=Decimal("1000.00"),
        waiver_spend_threshold=Decimal("200000.00")
    )
    res = EducationCalculators.calculate_break_even(req)
    assert res.annual_spend == Decimal("240000.00")
    assert res.is_fee_waived is True
    assert res.annual_rewards_earned == Decimal("4800.00")
    assert res.total_annual_benefits == Decimal("5800.00")
    assert res.net_value == Decimal("5800.00")

def test_assistant_education_query_with_zero_cards():
    # User with no cards asking what is minimum due
    res_en = MultilingualAssistantService._generate_grounded_response(
        query="Explain minimum due and why it's bad",
        lower_query="explain minimum due and why it's bad",
        language="en",
        user_cards=[],
        card_ids=[]
    )
    assert "Minimum Amount Due" in res_en.response
    assert "42%" in res_en.response
    assert len(res_en.citations) > 0

    # In Hindi
    res_hi = MultilingualAssistantService._generate_grounded_response(
        query="न्यूनतम देय क्या होता है?",
        lower_query="न्यूनतम देय क्या होता है?",
        language="hi",
        user_cards=[],
        card_ids=[]
    )
    assert "न्यूनतम देय" in res_hi.response
    assert "3.5%" in res_hi.response

    # In Kannada
    res_kn = MultilingualAssistantService._generate_grounded_response(
        query="ಕನಿಷ್ಠ ಬಾಕಿ ಪಾವತಿ ಬಗ್ಗೆ ತಿಳಿಸಿ",
        lower_query="ಕನಿಷ್ಠ ಬಾಕಿ ಪಾವತಿ ಬಗ್ಗೆ ತಿಳಿಸಿ",
        language="kn",
        user_cards=[],
        card_ids=[]
    )
    assert "ಕನಿಷ್ಠ" in res_kn.response

