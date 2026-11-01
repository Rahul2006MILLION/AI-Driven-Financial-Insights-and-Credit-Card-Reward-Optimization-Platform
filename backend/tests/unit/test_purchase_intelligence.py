import pytest
from decimal import Decimal
from datetime import datetime, timedelta
import json

from app.models.entities import CreditCard, CardRewardRule, CardBenefit, CardOffer
from app.services.reward_optimization.merchant_normalizer import MerchantNormalizer, MerchantMatchResult
from app.services.reward_optimization.eligibility import OfferEligibilityEngine, RejectionReason, OfferEligibilityResult
from app.services.reward_optimization.engine import RewardOptimizationEngine

def make_test_card(
    card_id: str,
    card_name: str,
    bank_name: str = "HDFC Bank",
    network: str = "VISA",
    card_variant: str = "Millennia",
    annual_fee: Decimal = Decimal("1000.00"),
    rules: list = None,
    benefits: list = None,
    is_active: bool = True
) -> CreditCard:
    card = CreditCard(
        id=card_id,
        user_id="user_test_pur_intel",
        card_name=card_name,
        bank_name=bank_name,
        network=network,
        card_variant=card_variant,
        annual_fee=annual_fee,
        is_active=is_active
    )
    rule_objs = []
    for idx, r in enumerate(rules or []):
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

    benefit_objs = []
    for idx, b in enumerate(benefits or []):
        benefit_objs.append(CardBenefit(
            id=f"ben_{card_id}_{idx}",
            card_id=card_id,
            benefit_type=b.get("benefit_type", "PERMANENT"),
            title=b.get("title", "Benefit"),
            description=b.get("description", "Description"),
            applicable_category=b.get("applicable_category", "all"),
            cap_amount=Decimal(str(b["cap_amount"])) if b.get("cap_amount") else None
        ))
    card.benefits = benefit_objs
    return card

def make_test_offer(
    offer_id: str,
    merchant_name: str,
    offer_title: str,
    discount_type: str = "PERCENTAGE",
    discount_value: Decimal = Decimal("10.00"),
    min_transaction_value: Decimal = Decimal("500.00"),
    max_discount_amount: Decimal = Decimal("200.00"),
    eligible_bank: str = "HDFC Bank",
    eligible_network: str = None,
    eligible_card_names: list = None,
    payment_channel: str = "ONLINE",
    promo_code: str = None,
    verification_status: str = "VERIFIED",
    valid_from: datetime = None,
    valid_to: datetime = None
) -> CardOffer:
    now = datetime.utcnow()
    return CardOffer(
        id=offer_id,
        merchant_name=merchant_name,
        offer_title=offer_title,
        category_id="dining",
        discount_type=discount_type,
        discount_value=discount_value,
        min_transaction_value=min_transaction_value,
        max_discount_amount=max_discount_amount,
        eligible_bank=eligible_bank,
        eligible_network=eligible_network,
        eligible_card_names_json=json.dumps(eligible_card_names or []),
        payment_channel=payment_channel,
        promo_code=promo_code,
        verification_status=verification_status,
        valid_from=valid_from or (now - timedelta(days=5)),
        valid_to=valid_to or (now + timedelta(days=30))
    )

# ==============================================================================
# PHASE 2: MERCHANT NORMALIZATION TESTS
# ==============================================================================

