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

    def test_minimum_spend_not_met(self):
        """Transaction below minimum spend requirement yields ₹0."""
        card = create_mock_card(
            card_id="c_min",
            card_name="Travel Card",
            rules=[{
                "category_id": "travel",
                "reward_rate_percentage": "10.0",
                "min_transaction_amount": "1000.00"
            }]
        )
        res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("500.00"),
            category_id="travel"
        )
        assert res.expected_reward_monetary == Decimal("0.00")
        assert res.effective_rate_percentage == Decimal("0.00")
        assert "Minimum spend of ₹1000.00 not met" in res.exclusion_reason

    def test_inactive_card_is_excluded(self):
        """Inactive cards are marked excluded with 0 expected reward."""
        card = create_mock_card(
            card_id="c_inactive",
            card_name="Disabled Card",
            rules=[{"category_id": "all", "reward_rate_percentage": "5.0"}],
            is_active=False
        )
        res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("1000.00"),
            category_id="shopping"
        )
        assert res.is_excluded is True
        assert res.expected_reward_monetary == Decimal("0.00")
        assert "inactive" in res.exclusion_reason.lower()

    def test_points_reward_type_with_fractional_point_value(self):
        """Reward points floor fractional points and multiply by point_monetary_value."""
        card = create_mock_card(
            card_id="c_points",
            card_name="Miles Card",
            rules=[{
                "category_id": "travel",
                "reward_type": "REWARD_POINTS",
                "reward_rate_percentage": "3.33",
                "point_monetary_value": "0.25"
            }]
        )
        # ₹1000 * 3.33% = 33.3 points -> floored to 33 points
        # 33 points * ₹0.25 = ₹8.25
        res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("1000.00"),
            category_id="travel"
        )
        assert res.expected_reward_monetary == Decimal("8.25")
        assert res.effective_rate_percentage == Decimal("0.83")

    def test_zero_amount_handling(self):
        """Zero amount returns ₹0 without division by zero errors."""
        card = create_mock_card(
            card_id="c_zero",
            card_name="Standard Card",
            rules=[{"category_id": "all", "reward_rate_percentage": "2.0"}]
        )
        res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("0.00"),
            category_id="shopping"
        )
        assert res.expected_reward_monetary == Decimal("0.00")
        assert res.effective_rate_percentage == Decimal("0.00")

    def test_exhausted_monthly_cap(self):
        """If user has already consumed the monthly cap, reward is ₹0."""
        card = create_mock_card(
            card_id="c_capped",
            card_name="Cap Card",
            rules=[{
                "category_id": "grocery",
                "reward_rate_percentage": "5.0",
                "monthly_cap_amount": "500.00"
            }]
        )
        res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("1000.00"),
            category_id="grocery",
            current_month_spent_rewards=Decimal("500.00")
        )
        assert res.expected_reward_monetary == Decimal("0.00")

    def test_missing_card_rules_fallback(self):
        """Card with empty rules list defaults conservatively to 1% base reward."""
        card = create_mock_card(
            card_id="c_empty",
            card_name="Blank Card",
            rules=[]
        )
        res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("2000.00"),
            category_id="shopping"
        )
        assert res.expected_reward_monetary == Decimal("20.00")
        assert res.effective_rate_percentage == Decimal("1.00")

    def test_compare_cards_verified_rules_and_breakeven(self):
        """Test comparing cards returns category details, best cards, and correct breakeven."""
        # Card 1: HDFC Millennia (₹1,000 fee, 5% shopping/dining, 1% others)
        c1 = create_mock_card(
            card_id="c_millennia",
            card_name="HDFC Millennia",
            annual_fee=Decimal("1000.00"),
            rules=[
                {"category_id": "shopping", "reward_rate_percentage": "5.0"},
                {"category_id": "dining", "reward_rate_percentage": "5.0"},
                {"category_id": "grocery", "reward_rate_percentage": "1.0"},
                {"category_id": "utility", "reward_rate_percentage": "1.0"},
                {"category_id": "travel", "reward_rate_percentage": "1.0"},
                {"category_id": "fuel", "reward_rate_percentage": "0.0", "is_excluded": True, "exclusion_reason": "Fuel surcharge waiver only"}
            ]
        )
        # Card 2: Amazon Pay ICICI (Lifetime Free, ₹0 fee, 5% shopping, 2% utility/dining, 1% other)
        c2 = create_mock_card(
            card_id="c_amazon_pay",
            card_name="Amazon Pay ICICI",
            annual_fee=Decimal("0.00"),
            rules=[
                {"category_id": "shopping", "reward_rate_percentage": "5.0"},
                {"category_id": "dining", "reward_rate_percentage": "2.0"},
                {"category_id": "grocery", "reward_rate_percentage": "2.0"},
                {"category_id": "utility", "reward_rate_percentage": "2.0"},
                {"category_id": "travel", "reward_rate_percentage": "2.0"},
                {"category_id": "fuel", "reward_rate_percentage": "0.0", "is_excluded": True, "exclusion_reason": "Fuel surcharge waiver only"}
            ]
        )

        res = RewardOptimizationEngine.compare_cards(
            cards=[c1, c2],
            simulation_spend=Decimal("50000.00")
        )

        assert len(res.category_matrix) == 6
        assert res.cards_metadata is not None
        assert len(res.cards_metadata) == 2

        # Amazon Pay must be LIFETIME_FREE
        ap_meta = next(m for m in res.cards_metadata if m.card_id == "c_amazon_pay")
        assert ap_meta.breakeven_status == "LIFETIME_FREE"
        assert ap_meta.annual_break_even_spend == Decimal("0.00")

        # Millennia must have calculated breakeven
        mil_meta = next(m for m in res.cards_metadata if m.card_id == "c_millennia")
        assert mil_meta.breakeven_status == "CALCULATED"
        assert mil_meta.annual_break_even_spend > Decimal("0.00")

        # Check category yield matrix has card_details and best card
        shopping_row = next(r for r in res.category_matrix if r.category_id == "shopping")
        assert shopping_row.card_details is not None
        assert shopping_row.card_details["c_millennia"].effective_rate_percentage == Decimal("5.00")
        assert shopping_row.card_details["c_millennia"].effective_reward_amount == Decimal("50.00")

        fuel_row = next(r for r in res.category_matrix if r.category_id == "fuel")
        assert fuel_row.card_details["c_millennia"].is_excluded is True

    def test_compare_cards_with_separated_reward_components_and_offers(self):
        """Verifies the 3 clear metrics: Base reward, Additional eligible savings, and Total effective benefit."""
        from datetime import datetime, timedelta
        from app.models.entities import CardOffer

        now = datetime.utcnow()
        # Card 1: HDFC Millennia (Base 1%, Dining 5%)
        c1 = create_mock_card(
            card_id="c_hdfc",
            card_name="HDFC Millennia",
            annual_fee=Decimal("1000.00"),
            rules=[
                {"category_id": "all", "reward_rate_percentage": "1.0"},
                {"category_id": "dining", "reward_rate_percentage": "5.0"},
                {"category_id": "shopping", "reward_rate_percentage": "5.0"},
            ]
        )
        c1.bank_name = "HDFC Bank"

        # Card 2: ICICI Coral (Base 1%, Dining 2%)
        c2 = create_mock_card(
            card_id="c_icici",
            card_name="ICICI Coral",
            annual_fee=Decimal("500.00"),
            rules=[
                {"category_id": "all", "reward_rate_percentage": "1.0"},
                {"category_id": "dining", "reward_rate_percentage": "2.0"},
                {"category_id": "shopping", "reward_rate_percentage": "1.0"},
            ]
        )
        c2.bank_name = "ICICI Bank"

        # Verified Offer 1: HDFC Dining offer: 10% off up to ₹100 on ₹600+ spend
        offer_hdfc = CardOffer(
            id="off_hdfc_dine",
            merchant_name="Swiggy",
            offer_title="HDFC Dining Fest 10% off",
            category_id="dining",
            discount_type="PERCENTAGE",
            discount_value=Decimal("10.00"),
            min_transaction_value=Decimal("600.00"),
            max_discount_amount=Decimal("100.00"),
            eligible_bank="HDFC Bank",
            eligible_network=None,
            eligible_card_names_json="[]",
            valid_from=now - timedelta(days=2),
            valid_to=now + timedelta(days=10),
            payment_channel="ONLINE",
            promo_code="HDFC10",
            verification_status="VERIFIED"
        )

        # Offer 2: High min spend offer (₹4,000 min) - should NOT apply to ₹1,000 spend!
        offer_icici_high_min = CardOffer(
            id="off_icici_high",
            merchant_name="Luxury Dine",
            offer_title="ICICI ₹500 off on ₹4000",
            category_id="dining",
            discount_type="FLAT_AMOUNT",
            discount_value=Decimal("500.00"),
            min_transaction_value=Decimal("4000.00"),
            max_discount_amount=Decimal("500.00"),
            eligible_bank="ICICI Bank",
            eligible_network=None,
            eligible_card_names_json="[]",
            valid_from=now - timedelta(days=2),
            valid_to=now + timedelta(days=10),
            payment_channel="ONLINE",
            verification_status="VERIFIED"
        )

        res = RewardOptimizationEngine.compare_cards(
            cards=[c1, c2],
            simulation_spend=Decimal("50000.00"),
            available_offers=[offer_hdfc, offer_icici_high_min]
        )

        dining_row = next(r for r in res.category_matrix if r.category_id == "dining")
        hdfc_detail = dining_row.card_details["c_hdfc"]
        icici_detail = dining_row.card_details["c_icici"]

        # Metric 1: Base Reward Value on ₹1,000 benchmark
        assert hdfc_detail.base_reward_value == Decimal("10.00")  # 1% of ₹1,000
        assert hdfc_detail.base_reward_percentage == Decimal("1.00")

        # Metric 2: Additional Eligible Savings
        # Accelerator bonus = 5% (₹50) - 1% (₹10) = ₹40.00
        assert hdfc_detail.accelerated_reward_value == Decimal("40.00")
        # Verified Offer: 10% of ₹1,000 = ₹100.00
        assert hdfc_detail.additional_offer_value == Decimal("100.00")
        assert hdfc_detail.has_promotional_offer is True
        assert hdfc_detail.promo_code == "HDFC10"
        # Total additional savings = ₹40 (accelerator) + ₹100 (offer) = ₹140.00
        assert hdfc_detail.additional_savings_value == Decimal("140.00")

        # Metric 3: Total Effective Benefit
        # Base (₹10) + Additional (₹140) = ₹150.00 (15.00% total effective return)
        assert hdfc_detail.total_effective_benefit == Decimal("150.00")
        assert hdfc_detail.total_effective_percentage == Decimal("15.00")

        # ICICI card: min spend ₹4,000 was NOT met on ₹1,000 spend benchmark
        assert icici_detail.additional_offer_value == Decimal("0.00")
        assert icici_detail.has_promotional_offer is False
        # Base = ₹10, Accelerator = ₹10 (2% - 1%), Total = ₹20.00
        assert icici_detail.base_reward_value == Decimal("10.00")
        assert icici_detail.accelerated_reward_value == Decimal("10.00")
        assert icici_detail.total_effective_benefit == Decimal("20.00")

        # HDFC must be crowned best card for dining based on total eligible net benefit
        assert dining_row.best_card_id == "c_hdfc"

    def test_compare_cards_demo_mode_varied_savings_and_labels(self):
        """
        Verify that demo_mode=True generates varied illustrative promotional savings
        in target ranges (₹100–₹400), rotates the winning card across categories,
        keeps base rewards realistic, and clearly attaches the synthetic disclaimer.
        Also verify demo_mode=False does not inject synthetic demo values.
        """
        card1 = create_mock_card(
            card_id="demo_c1",
            card_name="HDFC Millennia",
            annual_fee=Decimal("1000.00"),
            rules=[
                {"category_id": "all", "reward_rate_percentage": "1.0", "reward_type": "CASHBACK"},
                {"category_id": "dining", "reward_rate_percentage": "5.0", "reward_type": "CASHBACK"},
                {"category_id": "shopping", "reward_rate_percentage": "5.0", "reward_type": "CASHBACK"},
            ]
        )
        card1.bank_name = "HDFC Bank"

        card2 = create_mock_card(
            card_id="demo_c2",
            card_name="Axis Bank Ace",
            annual_fee=Decimal("500.00"),
            rules=[
                {"category_id": "all", "reward_rate_percentage": "2.0", "reward_type": "CASHBACK"},
                {"category_id": "utility", "reward_rate_percentage": "5.0", "reward_type": "CASHBACK"},
            ]
        )
        card2.bank_name = "Axis Bank"

        card3 = create_mock_card(
            card_id="demo_c3",
            card_name="Amazon Pay ICICI",
            annual_fee=Decimal("0.00"),
            rules=[
                {"category_id": "all", "reward_rate_percentage": "1.0", "reward_type": "CASHBACK"},
                {"category_id": "shopping", "reward_rate_percentage": "5.0", "reward_type": "CASHBACK"},
            ]
        )
        card3.bank_name = "ICICI Bank"

        cards = [card1, card2, card3]

        # 1. Test Demo Mode
        res_demo_1 = RewardOptimizationEngine.compare_cards(cards, Decimal("50000.00"), None, demo_mode=True)
        res_demo_2 = RewardOptimizationEngine.compare_cards(cards, Decimal("50000.00"), None, demo_mode=True)

        assert res_demo_1.is_demo_mode is True

        # Determinism check: identical results between runs without random fluctuation
        for row1, row2 in zip(res_demo_1.category_matrix, res_demo_2.category_matrix):
            assert row1.best_card_id == row2.best_card_id
            for cid in ["demo_c1", "demo_c2", "demo_c3"]:
                d1 = row1.card_details[cid]
                d2 = row2.card_details[cid]
                assert d1.total_effective_benefit == d2.total_effective_benefit
                assert d1.additional_offer_value == d2.additional_offer_value

        # Check winner rotation across categories
        winners = [row.best_card_id for row in res_demo_1.category_matrix]
        unique_winners = set(winners)
        assert len(unique_winners) > 1, "Winning card must vary across categories in demo mode"

        # Check target ranges (₹100–₹400) and component separation
        total_values = []
        for row in res_demo_1.category_matrix:
            for cid, detail in row.card_details.items():
                if detail.has_promotional_offer:
                    assert detail.is_demo_value is True
                    assert detail.demo_label == "Illustrative Demo Savings — Not a Verified Live Offer"
                    # Base reward is preserved and NOT artificially inflated
                    assert detail.base_reward_value in (Decimal("10.00"), Decimal("20.00"))
                    # High returns come from promotional savings
                    assert detail.additional_offer_value >= Decimal("100.00")
                    total_values.append(detail.total_effective_benefit)

        # Check that ranges ₹100–₹150, ₹150–₹200, ₹200–₹250, ₹250–₹300, ₹300–₹400 are represented
        assert any(Decimal("100.00") <= v <= Decimal("150.00") for v in total_values)
        assert any(Decimal("150.00") <= v <= Decimal("200.00") for v in total_values)
        assert any(Decimal("200.00") <= v <= Decimal("250.00") for v in total_values)
        assert any(Decimal("250.00") <= v <= Decimal("300.00") for v in total_values)
        assert any(Decimal("300.00") <= v <= Decimal("400.00") for v in total_values)

        # 2. Test Real User Portfolio Mode (demo_mode=False)
        res_real = RewardOptimizationEngine.compare_cards(cards, Decimal("50000.00"), None, demo_mode=False)
        assert res_real.is_demo_mode is False

        for row in res_real.category_matrix:
            for cid, detail in row.card_details.items():
                # No demo values injected in real mode
                assert detail.is_demo_value is False
                assert detail.demo_label is None
                assert detail.additional_offer_value == Decimal("0.00")
                # Pure base + card category accelerator displayed without promotional offers
                assert detail.total_effective_benefit == detail.base_reward_value + detail.accelerated_reward_value


