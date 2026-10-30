import pytest
from decimal import Decimal
from app.models.entities import CreditCard, CardRewardRule
from app.services.reward_optimization.engine import RewardOptimizationEngine

def create_mock_card(
    card_id: str,
    card_name: str,
    rules: list,
    annual_fee: Decimal = Decimal("0.00"),
    is_active: bool = True
) -> CreditCard:
    card = CreditCard(
        id=card_id,
        user_id="usr_test_123",
        card_name=card_name,
        bank_name="Test Bank",
        network="VISA",
        card_type="CREDIT",
        annual_fee=annual_fee,
        is_active=is_active
    )
    rule_objs = []
    for idx, r in enumerate(rules):
        rule_objs.append(CardRewardRule(
            id=f"rule_{card_id}_{idx}",
            card_id=card_id,
            category_id=r.get("category_id"),
            merchant_pattern=r.get("merchant_pattern"),
            reward_type=r.get("reward_type", "CASHBACK"),
            reward_rate_percentage=Decimal(str(r.get("reward_rate_percentage", "1.0"))),
            point_monetary_value=Decimal(str(r.get("point_monetary_value", "1.0"))),
            min_transaction_amount=Decimal(str(r.get("min_transaction_amount", "0.0"))),
            max_reward_per_transaction=Decimal(str(r["max_reward_per_transaction"])) if r.get("max_reward_per_transaction") else None,
            monthly_cap_amount=Decimal(str(r["monthly_cap_amount"])) if r.get("monthly_cap_amount") else None,
            is_excluded=r.get("is_excluded", False),
            exclusion_reason=r.get("exclusion_reason")
        ))
    card.reward_rules = rule_objs
    return card

class TestRewardOptimizationEngine:
    def test_exact_decimal_calculation(self):
        """Verifies no floating-point rounding quirks occur."""
        card = create_mock_card(
            card_id="c1",
            card_name="Millennia",
            rules=[{"category_id": "shopping", "reward_rate_percentage": "5.0"}]
        )
        # ₹1234.56 * 5% = 61.728 -> quantizes to ₹61.73
        eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("1234.56"),
            category_id="shopping"
        )
        assert eval_res.expected_reward_monetary == Decimal("61.73")
        assert eval_res.effective_rate_percentage == Decimal("5.00")

    def test_merchant_pattern_accelerator(self):
        """Merchant-specific rule takes precedence over general category."""
        card = create_mock_card(
            card_id="c2",
            card_name="Axis Ace",
            rules=[
                {"category_id": "dining", "merchant_pattern": "Swiggy", "reward_rate_percentage": "5.0"},
                {"category_id": "dining", "reward_rate_percentage": "2.0"}
            ]
        )
        # Swiggy gets 5%
        swiggy_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("1000.00"),
            category_id="dining",
            merchant_name="Swiggy Instamart"
        )
        assert swiggy_res.expected_reward_monetary == Decimal("50.00")

        # Other restaurant gets 2%
        other_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("1000.00"),
            category_id="dining",
            merchant_name="Local Cafe"
        )
        assert other_res.expected_reward_monetary == Decimal("20.00")

    def test_exclusion_rule(self):
        """Exclusion rule returns 0% and sets exclusion flag."""
        card = create_mock_card(
            card_id="c3",
            card_name="Cashback Card",
            rules=[
                {"category_id": "fuel", "is_excluded": True, "exclusion_reason": "Fuel excluded from rewards"},
                {"category_id": "all", "reward_rate_percentage": "1.5"}
            ]
        )
        fuel_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("3000.00"),
            category_id="fuel",
            merchant_name="HPCL"
        )
        assert fuel_res.expected_reward_monetary == Decimal("0.00")
        assert fuel_res.is_excluded is True
        assert "Fuel excluded" in fuel_res.exclusion_reason

    def test_monthly_cap_enforcement(self):
        """Capped reward does not exceed monthly ceiling."""
        card = create_mock_card(
            card_id="c4",
            card_name="Capped Cashback",
            rules=[{
                "category_id": "utility",
                "reward_rate_percentage": "10.0",
                "monthly_cap_amount": "500.00"
            }]
        )
        # Already spent rewards = ₹450, available cap = ₹50
        # Transaction ₹2000 @ 10% = ₹200 raw reward, but cap limits to ₹50
        eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("2000.00"),
            category_id="utility",
            current_month_spent_rewards=Decimal("450.00")
        )
        assert eval_res.expected_reward_monetary == Decimal("50.00")

    def test_per_transaction_cap(self):
        """Per-transaction limit is strictly enforced."""
        card = create_mock_card(
            card_id="c5",
            card_name="Per Txn Capped",
            rules=[{
                "category_id": "all",
                "reward_rate_percentage": "5.0",
                "max_reward_per_transaction": "150.00"
            }]
        )
        # ₹10,000 * 5% = ₹500, but cap is ₹150
        eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("10000.00"),
            category_id="shopping"
        )
        assert eval_res.expected_reward_monetary == Decimal("150.00")

    def test_card_ranking_and_tie_breaking(self):
        """Highest net yield ranked first; tie broken by lower annual fee."""
        card_expensive = create_mock_card(
            card_id="c_exp",
            card_name="Premium Card",
            rules=[{"category_id": "all", "reward_rate_percentage": "2.0"}],
            annual_fee=Decimal("5000.00")
        )
        card_free = create_mock_card(
            card_id="c_free",
            card_name="Free Card",
            rules=[{"category_id": "all", "reward_rate_percentage": "2.0"}],
            annual_fee=Decimal("0.00")
        )
        card_super = create_mock_card(
            card_id="c_super",
            card_name="Super 5% Card",
            rules=[{"category_id": "shopping", "reward_rate_percentage": "5.0"}],
            annual_fee=Decimal("1000.00")
        )

        res = RewardOptimizationEngine.optimize_transaction(
            cards=[card_expensive, card_free, card_super],
            amount=Decimal("2000.00"),
            category_id="shopping"
        )

        # Super card (₹100) must be 1st
        assert res.recommended_card.card_name == "Super 5% Card"
        assert res.recommended_card.expected_reward_monetary == Decimal("100.00")

        # In alternatives: both earn ₹40, but Free Card has ₹0 fee so it must rank above Premium Card (₹5000 fee)
        assert res.alternatives[0].card_name == "Free Card"
        assert res.alternatives[1].card_name == "Premium Card"
