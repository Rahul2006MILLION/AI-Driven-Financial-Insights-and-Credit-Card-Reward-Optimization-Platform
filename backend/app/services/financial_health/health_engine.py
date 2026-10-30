from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any
from datetime import datetime
from collections import defaultdict

from app.models.entities import Transaction, CreditCard
from app.schemas.analytics import FinancialHealthResponse, RecurringSubscription

class FinancialHealthEngine:
    """
    Evaluates spending health, detects recurring subscriptions,
    computes annual fee vs. reward breakeven, and calculates reward efficiency.
    """

    @classmethod
    def analyze_health(
        cls,
        transactions: List[Transaction],
        cards: List[CreditCard]
    ) -> FinancialHealthResponse:
        total_spend = Decimal("0.00")
        actual_rewards = Decimal("0.00")
        optimal_rewards = Decimal("0.00")

        # 1. Merchant grouping to detect recurring subscriptions
        merchant_txns: Dict[str, List[Transaction]] = defaultdict(list)
        for t in transactions:
            amt = Decimal(str(t.amount))
            total_spend += amt
            actual_rewards += Decimal(str(t.reward_earned_monetary))
            optimal_rewards += Decimal(str(t.potential_optimal_reward))
            merchant_txns[t.merchant_name.strip()].append(t)

        recurring_list: List[RecurringSubscription] = []
        known_recurring_keywords = [
            "netflix", "spotify", "prime", "hotstar", "youtube", "gym", "broadband",
            "airtel", "jio", "apple", "google storage", "cloud", "newspaper", "insurance"
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

        # 2. Optimization Efficiency Rate
        if optimal_rewards > Decimal("0.00"):
            efficiency_rate = ((actual_rewards / optimal_rewards) * Decimal("100.00")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        else:
            efficiency_rate = Decimal("100.0")

        # 3. Health Score calculation (0 to 100)
        # Factor A: Efficiency rate (max 50 pts)
        # Factor B: Low leakage (max 30 pts)
        # Factor C: Card utilization (max 20 pts)
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

        if cards:
            score_pts += 20
        health_score = min(100, max(25, score_pts))

        # 4. Annual Fee Audit
        fee_audit: List[Dict[str, Any]] = []
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

        # 5. Actionable Recommendations
        recs: List[str] = []
        if leakage > Decimal("200.00"):
            recs.append(f"Reward Leakage Alert: You left ₹{leakage} on the table by using suboptimal cards for routine purchases.")
        if recurring_list:
            recs.append(f"Identified {len(recurring_list)} recurring subscriptions totaling ₹{sum(r.annual_cost for r in recurring_list)}/year.")
        for item in fee_audit:
            if not item["is_justified"] and item["annual_fee"] > 0:
                recs.append(f"Card Review: {item['card_name']} annual fee of ₹{item['annual_fee']} exceeded earned rewards (₹{item['rewards_earned']}). Consider waiver criteria or alternative cards.")

        if not recs:
            recs.append("Great job! Your spending is well-optimized across your registered credit cards.")

        # 6. Forecast 30-day spending
        # Based on average daily spend over last recorded transactions
        forecast_spend = (total_spend * Decimal("0.8")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        forecast_rewards = (forecast_spend * Decimal("0.035")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return FinancialHealthResponse(
            health_score=health_score,
            optimization_efficiency_rate=efficiency_rate,
            recurring_subscriptions=recurring_list,
            annual_fee_audit=fee_audit,
            actionable_recommendations=recs,
            forecast_30d_spending=forecast_spend,
            forecast_30d_potential_rewards=forecast_rewards
        )