class TestMerchantNormalizer:
    def test_canonical_merchant_aliases(self):
        """Verifies multi-channel variations map to canonical Indian merchants."""
        swiggy_variations = ["SWIGGY", "  swiggy  ", "Swiggy Instamart", "swiggy dineout", "Bundl Technologies"]
        for query in swiggy_variations:
            res = MerchantNormalizer.resolve_merchant(query)
            assert res.is_known_merchant is True
            assert res.canonical_name == "Swiggy"
            assert res.is_confident_match is True

        zomato_variations = ["ZOMATO", "zomato gold", "Zomato Dining", "zomato media"]
        for query in zomato_variations:
            res = MerchantNormalizer.resolve_merchant(query)
            assert res.canonical_name == "Zomato"

        amazon_variations = ["Amazon", "AMAZON.IN", "Amazon India", "Amazon Pay", "Amazon Fresh"]
        for query in amazon_variations:
            res = MerchantNormalizer.resolve_merchant(query)
            assert res.canonical_name == "Amazon"

        flipkart_variations = ["Flipkart", "FLIPKART INTERNET", "Flipkart Grocery"]
        for query in flipkart_variations:
            res = MerchantNormalizer.resolve_merchant(query)
            assert res.canonical_name == "Flipkart"

        makemytrip_variations = ["MakeMyTrip", "MMT", "makemytrip india", "makemytrip domestic"]
        for query in makemytrip_variations:
            res = MerchantNormalizer.resolve_merchant(query)
            assert res.canonical_name == "MakeMyTrip"

    def test_whitespace_and_capitalization_handling(self):
        """Ensures extreme whitespace and noisy casing are normalized cleanly."""
        res = MerchantNormalizer.resolve_merchant("   mYnTLa   dEsiGns   pVt   LtD   ")
        # Should clean noise and resolve or clean
        assert res.normalized_name == "myntla designs pvt ltd"
        # Myntra direct test
        res_myntra = MerchantNormalizer.resolve_merchant("   mYnTrA   dEsiGns   pVt   LtD   ")
        assert res_myntra.canonical_name == "Myntra"

    def test_ambiguous_generic_merchants_rejected(self):
        """Single ambiguous generic keywords (pay, store, online) are flagged as ambiguous."""
        ambiguous_queries = ["Pay", "store", "online", "direct", "food", "market"]
        for q in ambiguous_queries:
            res = MerchantNormalizer.resolve_merchant(q)
            assert res.is_ambiguous is True
            assert res.is_confident_match is False

    def test_word_boundary_isolation(self):
        """Prevents false positives on accidental substring matches."""
        # 'pay' must not match 'Amazon Pay'
        match, conf, _ = MerchantNormalizer.matches_pattern("pay", "Amazon Pay")
        assert match is False

        # 'tomato' must not match 'Zomato'
        match, conf, _ = MerchantNormalizer.matches_pattern("Tomato Kitchen", "Zomato")
        assert match is False

        # 'art' must not match 'Flipkart'
        match, conf, _ = MerchantNormalizer.matches_pattern("Art Gallery", "Flipkart")
        assert match is False

    def test_unknown_merchant_preservation(self):
        """Unknown merchants preserve original casing and text without crashing."""
        raw = " Sharma Ji Chai Wale Bangalore "
        res = MerchantNormalizer.resolve_merchant(raw)
        assert res.original_name == "Sharma Ji Chai Wale Bangalore"
        assert res.is_known_merchant is False
        assert res.is_confident_match is False

# ==============================================================================
# PHASE 3 & 5: ELIGIBILITY & ANTI-STACKING TESTS
# ==============================================================================

