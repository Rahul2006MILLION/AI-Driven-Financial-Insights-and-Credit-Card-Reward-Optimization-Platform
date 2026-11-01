from decimal import Decimal, ROUND_HALF_UP, ROUND_FLOOR
from typing import List, Optional, Tuple, Dict, Any, Union
from datetime import datetime
import json
import re

from app.schemas.optimization import (
    RecommendRequest,
    RecommendResponse,
    CardRecommendation,
    CalculationStep,
    IneligibleOfferSummary,
    EligibilityDecision,
    CompareRequest,
    CompareResponse,
    CompareCategoryYield,
    SimulateRequest,
    SimulateResponse,
    SimulateScenarioResult,
    SimulatedCardYield
)
from app.schemas.offer import ApplicableOfferSummary
from app.models.entities import CreditCard, CardRewardRule, CardOffer, CardBenefit
from app.services.reward_optimization.merchant_normalizer import MerchantNormalizer
from app.services.reward_optimization.eligibility import (
    OfferEligibilityEngine,
    OfferEligibilityResult,
    RejectionReason
)

def to_decimal(val) -> Decimal:
    if val is None:
        return Decimal("0.00")
    if isinstance(val, Decimal):
        return val
    return Decimal(str(val))

class RewardOptimizationEngine:
    """
    Deterministic Reward Optimization & Purchase Intelligence Engine.
    All calculations use pure Python arbitrary-precision Decimal arithmetic.
    Evaluates upfront promotional instant discounts, card reward rules, caps,
    surcharge waivers, and anti-stacking policies with full explainability.
    NEVER relies on probabilistic LLMs for numerical or ranking decisions.
    """

    @classmethod
    def evaluate_card_for_transaction(
        cls,
        card: CreditCard,
        amount: Decimal,
        category_id: str,
        merchant_name: Optional[str] = None,
        payment_channel: str = "ONLINE",
        current_month_spent_rewards: Decimal = Decimal("0.00"),
        matched_offers: Optional[List[Any]] = None,
        reward_basis_mode: str = "NET_CHARGED_AMOUNT"
    ) -> CardRecommendation:
        amount = to_decimal(amount)
        current_month_spent_rewards = to_decimal(current_month_spent_rewards)
        steps: List[CalculationStep] = []
        step_idx = 1
        missing_notes: List[str] = []
        source_refs: List[str] = []
        assumptions: List[str] = []
        freshness_notes: List[str] = []
        eligibility_decisions: List[EligibilityDecision] = []
        ineligible_offers: List[IneligibleOfferSummary] = []

        if card.terms_source_url:
            source_refs.append(card.terms_source_url)

        # 0. Check if card is active
        if not card.is_active:
            decision = EligibilityDecision(
                entity_type="CARD",
                entity_id=card.id,
                entity_name=card.card_name,
                is_eligible=False,
                decision_reasons=[RejectionReason.CARD_INACTIVE]
            )
            return CardRecommendation(
                card_id=card.id,
                card_name=card.card_name,
                bank_name=card.bank_name,
                network=card.network,
                card_variant=card.card_variant,
                reward_type="NONE",
                reward_rate_percentage=Decimal("0.00"),
                point_monetary_value=Decimal("1.00"),
                instant_discount_monetary=Decimal("0.00"),
                post_reward_monetary=Decimal("0.00"),
                expected_reward_monetary=Decimal("0.00"),
                net_financial_benefit=Decimal("0.00"),
                effective_rate_percentage=Decimal("0.00"),
                amount_charged=amount,
                expected_instant_discount=Decimal("0.00"),
                expected_cashback=Decimal("0.00"),
                expected_reward_points=Decimal("0.00"),
                unvalued_points_count=None,
                is_excluded=True,
                exclusion_reason="Card is marked inactive",
                applicable_offers=[],
                ineligible_offers=[],
                eligibility_decisions=[decision],
                ranking_rationale="Excluded: card is inactive in your portfolio.",
                calculation_assumptions=["Card deactivated; no rewards or discounts applied."],
                data_freshness_notes=["Portfolio status verified."],
                missing_information_notes=["Card is deactivated."],
                source_references=source_refs,
                breakdown_steps=[]
            )

        eligibility_decisions.append(EligibilityDecision(
            entity_type="CARD",
            entity_id=card.id,
            entity_name=card.card_name,
            is_eligible=True,
            decision_reasons=["Card active and eligible"]
        ))

        # 1. Merchant Normalization & Resolution
        norm_result = MerchantNormalizer.resolve_merchant(merchant_name)
        active_merchant_name = norm_result.canonical_name if norm_result.is_confident_match else merchant_name

        if merchant_name:
            if norm_result.is_confident_match:
                assumptions.append(f"Normalized merchant '{merchant_name}' to canonical '{norm_result.canonical_name}'.")
            elif norm_result.is_ambiguous:
                missing_notes.append(f"Merchant '{merchant_name}' is ambiguous; merchant-specific accelerators held for safety.")

        # 2. Evaluate Upfront Promotional Offers & Enforce Anti-Stacking
        applicable_offer_summaries: List[ApplicableOfferSummary] = []
        instant_discount = Decimal("0.00")

        if matched_offers:
            # Check format: could be List[Tuple[CardOffer, Decimal]] or List[OfferEligibilityResult]
            prepared_results: List[OfferEligibilityResult] = []
            for item in matched_offers:
                if isinstance(item, OfferEligibilityResult):
                    prepared_results.append(item)
                elif isinstance(item, tuple) and len(item) == 2:
                    offer_obj, disc_val = item
                    # Run full eligibility verification
                    res = OfferEligibilityEngine.evaluate_offer_eligibility(
                        offer=offer_obj,
                        card=card,
                        amount=amount,
                        category_id=category_id,
                        merchant_name=merchant_name,
                        payment_channel=payment_channel
                    )
                    prepared_results.append(res)

            applied_offers, excluded_offers = OfferEligibilityEngine.resolve_stacking(prepared_results)

            for exc in excluded_offers:
                ineligible_offers.append(IneligibleOfferSummary(
                    offer_id=exc.offer.id,
                    merchant_name=exc.offer.merchant_name,
                    offer_title=exc.offer.offer_title,
                    rejection_reasons=exc.rejection_reasons,
                    rejection_details=exc.rejection_details
                ))
                eligibility_decisions.append(EligibilityDecision(
                    entity_type="OFFER",
                    entity_id=exc.offer.id,
                    entity_name=exc.offer.offer_title,
                    is_eligible=False,
                    decision_reasons=exc.rejection_reasons
                ))

            # Apply compatible unconflicted offers
            for app in applied_offers:
                offer = app.offer
                disc_amount = app.calculated_discount
                instant_discount += disc_amount

                applicable_offer_summaries.append(ApplicableOfferSummary(
                    offer_id=offer.id,
                    merchant_name=offer.merchant_name,
                    offer_title=offer.offer_title,
                    promo_code=offer.promo_code,
                    discount_type=offer.discount_type,
                    discount_amount=disc_amount,
                    terms_and_conditions=offer.terms_and_conditions,
                    source_url=offer.source_url,
                    verification_status=offer.verification_status
                ))
                if offer.source_url:
                    source_refs.append(offer.source_url)

                eligibility_decisions.append(EligibilityDecision(
                    entity_type="OFFER",
                    entity_id=offer.id,
                    entity_name=offer.offer_title,
                    is_eligible=True,
                    decision_reasons=[f"Applied discount: ₹{disc_amount}"]
                ))

                code_text = f" (Promo Code: {offer.promo_code})" if offer.promo_code else " (Auto-applied)"
                steps.append(CalculationStep(
                    step_number=step_idx,
                    rule_name=f"Instant Promotional Discount ({offer.merchant_name})",
                    rate_percentage=to_decimal(offer.discount_value) if offer.discount_type == "PERCENTAGE" else Decimal("0.00"),
                    raw_reward=disc_amount,
                    cap_applied=offer.max_discount_amount,
                    final_monetary_value=disc_amount,
                    reason=f"Applied upfront offer '{offer.offer_title}'{code_text}. Discount: ₹{disc_amount}."
                ))
                step_idx += 1

        # The net charged amount on the credit card after instant discount
        charged_amount = max(Decimal("0.00"), amount - instant_discount)

        # 3. Match Permanent Reward Rules on the Card
        rules: List[CardRewardRule] = list(card.reward_rules) if card.reward_rules else []
        matched_rule: Optional[CardRewardRule] = None

        # Step A: Merchant-specific rule match (via MerchantNormalizer)
        if merchant_name:
            for r in rules:
                if r.merchant_pattern:
                    is_match, conf, reason = MerchantNormalizer.matches_pattern(merchant_name, r.merchant_pattern)
                    if is_match:
                        matched_rule = r
                        steps.append(CalculationStep(
                            step_number=step_idx,
                            rule_name=f"Merchant Specific Rule ({r.merchant_pattern})",
                            rate_percentage=to_decimal(r.reward_rate_percentage),
                            raw_reward=Decimal("0.00"),
                            final_monetary_value=Decimal("0.00"),
                            reason=f"Matched merchant '{merchant_name}' against card rule '{r.merchant_pattern}' ({reason})."
                        ))
                        step_idx += 1
                        break

        # Step B: Category match
        if not matched_rule:
            target_cat = category_id.strip().lower()
            for r in rules:
                if r.category_id and r.category_id.strip().lower() == target_cat:
                    if r.merchant_pattern:
                        is_match, conf, _ = MerchantNormalizer.matches_pattern(merchant_name, r.merchant_pattern)
                        if is_match:
                            matched_rule = r
                            steps.append(CalculationStep(
                                step_number=step_idx,
                                rule_name=f"Category & Merchant Rule ({r.category_id})",
                                rate_percentage=to_decimal(r.reward_rate_percentage),
                                raw_reward=Decimal("0.00"),
                                final_monetary_value=Decimal("0.00"),
                                reason=f"Matched spending category '{category_id}' and merchant '{merchant_name}'."
                            ))
                            step_idx += 1
                            break
                    else:
                        matched_rule = r
                        steps.append(CalculationStep(
                            step_number=step_idx,
                            rule_name=f"Category Rule ({r.category_id})",
                            rate_percentage=to_decimal(r.reward_rate_percentage),
                            raw_reward=Decimal("0.00"),
                            final_monetary_value=Decimal("0.00"),
                            reason=f"Matched spending category '{category_id}'."
                        ))
                        step_idx += 1
                        break

        # Step C: Fallback to standard base rule
        if not matched_rule:
            for r in rules:
                if r.category_id in ("all", "default", "*", None):
                    matched_rule = r
                    steps.append(CalculationStep(
                        step_number=step_idx,
                        rule_name="Standard Base Rule",
                        rate_percentage=to_decimal(r.reward_rate_percentage),
                        raw_reward=Decimal("0.00"),
                        final_monetary_value=Decimal("0.00"),
                        reason="No category accelerator rule; evaluated against card base reward rate."
                    ))
                    step_idx += 1
                    break

        # Step D: Conservative default if no rules configured
        if not matched_rule:
            reward_type = "CASHBACK"
            rate_percentage = Decimal("1.00")
            point_value = Decimal("1.00")
            min_spend = Decimal("0.00")
            max_per_txn = None
            monthly_cap = None
            is_excluded = False
            exclusion_reason = None
            missing_notes.append("No specific reward rules registered; applied conservative 1.0% base rate.")
        else:
            reward_type = matched_rule.reward_type or "CASHBACK"
            rate_percentage = to_decimal(matched_rule.reward_rate_percentage)
            point_value = to_decimal(matched_rule.point_monetary_value if matched_rule.point_monetary_value is not None else Decimal("1.00"))
            min_spend = to_decimal(matched_rule.min_transaction_amount or Decimal("0.00"))
            max_per_txn = to_decimal(matched_rule.max_reward_per_transaction) if matched_rule.max_reward_per_transaction is not None else None
            monthly_cap = to_decimal(matched_rule.monthly_cap_amount) if matched_rule.monthly_cap_amount is not None else None
            is_excluded = matched_rule.is_excluded
            exclusion_reason = matched_rule.exclusion_reason

        # 4. Check Fuel Surcharge Waiver / Category Exclusion
        is_fuel = (category_id.strip().lower() == "fuel")
        fuel_surcharge_waiver_benefit = Decimal("0.00")

        if is_fuel:
            # Check if card benefits specify fuel surcharge waiver
            waiver_benefit: Optional[CardBenefit] = None
            if card.benefits:
                for b in card.benefits:
                    b_title = b.title.lower() if b.title else ""
                    b_cat = b.applicable_category.lower() if b.applicable_category else ""
                    if "surcharge" in b_title or b_cat == "fuel" or "fuel" in b_title:
                        waiver_benefit = b
                        break

            # Typical Indian fuel surcharge waiver: 1% on transactions between ₹400 and ₹5,000
            if waiver_benefit and Decimal("400.00") <= amount <= Decimal("5000.00"):
                waiver_cap = to_decimal(waiver_benefit.cap_amount) if waiver_benefit.cap_amount else Decimal("150.00")
                raw_waiver = (amount * Decimal("0.01")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                fuel_surcharge_waiver_benefit = min(raw_waiver, waiver_cap)

                steps.append(CalculationStep(
                    step_number=step_idx,
                    rule_name="Fuel Surcharge Waiver (1%)",
                    rate_percentage=Decimal("1.00"),
                    raw_reward=raw_waiver,
                    cap_applied=waiver_cap,
                    final_monetary_value=fuel_surcharge_waiver_benefit,
                    reason=f"1% fuel surcharge waiver applied (₹{fuel_surcharge_waiver_benefit}). Fuel purchases are excluded from standard rewards."
                ))
                step_idx += 1
                assumptions.append("Fuel surcharge waiver calculated at 1% for eligible fuel transaction.")

        # 5. Check General Exclusion
        if is_excluded:
            if not is_fuel or fuel_surcharge_waiver_benefit == Decimal("0.00"):
                steps.append(CalculationStep(
                    step_number=step_idx,
                    rule_name="Exclusion Enforced",
                    rate_percentage=Decimal("0.00"),
                    raw_reward=Decimal("0.00"),
                    final_monetary_value=Decimal("0.00"),
                    reason=exclusion_reason or "Category or merchant is explicitly excluded from earning rewards."
                ))
            net_benefit = instant_discount + fuel_surcharge_waiver_benefit
            effective_rate = ((net_benefit / amount) * Decimal("100.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) if amount > Decimal("0.00") else Decimal("0.00")

            return CardRecommendation(
                card_id=card.id,
                card_name=card.card_name,
                bank_name=card.bank_name,
                network=card.network,
                card_variant=card.card_variant,
                reward_type=reward_type,
                reward_rate_percentage=Decimal("0.00"),
                point_monetary_value=point_value,
                instant_discount_monetary=instant_discount,
                post_reward_monetary=fuel_surcharge_waiver_benefit,
                expected_reward_monetary=net_benefit,
                net_financial_benefit=net_benefit,
                effective_rate_percentage=effective_rate,
                amount_charged=charged_amount,
                expected_instant_discount=instant_discount,
                expected_cashback=Decimal("0.00"),
                expected_reward_points=Decimal("0.00"),
                unvalued_points_count=None,
                is_excluded=True,
                exclusion_reason=exclusion_reason or ("Fuel excluded from rewards (waiver applied)" if is_fuel else "Exclusion applied"),
                applicable_offers=applicable_offer_summaries,
                ineligible_offers=ineligible_offers,
                eligibility_decisions=eligibility_decisions,
                ranking_rationale=f"Excluded from standard rewards: {exclusion_reason or 'Category excluded'}.",
                calculation_assumptions=assumptions,
                data_freshness_notes=freshness_notes,
                missing_information_notes=missing_notes,
                source_references=source_refs,
                breakdown_steps=steps
            )

        # 6. Check Minimum Spend Requirement on Card Rule
        # Determine reward base explicitly
        if reward_basis_mode == "ORIGINAL_TRANSACTION_AMOUNT":
            calc_spend_basis = amount
            assumptions.append("Post-rewards calculated on original gross amount before instant discount.")
        else:
            calc_spend_basis = charged_amount if charged_amount > Decimal("0.00") else amount
            assumptions.append("Post-rewards calculated on net charged amount after instant discount.")

        if calc_spend_basis < min_spend:
            steps.append(CalculationStep(
                step_number=step_idx,
                rule_name="Minimum Spend Not Met",
                rate_percentage=Decimal("0.00"),
                raw_reward=Decimal("0.00"),
                final_monetary_value=Decimal("0.00"),
                reason=f"Eligible spend ₹{calc_spend_basis} is less than required minimum ₹{min_spend} for rewards."
            ))
            net_benefit = instant_discount
            effective_rate = ((net_benefit / amount) * Decimal("100.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) if amount > Decimal("0.00") else Decimal("0.00")

            return CardRecommendation(
                card_id=card.id,
                card_name=card.card_name,
                bank_name=card.bank_name,
                network=card.network,
                card_variant=card.card_variant,
                reward_type=reward_type,
                reward_rate_percentage=rate_percentage,
                point_monetary_value=point_value,
                instant_discount_monetary=instant_discount,
                post_reward_monetary=Decimal("0.00"),
                expected_reward_monetary=net_benefit,
                net_financial_benefit=net_benefit,
                effective_rate_percentage=effective_rate,
                amount_charged=charged_amount,
                expected_instant_discount=instant_discount,
                expected_cashback=Decimal("0.00"),
                expected_reward_points=Decimal("0.00"),
                unvalued_points_count=None,
                is_excluded=False,
                exclusion_reason=f"Minimum spend of ₹{min_spend} not met for rewards",
                applicable_offers=applicable_offer_summaries,
                ineligible_offers=ineligible_offers,
                eligibility_decisions=eligibility_decisions,
                ranking_rationale=f"Instant discount applied, but card spend fell short of minimum ₹{min_spend} requirement for rewards.",
                calculation_assumptions=assumptions,
                data_freshness_notes=freshness_notes,
                missing_information_notes=missing_notes,
                source_references=source_refs,
                breakdown_steps=steps
            )

        # 7. Calculate Raw Post-Transaction Rewards & Point Valuation
        rate_multiplier = (rate_percentage / Decimal("100.00"))
        expected_cashback = Decimal("0.00")
        expected_points = Decimal("0.00")
        unvalued_points: Optional[int] = None

        if reward_type == "CASHBACK":
            raw_monetary = (calc_spend_basis * rate_multiplier).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            expected_cashback = raw_monetary
            steps.append(CalculationStep(
                step_number=step_idx,
                rule_name="Cashback Calculation",
                rate_percentage=rate_percentage,
                raw_reward=raw_monetary,
                final_monetary_value=raw_monetary,
                reason=f"₹{calc_spend_basis} × {rate_percentage}% = ₹{raw_monetary}"
            ))
            step_idx += 1
        else:
            # Reward Points or Miles: integer point accumulation floored
            points = (calc_spend_basis * rate_multiplier).quantize(Decimal("1"), rounding=ROUND_FLOOR)
            expected_points = points

            # Strictly evaluate point monetary value
            if point_value > Decimal("0.00"):
                raw_monetary = (points * point_value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                steps.append(CalculationStep(
                    step_number=step_idx,
                    rule_name=f"{reward_type} Calculation",
                    rate_percentage=rate_percentage,
                    raw_reward=raw_monetary,
                    final_monetary_value=raw_monetary,
                    reason=f"{points} points earned at ₹{point_value} per point = ₹{raw_monetary}"
                ))
            else:
                # Unvalued points! Never represent as cash without configured redemption value.
                raw_monetary = Decimal("0.00")
                unvalued_points = int(points)
                missing_notes.append("Reward points have no configured redemption rate; displayed as unvalued points.")
                steps.append(CalculationStep(
                    step_number=step_idx,
                    rule_name=f"{reward_type} Calculation (Unvalued)",
                    rate_percentage=rate_percentage,
                    raw_reward=Decimal("0.00"),
                    final_monetary_value=Decimal("0.00"),
                    reason=f"{points} points earned (no redemption value configured; zero cash representation)."
                ))
            step_idx += 1

        capped_monetary = raw_monetary

        # Apply per-transaction cap
        if max_per_txn is not None and capped_monetary > max_per_txn:
            capped_monetary = max_per_txn
            steps.append(CalculationStep(
                step_number=step_idx,
                rule_name="Per-Transaction Cap Applied",
                rate_percentage=rate_percentage,
                raw_reward=raw_monetary,
                cap_applied=max_per_txn,
                final_monetary_value=capped_monetary,
                reason=f"Reward capped at maximum allowable ₹{max_per_txn} per transaction."
            ))
            step_idx += 1

        # Apply monthly cap
        if monthly_cap is not None:
            available_monthly = max(Decimal("0.00"), monthly_cap - current_month_spent_rewards)
            if capped_monetary > available_monthly:
                final_monetary = available_monthly
                steps.append(CalculationStep(
                    step_number=step_idx,
                    rule_name="Monthly Cap Constraint",
                    rate_percentage=rate_percentage,
                    raw_reward=raw_monetary,
                    cap_applied=available_monthly,
                    final_monetary_value=final_monetary,
                    reason=f"Monthly cap of ₹{monthly_cap} limits current reward to remaining ₹{available_monthly}."
                ))
                step_idx += 1
            else:
                final_monetary = capped_monetary
        else:
            final_monetary = capped_monetary

        post_reward_monetary = final_monetary.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        net_benefit = (instant_discount + post_reward_monetary).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if amount > Decimal("0.00"):
            effective_rate = ((net_benefit / amount) * Decimal("100.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            effective_rate = Decimal("0.00")

        return CardRecommendation(
            card_id=card.id,
            card_name=card.card_name,
            bank_name=card.bank_name,
            network=card.network,
            card_variant=card.card_variant,
            reward_type=reward_type,
            reward_rate_percentage=rate_percentage,
            point_monetary_value=point_value,
            instant_discount_monetary=instant_discount,
            post_reward_monetary=post_reward_monetary,
            expected_reward_monetary=net_benefit,
            net_financial_benefit=net_benefit,
            effective_rate_percentage=effective_rate,
            amount_charged=charged_amount,
            expected_instant_discount=instant_discount,
            expected_cashback=expected_cashback if reward_type == "CASHBACK" else Decimal("0.00"),
            expected_reward_points=expected_points if reward_type != "CASHBACK" else Decimal("0.00"),
            unvalued_points_count=unvalued_points,
            is_excluded=False,
            exclusion_reason=None,
            applicable_offers=applicable_offer_summaries,
            ineligible_offers=ineligible_offers,
            eligibility_decisions=eligibility_decisions,
            ranking_rationale=f"Earns ₹{instant_discount} instant discount + ₹{post_reward_monetary} post-transaction rewards.",
            calculation_assumptions=assumptions,
            data_freshness_notes=freshness_notes,
            missing_information_notes=missing_notes,
            source_references=source_refs,
            breakdown_steps=steps
        )

    @classmethod
    def optimize_transaction(
        cls,
        cards: List[CreditCard],
        amount: Decimal,
        category_id: str,
        merchant_name: Optional[str] = None,
        payment_channel: str = "ONLINE",
        matched_card_offers_map: Optional[Dict[str, List[Any]]] = None,
        card_monthly_spend_map: Optional[Dict[str, Decimal]] = None,
        reward_basis_mode: str = "NET_CHARGED_AMOUNT",
        language: str = "en"
    ) -> RecommendResponse:
        amount = to_decimal(amount)
        norm_result = MerchantNormalizer.resolve_merchant(merchant_name)

        if not cards:
            return RecommendResponse(
                transaction_amount=amount,
                amount_charged=amount,
                category_id=category_id,
                merchant_name=merchant_name,
                normalized_merchant=norm_result.normalized_name,
                canonical_merchant=norm_result.canonical_name,
                merchant_confidence=norm_result.confidence,
                payment_channel=payment_channel,
                recommended_card=None,
                alternatives=[],
                all_evaluated_cards_count=0,
                explanation="No active credit cards registered in your portfolio. Please add a card to receive personalized recommendations.",
                language=language,
                queried_at=datetime.utcnow().isoformat()
            )

        evaluations: List[CardRecommendation] = []
        for card in cards:
            card_offers = matched_card_offers_map.get(card.id, []) if matched_card_offers_map else []
            month_rewards = card_monthly_spend_map.get(card.id, Decimal("0.00")) if card_monthly_spend_map else Decimal("0.00")

            eval_result = cls.evaluate_card_for_transaction(
                card=card,
                amount=amount,
                category_id=category_id,
                merchant_name=merchant_name,
                payment_channel=payment_channel,
                current_month_spent_rewards=month_rewards,
                matched_offers=card_offers,
                reward_basis_mode=reward_basis_mode
            )
            evaluations.append(eval_result)

        # Sort: Highest net financial benefit, then highest effective rate percentage, then lowest annual fee
        card_fee_map = {c.id: to_decimal(c.annual_fee) for c in cards}

        evaluations.sort(
            key=lambda x: (
                x.net_financial_benefit,
                x.effective_rate_percentage,
                -card_fee_map.get(x.card_id, Decimal("0.00"))
            ),
            reverse=True
        )

        recommended = evaluations[0]
        alternatives = evaluations[1:]

        # Annotate ranking rationale on competing cards
        for rank_idx, alt in enumerate(alternatives, start=2):
            diff = recommended.net_financial_benefit - alt.net_financial_benefit
            if diff > Decimal("0.00"):
                alt.ranking_rationale = (
                    f"Ranked #{rank_idx}: Yields ₹{diff} less than {recommended.card_name} "
                    f"({alt.effective_rate_percentage}% vs {recommended.effective_rate_percentage}%)."
                )
            elif alt.is_excluded:
                alt.ranking_rationale = f"Ranked #{rank_idx}: Excluded ({alt.exclusion_reason})."
            else:
                alt.ranking_rationale = f"Ranked #{rank_idx}: Tied in reward yield; ranked lower by annual fee."

        # Build explainable explanation text
        explanation = cls.generate_explanation(
            recommended=recommended,
            alternatives=alternatives,
            amount=amount,
            category_id=category_id,
            merchant_name=merchant_name,
            language=language
        )

        return RecommendResponse(
            transaction_amount=amount,
            amount_charged=recommended.amount_charged,
            category_id=category_id,
            merchant_name=merchant_name,
            normalized_merchant=norm_result.normalized_name,
            canonical_merchant=norm_result.canonical_name,
            merchant_confidence=norm_result.confidence,
            payment_channel=payment_channel,
            recommended_card=recommended,
            alternatives=alternatives,
            all_evaluated_cards_count=len(cards),
            explanation=explanation,
            language=language,
            queried_at=datetime.utcnow().isoformat()
        )

    @classmethod
    def generate_explanation(
        cls,
        recommended: CardRecommendation,
        alternatives: List[CardRecommendation],
        amount: Decimal,
        category_id: str,
        merchant_name: Optional[str] = None,
        language: str = "en"
    ) -> str:
        target_name = merchant_name if merchant_name else category_id.title()

        if recommended.net_financial_benefit == Decimal("0.00"):
            if recommended.is_excluded:
                if language == "hi":
                    return f"{recommended.card_name} पर {target_name} लेन-देन रिवॉर्ड्स से बाहर है ({recommended.exclusion_reason})।"
                elif language == "kn":
                    return f"{recommended.card_name} ನಲ್ಲಿ {target_name} ವಹಿವಾಟು ರಿವಾರ್ಡ್‌ಗಳಿಂದ ಹೊರಗಿಡಲಾಗಿದೆ ({recommended.exclusion_reason})."
                return f"None of your cards earn rewards on {target_name}. Exclusions apply: {recommended.exclusion_reason or 'Category excluded'}."

        delta_text = ""
        if alternatives and alternatives[0].net_financial_benefit > Decimal("0.00"):
            delta = recommended.net_financial_benefit - alternatives[0].net_financial_benefit
            if delta > Decimal("0.00"):
                delta_text = f" (₹{delta} more than {alternatives[0].card_name})"

        offer_text_en = ""
        offer_text_hi = ""
        offer_text_kn = ""
        if recommended.instant_discount_monetary > Decimal("0.00"):
            best_off = recommended.applicable_offers[0] if recommended.applicable_offers else None
            code_str = f" via coupon '{best_off.promo_code}'" if best_off and best_off.promo_code else ""
            offer_text_en = f"Includes ₹{recommended.instant_discount_monetary} instant discount{code_str} + ₹{recommended.post_reward_monetary} card rewards. "
            offer_text_hi = f"कूपन से ₹{recommended.instant_discount_monetary} की तत्काल छूट + ₹{recommended.post_reward_monetary} का कैशबैक। "
            offer_text_kn = f"ಕೂಪನ್ ಮೂಲಕ ₹{recommended.instant_discount_monetary} ತಕ್ಷಣದ ರಿಯಾಯಿತಿ + ₹{recommended.post_reward_monetary} ಕಾರ್ಡ್ ರಿವಾರ್ಡ್. "

        if language == "hi":
            return (
                f"सर्वश्रेष्ठ विकल्प: {recommended.card_name} ({recommended.bank_name})। "
                f"{offer_text_hi}इस लेन-देन (₹{amount}) पर आपको {recommended.effective_rate_percentage}% के हिसाब से ₹{recommended.net_financial_benefit} का कुल शुद्ध लाभ मिलेगा{delta_text}।"
            )
        elif language == "kn":
            return (
                f"ಅತ್ಯುತ್ತಮ ಕಾರ್ಡ್: {recommended.card_name} ({recommended.bank_name}). "
                f"{offer_text_kn}ಈ ವಹಿವಾಟಿಗೆ (₹{amount}) {recommended.effective_rate_percentage}% ದರದಲ್ಲಿ ₹{recommended.net_financial_benefit} ಒಟ್ಟು ನಿವ್ವಳ ಲಾಭ ಸಿಗುತ್ತದೆ{delta_text}."
            )
        else:
            return (
                f"Recommended: {recommended.card_name} ({recommended.bank_name}). "
                f"{offer_text_en}Yields ₹{recommended.net_financial_benefit} net financial benefit ({recommended.effective_rate_percentage}% effective rate) on your ₹{amount} spend on {target_name}{delta_text}."
            )

    @classmethod
    def compare_cards(
        cls,
        cards: List[CreditCard],
        simulation_spend: Decimal = Decimal("50000.00")
    ) -> CompareResponse:
        simulation_spend = to_decimal(simulation_spend)
        categories = [
            ("dining", "Dining & Food Delivery"),
            ("grocery", "Grocery & Supermarkets"),
            ("shopping", "Online Shopping"),
            ("travel", "Flights & Hotels"),
            ("utility", "Utility & Bill Payments"),
            ("fuel", "Fuel & Mobility")
        ]

        card_recommendations: List[CardRecommendation] = []
        for card in cards:
            eval_res = cls.evaluate_card_for_transaction(
                card=card,
                amount=simulation_spend,
                category_id="shopping"
            )
            card_recommendations.append(eval_res)

        category_matrix: List[CompareCategoryYield] = []
        for cat_id, cat_name in categories:
            yields: Dict[str, Decimal] = {}
            for card in cards:
                res = cls.evaluate_card_for_transaction(
                    card=card,
                    amount=Decimal("1000.00"),
                    category_id=cat_id
                )
                yields[card.id] = res.effective_rate_percentage
            category_matrix.append(CompareCategoryYield(
                category_id=cat_id,
                display_name=cat_name,
                card_yields=yields
            ))

        # Annual break even spend = annual_fee / average_reward_rate
        breakevens: Dict[str, Decimal] = {}
        for card in cards:
            fee = to_decimal(card.annual_fee)
            if fee == Decimal("0.00"):
                breakevens[card.id] = Decimal("0.00")
            else:
                rate = Decimal("0.02")
                for r in card.reward_rules:
                    if r.category_id in ("all", "default", None):
                        rate = to_decimal(r.reward_rate_percentage) / Decimal("100.00")
                        break
                if rate > Decimal("0.00"):
                    breakevens[card.id] = (fee / rate).quantize(Decimal("1.00"), rounding=ROUND_HALF_UP)
                else:
                    breakevens[card.id] = Decimal("999999.00")

        summary = f"Compared {len(cards)} cards across 6 core spend categories. Detailed yield matrix provides instant visibility into category supremacy."

        return CompareResponse(
            cards=card_recommendations,
            category_matrix=category_matrix,
            annual_break_even_spends=breakevens,
            summary_verdict=summary
        )

    # ==========================================================================
    # WHAT-IF PURCHASE SIMULATOR
    # ==========================================================================

    @classmethod
    def simulate_scenarios(
        cls,
        cards: List[CreditCard],
        category_id: str,
        amounts: Optional[List[Decimal]] = None,
        merchant_name: Optional[str] = None,
        payment_channel: str = "ONLINE",
        matched_card_offers_map_generator: Optional[Any] = None,
        card_monthly_spend_map: Optional[Dict[str, Decimal]] = None,
        language: str = "en"
    ) -> SimulateResponse:
        """
        Runs the exact same purchase intelligence engine across multiple purchase amounts.
        Identifies return inflection points, cap hits, and optimal spend brackets.
        """
        if not amounts:
            amounts = [Decimal("500.00"), Decimal("1000.00"), Decimal("2500.00"), Decimal("5000.00"), Decimal("10000.00")]

        # Sort amounts ascending
        test_amounts = sorted([to_decimal(a) for a in amounts if to_decimal(a) > Decimal("0.00")])
        norm_result = MerchantNormalizer.resolve_merchant(merchant_name)

        scenario_results: List[SimulateScenarioResult] = []
        best_overall_rate = Decimal("0.00")
        sweet_spot_spend: Optional[Decimal] = None

        for amt in test_amounts:
            # Generate offers map if generator provided, else empty
            offers_map = matched_card_offers_map_generator(amt) if callable(matched_card_offers_map_generator) else None

            opt_res = cls.optimize_transaction(
                cards=cards,
                amount=amt,
                category_id=category_id,
                merchant_name=merchant_name,
                payment_channel=payment_channel,
                matched_card_offers_map=offers_map,
                card_monthly_spend_map=card_monthly_spend_map,
                language=language
            )

            rec = opt_res.recommended_card
            if not rec:
                continue

            card_yields: List[SimulatedCardYield] = []
            all_ranked = [rec] + opt_res.alternatives
            for r_idx, c_eval in enumerate(all_ranked, start=1):
                card_yields.append(SimulatedCardYield(
                    card_id=c_eval.card_id,
                    card_name=c_eval.card_name,
                    bank_name=c_eval.bank_name,
                    network=c_eval.network,
                    amount_charged=c_eval.amount_charged,
                    instant_discount=c_eval.instant_discount_monetary,
                    post_reward=c_eval.post_reward_monetary,
                    net_financial_benefit=c_eval.net_financial_benefit,
                    effective_rate_percentage=c_eval.effective_rate_percentage,
                    is_recommended=(c_eval.card_id == rec.card_id),
                    cap_exhausted=any("Cap" in s.rule_name for s in c_eval.breakdown_steps),
                    rank=r_idx
                ))

            applied_titles = [o.offer_title for o in rec.applicable_offers]
            insight = (
                f"₹{amt} spend yields ₹{rec.net_financial_benefit} on {rec.card_name} ({rec.effective_rate_percentage}%)."
            )
            if rec.instant_discount_monetary > Decimal("0.00"):
                insight += f" (includes ₹{rec.instant_discount_monetary} upfront instant discount)."

            scenario_results.append(SimulateScenarioResult(
                spend_amount=amt,
                recommended_card_id=rec.card_id,
                recommended_card_name=rec.card_name,
                net_benefit=rec.net_financial_benefit,
                effective_rate=rec.effective_rate_percentage,
                amount_charged=rec.amount_charged,
                applied_offer_titles=applied_titles,
                card_yields=card_yields,
                insight=insight
            ))

            if rec.effective_rate_percentage > best_overall_rate:
                best_overall_rate = rec.effective_rate_percentage
                sweet_spot_spend = amt

        target_label = norm_result.canonical_name if norm_result.is_confident_match else (merchant_name or category_id.title())
        summary = (
            f"Simulated {len(scenario_results)} purchase scenarios for {target_label}. "
            f"Highest return rate of {best_overall_rate}% achieved at ₹{sweet_spot_spend}."
        )

        return SimulateResponse(
            category_id=category_id,
            merchant_name=merchant_name,
            normalized_merchant=norm_result.normalized_name,
            canonical_merchant=norm_result.canonical_name,
            scenarios=scenario_results,
            sweet_spot_spend=sweet_spot_spend,
            summary=summary,
            language=language,
            queried_at=datetime.utcnow().isoformat()
        )
