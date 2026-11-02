from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict

from app.models.entities import Transaction, CreditCard, UserBudget
from app.schemas.analytics import FinancialHealthResponse, RecurringSubscription

class FinancialHealthEngine:
    """
    Evaluates personal financial health for both Credit Card and No-Credit-Card users.
    For Credit Card users: evaluates reward efficiency, annual fee breakeven, and spend caps.
    For No-Credit-Card users: evaluates cash-flow balance, savings rate, budget adherence, and recurring commitments.
    All evaluations emit transparent mathematical provenance traces.
    """

    @classmethod
    def analyze_health(
        cls,
        transactions: List[Transaction],
        cards: List[CreditCard],
        budget: Optional[UserBudget] = None,
        incomes: Optional[List[Any]] = None,
        financial_pathway: str = "CREDIT_CARD"
    ) -> FinancialHealthResponse:
        total_spend = Decimal("0.00")
        actual_rewards = Decimal("0.00")
        optimal_rewards = Decimal("0.00")

        # 1. Date window & merchant grouping
        merchant_txns: Dict[str, List[Transaction]] = defaultdict(list)
        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        sixty_days_ago = now - timedelta(days=60)

        spend_last_30d = Decimal("0.00")
        spend_prev_30d = Decimal("0.00")

        for t in transactions:
            amt = Decimal(str(t.amount))
            total_spend += amt
            actual_rewards += Decimal(str(t.reward_earned_monetary))
            optimal_rewards += Decimal(str(t.potential_optimal_reward))
            merchant_txns[t.merchant_name.strip()].append(t)

            if t.transaction_date >= thirty_days_ago:
                spend_last_30d += amt
            elif sixty_days_ago <= t.transaction_date < thirty_days_ago:
                spend_prev_30d += amt

        # Spending Trend %
        if spend_prev_30d > Decimal("0.00"):
            spending_trend_pct = (((spend_last_30d - spend_prev_30d) / spend_prev_30d) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        else:
            spending_trend_pct = Decimal("0.0")

        # 2. Recurring subscription detection
        recurring_list: List[RecurringSubscription] = []
        known_recurring_keywords = [
            "netflix", "spotify", "prime", "hotstar", "youtube", "gym", "broadband",
            "airtel", "jio", "apple", "google storage", "cloud", "newspaper", "insurance",
            "electricity", "water", "rent", "wifi"
        ]

        for m_name, tx_list in merchant_txns.items():
            lower_m = m_name.lower()
            is_rec = any(kw in lower_m for kw in known_recurring_keywords) or len(tx_list) >= 2 or any(tx.is_recurring for tx in tx_list)
            if is_rec and tx_list:
                avg_amt = (sum(Decimal(str(x.amount)) for x in tx_list) / Decimal(len(tx_list))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                annual_cost = (avg_amt * Decimal("12.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                sorted_tx = sorted(tx_list, key=lambda x: x.transaction_date, reverse=True)
                recurring_list.append(RecurringSubscription(
                    merchant_name=m_name,
                    category_id=sorted_tx[0].category_id,
                    average_amount=avg_amt,
                    frequency="Monthly",
                    last_billed=sorted_tx[0].transaction_date.strftime("%Y-%m-%d"),
                    recommended_card_id=sorted_tx[0].optimal_card_id,
                    annual_cost=annual_cost
                ))

        annual_recurring = sum(r.annual_cost for r in recurring_list)
        ed_alerts: List[str] = []
        recs: List[str] = []

        # 3. Monthly Income resolution (from incomes list or budget fallback)
        known_monthly_income = Decimal("0.00")
        has_income_data = False
        if incomes:
            for inc in incomes:
                amt = Decimal(str(inc.amount))
                freq = getattr(inc, "frequency", "MONTHLY").upper()
                if freq == "MONTHLY":
                    known_monthly_income += amt
                elif freq == "WEEKLY":
                    known_monthly_income += (amt * Decimal("52") / Decimal("12")).quantize(Decimal("0.01"))
                elif freq == "BI_WEEKLY":
                    known_monthly_income += (amt * Decimal("26") / Decimal("12")).quantize(Decimal("0.01"))
                elif freq in ("ONE_TIME", "IRREGULAR"):
                    known_monthly_income += (amt / Decimal("3")).quantize(Decimal("0.01"))
            has_income_data = True
        elif budget and budget.monthly_income and Decimal(str(budget.monthly_income)) > Decimal("0.00"):
            known_monthly_income = Decimal(str(budget.monthly_income))
            has_income_data = True

        # 4. Budget status summary
        budget_summary = None
        if budget and budget.total_budget > Decimal("0.00"):
            util_pct = ((spend_last_30d / budget.total_budget) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            budget_summary = {
                "total_budget": float(budget.total_budget),
                "monthly_income": float(known_monthly_income) if has_income_data else None,
                "spent_last_30d": float(spend_last_30d),
                "utilization_pct": float(util_pct)
            }
            if util_pct > Decimal("100.0"):
                ed_alerts.append(f"Monthly Budget Alert: Current 30-day spend (₹{spend_last_30d:,.2f}) has exceeded your planned limit of ₹{budget.total_budget:,.2f} ({util_pct}%).")
            elif util_pct >= Decimal("80.0"):
                ed_alerts.append(f"Monthly Budget Notice: You are at {util_pct}% of your budget limit (₹{spend_last_30d:,.2f} of ₹{budget.total_budget:,.2f}).")

        # 5. Branching: Credit Card Pathway vs No-Credit-Card Pathway
        is_no_card_mode = (len(cards) == 0) or (financial_pathway == "NO_CREDIT_CARD")

        if is_no_card_mode:
            # === NO-CREDIT-CARD MODE ANALYSIS ===
            omitted = [
                "Credit Card Reward Optimization Efficiency",
                "Card Annual Fee vs Reward Breakeven",
                "Credit Limit Utilization Ratio"
            ]
            efficiency_rate = Decimal("100.0")
            forecast_rewards = Decimal("0.00")
            fee_audit: List[Dict[str, Any]] = []

            # Check data sufficiency components
            has_valid_income = has_income_data and known_monthly_income > Decimal("0.00")
            has_valid_budget = budget is not None and budget.total_budget > Decimal("0.00")
            has_transactions = spend_last_30d > Decimal("0.00") or len(transactions) > 0

            # DEF-05: Remove synthetic scores when data is missing or empty
            missing_inputs = []
            if not has_valid_income:
                missing_inputs.append("income")
            if not has_valid_budget:
                missing_inputs.append("budget")
            if not has_transactions:
                missing_inputs.append("transactions")

            if not has_valid_income and not has_valid_budget and not has_transactions:
                # Completely empty profile: NO synthetic 75/100 score
                health_score = 0
                pillar_savings_pts = 0
                pillar_budget_pts = 0
                pillar_sub_pts = 0
                savings_rate_pct = None
                mode_sufficiency = "INSUFFICIENT_DATA"

                ed_alerts.append("Data Baseline Notice: No income, budget, or transaction records found. Add your monthly income and log expenses to unlock your personalized financial health index.")
                recs.append("Income Setup: Add your monthly income streams under Budget & Incomes.")
                recs.append("Budgeting: Create a category-wise 50/30/20 budget to guide your monthly spending.")
                recs.append("Expense Tracking: Record daily cash, UPI, or bank transactions to start tracking cash flow.")

            else:
                # Evidenced scoring: calculate only based on actual data
                # Pillar A: Savings & Cash-Flow Buffer (Max 45 pts)
                pillar_savings_pts = 0
                savings_rate_pct = None
                if has_valid_income and has_transactions:
                    net_savings = known_monthly_income - spend_last_30d
                    savings_rate_pct = ((net_savings / known_monthly_income) * Decimal("100.0")).quantize(Decimal("0.1"))
                    if savings_rate_pct >= Decimal("25.0"):
                        pillar_savings_pts = 45
                    elif savings_rate_pct >= Decimal("15.0"):
                        pillar_savings_pts = 38
                    elif savings_rate_pct >= Decimal("5.0"):
                        pillar_savings_pts = 28
                    elif savings_rate_pct >= Decimal("0.0"):
                        pillar_savings_pts = 20
                    else:
                        pillar_savings_pts = 8
                        ed_alerts.append(f"Cash Flow Deficit: Last 30-day spending (₹{spend_last_30d:,.2f}) exceeded monthly income (₹{known_monthly_income:,.2f}) by ₹{abs(net_savings):,.2f}.")
                elif has_valid_income and not has_transactions:
                    # Income known, but no transactions recorded yet
                    pillar_savings_pts = 15  # partial provisional credit for established income
                    ed_alerts.append("Data Notice: Monthly income is recorded. Add expenses to calculate your actual monthly savings rate.")
                else:
                    ed_alerts.append("Data Notice: Monthly income has not been recorded. Add income streams under Budget to unlock savings rate scoring.")

                # Pillar B: Budget Adherence (Max 35 pts)
                pillar_budget_pts = 0
                if has_valid_budget and has_transactions:
                    util = ((spend_last_30d / budget.total_budget) * Decimal("100.0"))
                    if util <= Decimal("80.0"):
                        pillar_budget_pts = 35
                    elif util <= Decimal("100.0"):
                        pillar_budget_pts = 28
                    elif util <= Decimal("120.0"):
                        pillar_budget_pts = 16
                    else:
                        pillar_budget_pts = 8
                elif has_valid_budget and not has_transactions:
                    pillar_budget_pts = 15  # provisional baseline credit for establishing a budget plan
                    ed_alerts.append("Data Notice: Monthly budget target is set. Record daily transactions to assess budget adherence.")
                else:
                    recs.append("Budget Setup: Creating a category-wise monthly budget helps prevent end-of-month cash pinches.")

                # Pillar C: Subscription Hygiene (Max 20 pts)
                pillar_sub_pts = 0
                rec_monthly = sum(r.average_amount for r in recurring_list)
                if has_transactions and spend_last_30d > Decimal("0.00"):
                    rec_ratio = (rec_monthly / spend_last_30d) * Decimal("100.0")
                    if rec_ratio > Decimal("35.0"):
                        pillar_sub_pts = 10
                        recs.append(f"Fixed Cost Audit: Recurring commitments represent {rec_ratio.quantize(Decimal('0.1'))}% of monthly outflow. Review unused subscriptions.")
                    elif rec_ratio > Decimal("20.0"):
                        pillar_sub_pts = 15
                    else:
                        pillar_sub_pts = 20
                elif has_transactions and spend_last_30d == Decimal("0.00"):
                    pillar_sub_pts = 20

                raw_score = pillar_savings_pts + pillar_budget_pts + pillar_sub_pts
                health_score = min(100, max(0, raw_score))
                mode_sufficiency = "COMPLETE" if (has_valid_income and has_valid_budget and has_transactions) else "PROVISIONAL"

            calculation_breakdown = {
                "evaluation_mode": "NO_CREDIT_CARD_CASH_FLOW",
                "data_sufficiency": mode_sufficiency,
                "missing_inputs": missing_inputs,
                "pillars": {
                    "savings_and_cash_flow": {
                        "score": pillar_savings_pts,
                        "max": 45,
                        "savings_rate_pct": float(savings_rate_pct) if savings_rate_pct is not None else None,
                        "evidenced": has_valid_income and has_transactions
                    },
                    "budget_adherence": {
                        "score": pillar_budget_pts,
                        "max": 35,
                        "utilization_pct": float(budget_summary["utilization_pct"]) if budget_summary else None,
                        "evidenced": has_valid_budget and has_transactions
                    },
                    "subscription_hygiene": {
                        "score": pillar_sub_pts,
                        "max": 20,
                        "active_subscriptions": len(recurring_list),
                        "evidenced": has_transactions
                    }
                },
                "total_score": health_score,
            }

            ed_alerts.append("No-Credit-Card Mode Active: Health score evaluates cash-flow resilience, savings rate, and budget discipline. Card reward and fee audits are omitted.")

            if has_valid_income:
                target_emergency = (spend_last_30d * Decimal("3.0")).quantize(Decimal("0.01"))
                recs.append(f"Emergency Reserve Goal: Build a 3-month liquid buffer of approx. ₹{target_emergency:,.2f} in a high-yield savings account.")

        else:
            # === CREDIT CARD USER MODE ANALYSIS ===
            omitted = []
            if optimal_rewards > Decimal("0.00"):
                efficiency_rate = ((actual_rewards / optimal_rewards) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            else:
                efficiency_rate = Decimal("100.0")

            score_pts = int(min(Decimal("50.0"), efficiency_rate * Decimal("0.5")))
            leakage = max(Decimal("0.00"), optimal_rewards - actual_rewards)
            if total_spend > Decimal("0.00"):
                leak_ratio = leakage / total_spend
                if leak_ratio < Decimal("0.01"):
                    score_pts += 30
                elif leak_ratio < Decimal("0.03"):
                    score_pts += 20
                else:
                    score_pts += 10
            else:
                score_pts += 30

            score_pts += 20  # Card portfolio active
            health_score = min(100, max(25, score_pts))

            # Annual Fee Audit
            fee_audit = []
            for c in cards:
                fee = Decimal(str(c.annual_fee))
                card_tx = [t for t in transactions if t.card_id == c.id]
                rewards_on_card = sum(Decimal(str(t.reward_earned_monetary)) for t in card_tx)
                is_justified = (rewards_on_card >= fee) or fee == Decimal("0.00")
                fee_audit.append({
                    "card_id": c.id,
                    "card_name": c.card_name,
                    "annual_fee": float(fee),
                    "rewards_earned": float(rewards_on_card),
                    "net_profit": float(rewards_on_card - fee),
                    "is_justified": is_justified,
                    "waiver_spend_threshold": float(c.renewal_waiver_spend) if c.renewal_waiver_spend else None
                })

            forecast_spend = (spend_last_30d if spend_last_30d > 0 else (total_spend * Decimal("0.8"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            forecast_rewards = (forecast_spend * Decimal("0.035")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            if leakage > Decimal("200.00"):
                recs.append(f"Reward Leakage Alert: You left ₹{leakage:,.2f} on the table by using suboptimal cards for routine purchases.")
            for item in fee_audit:
                if not item["is_justified"] and item["annual_fee"] > 0:
                    recs.append(f"Card Review: {item['card_name']} annual fee of ₹{item['annual_fee']:,.2f} exceeded earned rewards (₹{item['rewards_earned']:,.2f}). Consider waiver criteria or alternative cards.")

            calculation_breakdown = {
                "evaluation_mode": "CREDIT_CARD_OPTIMIZATION",
                "reward_efficiency_rate": float(efficiency_rate),
                "reward_leakage": float(leakage),
                "active_cards_evaluated": len(cards),
                "total_score": health_score,
                "data_sufficiency": "COMPLETE"
            }

        # Trend alert
        if spending_trend_pct > Decimal("15.0"):
            ed_alerts.append(f"Spending Trend: Your expenditure increased by {spending_trend_pct}% compared to the prior 30 days. Review discretionary categories like dining and shopping.")
        elif spending_trend_pct < Decimal("-15.0"):
            ed_alerts.append(f"Spending Trend: Your expenditure decreased by {abs(spending_trend_pct)}% compared to the prior 30 days. Good job on keeping spending constrained!")

        if recurring_list:
            ed_alerts.append(f"Subscription Hygiene: You have {len(recurring_list)} recurring subscriptions totaling approx. ₹{annual_recurring:,.2f}/year.")

        if not recs:
            recs.append("Great job! Your spending is well-aligned with your financial goals.")

        forecast_spend = (spend_last_30d if spend_last_30d > 0 else (total_spend * Decimal("0.8"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if is_no_card_mode:
            overall_data_sufficiency = mode_sufficiency
        else:
            if not cards and not transactions:
                overall_data_sufficiency = "INSUFFICIENT_DATA"
                health_score = 0
                calculation_breakdown["data_sufficiency"] = "INSUFFICIENT_DATA"
                calculation_breakdown["total_score"] = 0
                ed_alerts.append("Data Baseline Notice: No credit cards or transaction history found. Add your card portfolio or transactions to calculate your credit optimization score.")
            elif not cards or not transactions:
                overall_data_sufficiency = "PROVISIONAL"
                calculation_breakdown["data_sufficiency"] = "PROVISIONAL"
            else:
                overall_data_sufficiency = "COMPLETE"
                calculation_breakdown["data_sufficiency"] = "COMPLETE"

        return FinancialHealthResponse(
            health_score=health_score,
            optimization_efficiency_rate=efficiency_rate,
            recurring_subscriptions=recurring_list,
            annual_fee_audit=fee_audit,
            actionable_recommendations=recs,
            forecast_30d_spending=forecast_spend,
            forecast_30d_potential_rewards=forecast_rewards,
            spending_trend_pct=spending_trend_pct,
            educational_alerts=ed_alerts,
            budget_status_summary=budget_summary,
            calculation_breakdown=calculation_breakdown,
            data_sufficiency=overall_data_sufficiency,
            omitted_indicators=omitted
        )