class TestEligibilityAndStacking:
    def test_unverified_offers_strictly_rejected(self):
        """Offers with status PENDING_REVIEW, REJECTED, SAMPLE, NEEDS_REVERIFICATION are rejected."""
        card = make_test_card("c1", "HDFC Millennia")
        now = datetime.utcnow()
        for bad_status in ["PENDING_REVIEW", "REJECTED", "NEEDS_REVERIFICATION", "SOURCE_UNAVAILABLE"]:
            offer = make_test_offer("off_bad", "Swiggy", "Unverified Promo", verification_status=bad_status)
            res = OfferEligibilityEngine.evaluate_offer_eligibility(
                offer=offer,
                card=card,
                amount=Decimal("1000.00"),
                category_id="dining",
                merchant_name="Swiggy"
            )
            assert res.is_eligible is False
            assert RejectionReason.OFFER_NOT_VERIFIED in res.rejection_reasons

    def test_expired_and_not_yet_valid_offers_rejected(self):
        """Offers outside active date windows are rejected with structured codes."""
        card = make_test_card("c1", "HDFC Millennia")
        now = datetime.utcnow()

        # Expired yesterday
        expired = make_test_offer("off_exp", "Swiggy", "Expired Deal", valid_to=now - timedelta(days=1))
        res_exp = OfferEligibilityEngine.evaluate_offer_eligibility(
            offer=expired,
            card=card,
            amount=Decimal("1000.00"),
            category_id="dining",
            merchant_name="Swiggy"
        )
        assert res_exp.is_eligible is False
        assert RejectionReason.OFFER_EXPIRED in res_exp.rejection_reasons

        # Valid in future
        future = make_test_offer("off_fut", "Swiggy", "Future Deal", valid_from=now + timedelta(days=2))
        res_fut = OfferEligibilityEngine.evaluate_offer_eligibility(
            offer=future,
            card=card,
            amount=Decimal("1000.00"),
            category_id="dining",
            merchant_name="Swiggy"
        )
        assert res_fut.is_eligible is False
        assert RejectionReason.OFFER_NOT_YET_VALID in res_fut.rejection_reasons

    def test_card_variant_mismatch_rejection(self):
        """Offer specifying Infinia only must reject Millennia."""
        card = make_test_card("c1", "HDFC Millennia", card_variant="Millennia")
        offer = make_test_offer(
            "off_inf", "Swiggy", "Infinia Exclusive",
            eligible_bank="HDFC Bank",
            eligible_card_names=["HDFC Infinia Metal"]
        )
        res = OfferEligibilityEngine.evaluate_offer_eligibility(
            offer=offer,
            card=card,
            amount=Decimal("1000.00"),
            category_id="dining",
            merchant_name="Swiggy"
        )
        assert res.is_eligible is False
        assert RejectionReason.CARD_VARIANT_MISMATCH in res.rejection_reasons

    def test_channel_mismatch_rejection(self):
        """Offline in-store POS offer must be rejected for online checkout."""
        card = make_test_card("c1", "Axis Ace")
        offer = make_test_offer(
            "off_pos", "Croma", "In-Store POS ₹1000 off",
            payment_channel="OFFLINE"
        )
        res = OfferEligibilityEngine.evaluate_offer_eligibility(
            offer=offer,
            card=card,
            amount=Decimal("15000.00"),
            category_id="shopping",
            merchant_name="Croma",
            payment_channel="ONLINE"
        )
        assert res.is_eligible is False
        assert RejectionReason.CHANNEL_NOT_SUPPORTED in res.rejection_reasons

    def test_conflicting_bank_discounts_anti_stacking(self):
        """Two bank instant discounts cannot stack; highest discount chosen, other rejected."""
        card = make_test_card("c1", "HDFC Millennia")
        off1 = make_test_offer("b1", "Swiggy", "HDFC 10% off up to ₹100", discount_value=Decimal("10.00"), max_discount_amount=Decimal("100.00"), promo_code="HDFC10")
        off2 = make_test_offer("b2", "Swiggy", "HDFC 15% off up to ₹150", discount_value=Decimal("15.00"), max_discount_amount=Decimal("150.00"), promo_code="HDFC15")

        r1 = OfferEligibilityEngine.evaluate_offer_eligibility(off1, card, Decimal("1000.00"), "dining", "Swiggy")
        r2 = OfferEligibilityEngine.evaluate_offer_eligibility(off2, card, Decimal("1000.00"), "dining", "Swiggy")

        applied, excluded = OfferEligibilityEngine.resolve_stacking([r1, r2])

        assert len(applied) == 1
        assert applied[0].offer.id == "b2"  # ₹150 discount wins
        assert applied[0].calculated_discount == Decimal("150.00")

        assert len(excluded) == 1
        assert excluded[0].offer.id == "b1"
        assert RejectionReason.OFFER_INCOMPATIBLE_STACKING in excluded[0].rejection_reasons

