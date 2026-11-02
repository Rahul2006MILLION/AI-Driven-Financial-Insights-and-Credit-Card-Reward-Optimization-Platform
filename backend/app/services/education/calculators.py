from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional
from app.schemas.education import (
    InterestCalcRequest,
    InterestCalcResponse,
    MonthlyScheduleItem,
    MinimumPaymentCalcRequest,
    MinimumPaymentCalcResponse,
    MinimumPaymentComparisonScenario,
    BudgetPlannerRequest,
    BudgetPlannerResponse,
    BudgetCategoryAnalysis,
    CreditUtilizationRequest,
    CreditUtilizationResponse,
    CardBreakEvenRequest,
    CardBreakEvenResponse,
)

class EducationCalculators:
    """
    Deterministic educational financial calculators built with practical Indian benchmarks.
    All calculations include educational disclaimers clarifying that numbers are illustrative
    and not direct promises or bank billing schedules.
    """

    @staticmethod
    def calculate_interest(req: InterestCalcRequest) -> InterestCalcResponse:
        balance = Decimal(str(req.balance))
        apr = Decimal(str(req.apr_percentage))
        monthly_payment = Decimal(str(req.monthly_payment))
        new_charges = Decimal(str(req.new_monthly_charges))

        monthly_rate = (apr / Decimal("12.0") / Decimal("100.0")).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        monthly_rate_pct = (monthly_rate * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        first_month_interest = (balance * monthly_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Perpetual debt check: if monthly payment does not cover interest + new charges
        net_amortization = monthly_payment - (first_month_interest + new_charges)
        is_perpetual = net_amortization <= Decimal("0.00")

        total_interest = Decimal("0.00")
        total_paid = Decimal("0.00")
        curr_bal = balance
        months = 0
        schedule: List[MonthlyScheduleItem] = []
        max_months = 360  # 30-year safety ceiling

        while curr_bal > Decimal("0.00") and months < max_months:
            months += 1
            interest = (curr_bal * monthly_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_interest += interest
            start_bal = curr_bal

            # Add monthly new purchases if any
            curr_bal += interest + new_charges

            if curr_bal <= monthly_payment:
                actual_pmt = curr_bal
                curr_bal = Decimal("0.00")
            else:
                actual_pmt = monthly_payment
                curr_bal -= actual_pmt

            total_paid += actual_pmt
            principal_portion = max(Decimal("0.00"), actual_pmt - interest)

            if months <= 12 or curr_bal == Decimal("0.00"):
                schedule.append(MonthlyScheduleItem(
                    month=months,
                    starting_balance=start_bal,
                    interest_charged=interest,
                    principal_paid=principal_portion,
                    payment=actual_pmt,
                    ending_balance=curr_bal
                ))

            if is_perpetual and months >= 36:
                break

        if is_perpetual:
            months = 999  # Represents perpetual debt

        disclaimer = (
            "Illustrative calculation assuming compounding finance charges calculated on average daily balance. "
            "Does not include 18% GST applicable on finance charges in India, or additional late payment fees."
        )

        return InterestCalcResponse(
            monthly_interest_rate_pct=monthly_rate_pct,
            first_month_interest=first_month_interest,
            total_interest_paid=total_interest.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            total_amount_paid=total_paid.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            months_to_payoff=months,
            is_perpetual_debt=is_perpetual,
            schedule_sample=schedule[:12],
            disclaimer=disclaimer
        )

    @staticmethod
    def calculate_minimum_due(req: MinimumPaymentCalcRequest) -> MinimumPaymentCalcResponse:
        balance = Decimal(str(req.balance))
        apr = Decimal(str(req.apr_percentage))
        min_pct = Decimal(str(req.min_payment_pct)) / Decimal("100.0")
        monthly_rate = (apr / Decimal("12.0") / Decimal("100.0")).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        min_due_floor = Decimal("500.00")  # Indian bank standard minimum floor

        # Scenario A: Paying ONLY Minimum Amount Due each month
        curr_bal_a = balance
        total_int_a = Decimal("0.00")
        total_paid_a = Decimal("0.00")
        months_a = 0
        first_min_due = max(min_due_floor, (balance * min_pct).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

        while curr_bal_a > Decimal("5.00") and months_a < 360:
            months_a += 1
            interest = (curr_bal_a * monthly_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_int_a += interest
            curr_bal_a += interest

            # Dynamic min payment
            pmt = max(min_due_floor, (curr_bal_a * min_pct).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
            if pmt >= curr_bal_a:
                pmt = curr_bal_a
                curr_bal_a = Decimal("0.00")
            else:
                curr_bal_a -= pmt
            total_paid_a += pmt

        ratio_a = (total_int_a / balance).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Scenario B: Paying a Fixed Accelerated Payment
        fixed_pmt = req.fixed_payment_option if req.fixed_payment_option and req.fixed_payment_option > first_min_due else (first_min_due * Decimal("2.0"))
        fixed_pmt = fixed_pmt.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        curr_bal_b = balance
        total_int_b = Decimal("0.00")
        total_paid_b = Decimal("0.00")
        months_b = 0

        while curr_bal_b > Decimal("0.00") and months_b < 360:
            months_b += 1
            interest = (curr_bal_b * monthly_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total_int_b += interest
            curr_bal_b += interest

            if curr_bal_b <= fixed_pmt:
                actual_pmt = curr_bal_b
                curr_bal_b = Decimal("0.00")
            else:
                actual_pmt = fixed_pmt
                curr_bal_b -= actual_pmt
            total_paid_b += actual_pmt

        ratio_b = (total_int_b / balance).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Scenario C: Paying Total Amount Due in Full
        scenario_c = MinimumPaymentComparisonScenario(
            name="Pay Full Statement Due",
            monthly_payment_desc=f"₹{balance:,.2f} once within grace period",
            months_to_payoff=1,
            total_interest_paid=Decimal("0.00"),
            total_amount_paid=balance,
            interest_to_principal_ratio=Decimal("0.00")
        )

        scenario_a = MinimumPaymentComparisonScenario(
            name="Pay Minimum Amount Due Only (5%)",
            monthly_payment_desc=f"Starts at ₹{first_min_due:,.2f}/mo (decreases gradually)",
            months_to_payoff=months_a,
            total_interest_paid=total_int_a.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            total_amount_paid=total_paid_a.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            interest_to_principal_ratio=ratio_a
        )

        scenario_b = MinimumPaymentComparisonScenario(
            name=f"Pay Fixed Monthly Sum (₹{fixed_pmt:,.0f})",
            monthly_payment_desc=f"Consistent ₹{fixed_pmt:,.2f}/mo until zero",
            months_to_payoff=months_b,
            total_interest_paid=total_int_b.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            total_amount_paid=total_paid_b.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            interest_to_principal_ratio=ratio_b
        )

        interest_diff = total_int_a - total_int_b
        time_saved = max(0, months_a - months_b)

        warning = (
            f"The Minimum Payment Trap: Paying only the 5% minimum due on ₹{balance:,.0f} keeps you in debt for "
            f"approx. {months_a // 12} years and {months_a % 12} months, costing an extra ₹{total_int_a:,.2f} in interest alone "
            f"({ratio_a * 100:.0f}% of your original purchase). Paying a fixed amount saves you ₹{interest_diff:,.2f} and {time_saved} months."
        )

        disclaimer = (
            "Illustrative comparison using Indian standard 5% min due rules. "
            "Does not account for 18% GST on interest, processing charges, or new purchases."
        )

        return MinimumPaymentCalcResponse(
            balance=balance,
            apr_percentage=apr,
            minimum_due_first_month=first_min_due,
            scenarios=[scenario_c, scenario_b, scenario_a],
            interest_difference=interest_diff.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            time_saved_months=time_saved,
            educational_warning=warning,
            disclaimer=disclaimer
        )

    @staticmethod
    def calculate_budget(req: BudgetPlannerRequest) -> BudgetPlannerResponse:
        income = Decimal(str(req.monthly_income))
        budgets = req.category_budgets or {}
        actuals = req.actual_spends or {}

        # 50-30-20 Classification Map
        needs_categories = {"grocery", "utility", "health", "fuel", "rent", "education", "insurance"}
        wants_categories = {"dining", "food_delivery", "shopping", "entertainment", "travel", "other"}
        savings_categories = {"savings", "investments", "emergency_fund", "sip"}

        total_allocated = Decimal("0.00")
        allocated_needs = Decimal("0.00")
        allocated_wants = Decimal("0.00")
        allocated_savings = Decimal("0.00")
        categories_analysis: List[BudgetCategoryAnalysis] = []

        cat_names = {
            "grocery": "Groceries & Supermarkets",
            "utility": "Utilities & Bills",
            "health": "Healthcare & Medical",
            "fuel": "Fuel & Commute",
            "dining": "Dining & Eating Out",
            "food_delivery": "Food Delivery Apps",
            "shopping": "Online & Retail Shopping",
            "entertainment": "Entertainment & OTT",
            "travel": "Travel & Holidays",
            "savings": "Savings & Emergency Fund",
            "other": "General Discretionary",
        }

        # Combine all categories from inputs
        all_keys = set(budgets.keys()) | set(actuals.keys())
        if not all_keys:
            # Default template based on income
            budgets = {
                "grocery": (income * Decimal("0.20")).quantize(Decimal("0.01")),
                "utility": (income * Decimal("0.15")).quantize(Decimal("0.01")),
                "dining": (income * Decimal("0.10")).quantize(Decimal("0.01")),
                "shopping": (income * Decimal("0.10")).quantize(Decimal("0.01")),
                "fuel": (income * Decimal("0.05")).quantize(Decimal("0.01")),
                "entertainment": (income * Decimal("0.05")).quantize(Decimal("0.01")),
                "savings": (income * Decimal("0.20")).quantize(Decimal("0.01")),
                "other": (income * Decimal("0.15")).quantize(Decimal("0.01")),
            }
            all_keys = set(budgets.keys())

        for cat in sorted(all_keys):
            alloc = Decimal(str(budgets.get(cat, Decimal("0.00"))))
            actual = Decimal(str(actuals.get(cat, Decimal("0.00"))))
            total_allocated += alloc

            if cat in needs_categories:
                allocated_needs += alloc
            elif cat in savings_categories:
                allocated_savings += alloc
            else:
                allocated_wants += alloc

            variance = alloc - actual
            util_pct = ((actual / alloc) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP) if alloc > Decimal("0.00") else Decimal("0.0")

            if alloc == Decimal("0.00"):
                status = "UNBUDGETED"
            elif util_pct > Decimal("100.0"):
                status = "OVER_BUDGET"
            elif util_pct >= Decimal("80.0"):
                status = "NEAR_LIMIT"
            else:
                status = "WITHIN_LIMIT"

            categories_analysis.append(BudgetCategoryAnalysis(
                category_id=cat,
                category_name=cat_names.get(cat, cat.replace("_", " ").title()),
                allocated_amount=alloc,
                actual_amount=actual,
                variance=variance,
                utilization_pct=util_pct,
                status=status
            ))

        # Explicit savings allocation calculation: if not entered, treat unallocated as potential savings
        unallocated = income - total_allocated
        if allocated_savings == Decimal("0.00") and unallocated > Decimal("0.00"):
            allocated_savings = unallocated

        needs_pct = ((allocated_needs / income) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        wants_pct = ((allocated_wants / income) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        savings_pct = ((allocated_savings / income) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

        advice: List[str] = []
        if needs_pct > Decimal("55.0"):
            advice.append(f"Essential Needs (50% target) stand at {needs_pct}%. Consider reviewing high recurring bills or grocery subscriptions.")
        elif needs_pct <= Decimal("50.0"):
            advice.append(f"Needs are well contained at {needs_pct}% (Ideal: ≤50%). Excellent foundation for financial security.")

        if wants_pct > Decimal("35.0"):
            advice.append(f"Discretionary Wants (30% target) stand at {wants_pct}%. Applying the 48-hour pause rule for non-essential purchases can free up savings.")
        else:
            advice.append(f"Wants are comfortably within the 30% guideline at {wants_pct}%.")

        if savings_pct < Decimal("20.0"):
            advice.append(f"Savings rate is currently {savings_pct}% (Target: ≥20%). Directing automated transfers into a recurring deposit or liquid fund on salary day helps.")
        else:
            advice.append(f"Great job! Your planned savings rate of {savings_pct}% achieves or exceeds the 20% benchmark.")

        assessment = f"50/30/20 Alignment: Needs {needs_pct}%, Wants {wants_pct}%, Savings {savings_pct}%."

        return BudgetPlannerResponse(
            monthly_income=income,
            total_allocated=total_allocated,
            unallocated_income=max(Decimal("0.00"), unallocated),
            needs_amount=allocated_needs,
            needs_percentage=needs_pct,
            wants_amount=allocated_wants,
            wants_percentage=wants_pct,
            savings_amount=allocated_savings,
            savings_percentage=savings_pct,
            rule_50_30_20_assessment=assessment,
            categories=categories_analysis,
            advice=advice
        )

    @staticmethod
    def calculate_utilization(req: CreditUtilizationRequest) -> CreditUtilizationResponse:
        total_limit = Decimal("0.00")
        total_balance = Decimal("0.00")

        if req.cards:
            for c in req.cards:
                total_limit += Decimal(str(c.credit_limit))
                total_balance += Decimal(str(c.current_balance))
        else:
            total_limit = Decimal(str(req.total_limit or Decimal("100000.00")))
            total_balance = Decimal(str(req.total_balance or Decimal("0.00")))

        if total_limit <= Decimal("0.00"):
            total_limit = Decimal("1.00")  # Division protection

        util_pct = ((total_balance / total_limit) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        target_30_balance = (total_limit * Decimal("0.30")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        amount_to_pay = max(Decimal("0.00"), total_balance - target_30_balance).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        steps: List[str] = []
        if util_pct <= Decimal("30.0"):
            status = "IDEAL"
            assessment = "Optimal Credit Health (Below 30%): Bureau algorithms view low utilization as a strong sign of financial stability and credit discipline."
            steps.append("Maintain balances below 30% to steadily improve your CIBIL/Experian credit profile.")
            steps.append("Pay off full statements before the due date to avoid interest while preserving this ideal ratio.")
        elif util_pct <= Decimal("50.0"):
            status = "MODERATE"
            assessment = "Moderate Utilization (30% - 50%): Scoring models begin applying mild penalties above 30%. Paying a small portion can elevate your profile."
            steps.append(f"Pay down ₹{amount_to_pay:,.2f} before the statement generation date to bring utilization below the 30% threshold.")
            steps.append("Request a limit enhancement from your bank if eligible; a higher limit instantly lowers your utilization percentage.")
        elif util_pct <= Decimal("75.0"):
            status = "HIGH"
            assessment = "High Utilization (50% - 75%): Significant score suppression risk. Lenders may interpret high revolving debt as credit dependency."
            steps.append(f"Prioritize paying ₹{amount_to_pay:,.2f} to restore healthy credit score velocity.")
            steps.append("Avoid large discretionary card swipes until current balances are settled.")
        else:
            status = "CRITICAL"
            assessment = "Critical Utilization (>75%): Severe score risk and vulnerability to over-limit penalties. Restricts approval for personal or home loans."
            steps.append("Stop further credit card swipes immediately; switch all daily essentials to UPI / debit card.")
            steps.append("Consider converting high-balance purchases into low-interest bank EMIs to stop compounded finance charges.")

        disclaimer = (
            "Educational utilization guideline. Credit scoring bureaus calculate utilization across both individual "
            "cards and total aggregate limits on the statement closing date. CLIQ does not pull or modify official bureau files."
        )

        return CreditUtilizationResponse(
            total_limit=total_limit,
            total_balance=total_balance,
            overall_utilization_pct=util_pct,
            status=status,
            target_balance_for_30_pct=target_30_balance,
            amount_to_pay_for_ideal=amount_to_pay,
            cibil_impact_assessment=assessment,
            actionable_steps=steps,
            disclaimer=disclaimer
        )

    @staticmethod
    def calculate_break_even(req: CardBreakEvenRequest) -> CardBreakEvenResponse:
        fee = Decimal(str(req.annual_fee))
        monthly_spend = Decimal(str(req.monthly_spend))
        rate_pct = Decimal(str(req.reward_rate_pct))
        rate = rate_pct / Decimal("100.0")
        milestone = Decimal(str(req.annual_milestone_benefits))
        waiver_threshold = Decimal(str(req.waiver_spend_threshold)) if req.waiver_spend_threshold else None

        annual_spend = (monthly_spend * Decimal("12.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        annual_rewards = (annual_spend * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_benefits = (annual_rewards + milestone).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        is_waived = bool(waiver_threshold and annual_spend >= waiver_threshold)
        effective_fee = Decimal("0.00") if is_waived else fee
        net_value = (total_benefits - effective_fee).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if rate > Decimal("0.00"):
            be_annual = (fee / rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            be_monthly = (be_annual / Decimal("12.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            be_annual = Decimal("9999999.00")
            be_monthly = Decimal("999999.00")

        is_worth = net_value > Decimal("0.00")

        if is_waived:
            verdict = (
                f"Highly Lucrative: With an annual spend of ₹{annual_spend:,.2f}, the ₹{fee:,.2f} renewal fee is fully waived "
                f"(threshold: ₹{waiver_threshold:,.2f}). You earn a pure profit of ₹{net_value:,.2f} in rewards & benefits."
            )
        elif is_worth:
            verdict = (
                f"Profitable Investment: Your planned spending generates ₹{total_benefits:,.2f} in value against a ₹{fee:,.2f} fee, "
                f"leaving a net financial gain of ₹{net_value:,.2f}/year. Break-even requires ₹{be_monthly:,.2f}/month."
            )
        else:
            verdict = (
                f"Fee Drain Warning: At your planned monthly spend of ₹{monthly_spend:,.2f}, total benefits (₹{total_benefits:,.2f}) "
                f"fall short of the ₹{fee:,.2f} annual fee by ₹{abs(net_value):,.2f}. Consider a lifetime free card or spend at least ₹{be_monthly:,.2f}/month to break even."
            )

        disclaimer = (
            "Illustrative evaluation based on assumed reward realization. Does not account for category-specific reward caps, "
            "redemption handling charges, or non-qualifying transactions like fuel or government payments."
        )

        return CardBreakEvenResponse(
            annual_fee=fee,
            annual_spend=annual_spend,
            annual_rewards_earned=annual_rewards,
            total_annual_benefits=total_benefits,
            net_value=net_value,
            break_even_annual_spend=be_annual,
            break_even_monthly_spend=be_monthly,
            is_fee_waived=is_waived,
            is_card_worth_it=is_worth,
            verdict=verdict,
            disclaimer=disclaimer
        )