# ==============================================================================
# PHASE 4: FINANCIAL CALCULATION & POINT VALUATION TESTS
# ==============================================================================

class TestFinancialCalculations:
    def test_unvalued_points_never_equated_to_cash(self):
        """Points without configured monetary value must NOT be represented as cash."""
        card = make_test_card(
            "c_unvalued",
            "Points Card",
            rules=[{
                "category_id": "travel",
                "reward_type": "REWARD_POINTS",
                "reward_rate_percentage": "4.0",
                "point_monetary_value": "0.00"  # Unconfigured / unvalued
            }]
        )
        # ₹5000 * 4% = 200 points
        eval_res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("5000.00"),
            category_id="travel"
        )
        # Cash value must be ₹0.00, NOT ₹200.00!
        assert eval_res.expected_reward_monetary == Decimal("0.00")
        assert eval_res.post_reward_monetary == Decimal("0.00")
        assert eval_res.expected_reward_points == Decimal("200")
        assert eval_res.unvalued_points_count == 200
        assert any("no configured redemption" in n.lower() for n in eval_res.missing_information_notes)

    def test_fuel_surcharge_waiver_calculation(self):
        """Fuel transactions between ₹400 and ₹5,000 earn 1% surcharge waiver savings."""
        card = make_test_card(
            "c_fuel",
            "Fuel Card",
            rules=[{
                "category_id": "fuel",
                "is_excluded": True,
                "exclusion_reason": "Fuel purchases excluded from reward points"
            }],
            benefits=[{
                "benefit_type": "FUEL_SURCHARGE_WAIVER",
                "title": "1% Fuel Surcharge Waiver",
                "applicable_category": "fuel",
                "cap_amount": "150.00"
            }]
        )
        # ₹2,000 fuel spend @ 1% = ₹20.00 waiver savings
        res = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("2000.00"),
            category_id="fuel"
        )
        assert res.net_financial_benefit == Decimal("20.00")
        assert res.effective_rate_percentage == Decimal("1.00")
        assert any("Fuel Surcharge Waiver" in s.rule_name for s in res.breakdown_steps)

    def test_transaction_order_and_reward_basis(self):
        """Validates rewards computed on charged amount (₹4,800) vs gross amount (₹5,000)."""
        card = make_test_card(
            "c_millennia",
            "HDFC Millennia",
            rules=[{"category_id": "dining", "merchant_pattern": "Swiggy", "reward_rate_percentage": "5.0"}]
        )
        offer = make_test_offer("off_swiggy", "Swiggy", "₹200 instant off", discount_type="FLAT_AMOUNT", discount_value=Decimal("200.00"))

        # Default mode: NET_CHARGED_AMOUNT
        # Amount: ₹5,000 - ₹200 instant off = ₹4,800 charged
        # Post-reward: ₹4,800 * 5% = ₹240.00
        # Total benefit: ₹200 + ₹240 = ₹440.00
        res_net = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("5000.00"),
            category_id="dining",
            merchant_name="Swiggy",
            matched_offers=[(offer, Decimal("200.00"))],
            reward_basis_mode="NET_CHARGED_AMOUNT"
        )
        assert res_net.amount_charged == Decimal("4800.00")
        assert res_net.instant_discount_monetary == Decimal("200.00")
        assert res_net.post_reward_monetary == Decimal("240.00")
        assert res_net.net_financial_benefit == Decimal("440.00")

        # Gross mode: ORIGINAL_TRANSACTION_AMOUNT
        # Post-reward: ₹5,000 * 5% = ₹250.00
        # Total benefit: ₹200 + ₹250 = ₹450.00
        res_gross = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("5000.00"),
            category_id="dining",
            merchant_name="Swiggy",
            matched_offers=[(offer, Decimal("200.00"))],
            reward_basis_mode="ORIGINAL_TRANSACTION_AMOUNT"
        )
        assert res_gross.post_reward_monetary == Decimal("250.00")
        assert res_gross.net_financial_benefit == Decimal("450.00")

    def test_large_amount_and_zero_amount_handling(self):
        """Tests ₹10,00,000 spend with per-transaction cap and zero amount safely."""
        card = make_test_card(
            "c_cap",
            "Capped Card",
            rules=[{
                "category_id": "shopping",
                "reward_rate_percentage": "5.0",
                "max_reward_per_transaction": "1000.00"
            }]
        )
        # ₹10,00,000 * 5% = ₹50,000 -> Capped at ₹1,000.00
        res_large = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("1000000.00"),
            category_id="shopping"
        )
        assert res_large.net_financial_benefit == Decimal("1000.00")
        assert res_large.effective_rate_percentage == Decimal("0.10")

        # ₹0 spend
        res_zero = RewardOptimizationEngine.evaluate_card_for_transaction(
            card=card,
            amount=Decimal("0.00"),
            category_id="shopping"
        )
        assert res_zero.net_financial_benefit == Decimal("0.00")
        assert res_zero.effective_rate_percentage == Decimal("0.00")

# ==============================================================================
# PHASE 6 & 7: EXPLAINABILITY & WHAT-IF SIMULATOR TESTS
# ==============================================================================

class TestExplainabilityAndSimulator:
    def test_ranking_rationale_explains_competing_cards(self):
        """Competing cards contain clear text explaining why they ranked lower."""
        card1 = make_test_card("c1", "HDFC Millennia", rules=[{"category_id": "dining", "reward_rate_percentage": "5.0"}])
        card2 = make_test_card("c2", "Axis Ace", rules=[{"category_id": "dining", "reward_rate_percentage": "2.0"}])

        opt_res = RewardOptimizationEngine.optimize_transaction(
            cards=[card1, card2],
            amount=Decimal("2000.00"),
            category_id="dining",
            merchant_name="Swiggy"
        )
        assert opt_res.recommended_card.card_name == "HDFC Millennia"
        assert len(opt_res.alternatives) == 1
        alt = opt_res.alternatives[0]
        assert alt.card_name == "Axis Ace"
        assert "Ranked #2" in alt.ranking_rationale
        assert "₹60" in alt.ranking_rationale or "60.00" in alt.ranking_rationale

    def test_what_if_simulator_multiple_brackets(self):
        """Simulates ₹1k, ₹3k, ₹5k, ₹10k spend brackets and identifies yield inflection."""
        card1 = make_test_card("c1", "HDFC Millennia", rules=[{
            "category_id": "dining",
            "reward_rate_percentage": "5.0",
            "max_reward_per_transaction": "200.00"
        }])
        card2 = make_test_card("c2", "Uncapped Card", rules=[{
            "category_id": "dining",
            "reward_rate_percentage": "2.0"
        }])

        amounts = [Decimal("1000.00"), Decimal("3000.00"), Decimal("5000.00"), Decimal("15000.00")]
        sim_res = RewardOptimizationEngine.simulate_scenarios(
            cards=[card1, card2],
            category_id="dining",
            amounts=amounts,
            merchant_name="Swiggy"
        )

        assert len(sim_res.scenarios) == 4
        assert sim_res.scenarios[0].spend_amount == Decimal("1000.00")
        assert sim_res.scenarios[0].recommended_card_name == "HDFC Millennia"  # ₹50 (5%) vs ₹20 (2%)

        # At ₹15,000: Millennia capped at ₹200 (1.33%), while Uncapped Card earns ₹300 (2%)!
        assert sim_res.scenarios[3].spend_amount == Decimal("15000.00")
        assert sim_res.scenarios[3].recommended_card_name == "Uncapped Card"
        assert sim_res.sweet_spot_spend is not None

