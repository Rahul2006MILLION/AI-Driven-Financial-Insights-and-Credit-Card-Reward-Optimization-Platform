from decimal import Decimal, ROUND_HALF_UP, ROUND_FLOOR
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
import re

from app.schemas.optimization import (
    RecommendRequest,
    RecommendResponse,
    CardRecommendation,
    CalculationStep,
    CompareRequest,
    CompareResponse,
    CompareCategoryYield
)
from app.schemas.offer import ApplicableOfferSummary
from app.models.entities import CreditCard, CardRewardRule

def to_decimal(val) -> Decimal:
    if val is None:
        return Decimal("0.00")
    if isinstance(val, Decimal):
        return val
    return Decimal(str(val))

class RewardOptimizationEngine:
    """
    Deterministic Reward Optimization & Smart Card Utilization Engine.
    All calculations use pure Python arbitrary-precision Decimal arithmetic.
    Evaluates both upfront promotional instant discounts and post-transaction rewards.
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
        matched_offers: Optional[List[Tuple[Any, Decimal]]] = None
    ) -> CardRecommendation:
        amount = to_decimal(amount)
        current_month_spent_rewards = to_decimal(current_month_spent_rewards)
        steps: List[CalculationStep] = []
        step_idx = 1
        missing_notes: List[str] = []
        source_refs: List[str] = []

        if card.terms_source_url:
            source_refs.append(card.terms_source_url)

        # 0. Check if card is active
        if not card.is_active:
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
                is_excluded=True,
                exclusion_reason="Card is marked inactive",
                applicable_offers=[],
                missing_information_notes=["Card is deactivated."],
                source_references=source_refs,
                breakdown_steps=[]
            )

        # 1. Evaluate Upfront Promotional Offers (Instant Discounts)
        applicable_offer_summaries: List[ApplicableOfferSummary] = []
        instant_discount = Decimal("0.00")

        if matched_offers:
            # First offer is highest discount value
            best_offer, discount_amount = matched_offers[0]
            instant_discount = to_decimal(discount_amount)
            applicable_offer_summaries.append(ApplicableOfferSummary(
                offer_id=best_offer.id,
                merchant_name=best_offer.merchant_name,
                offer_title=best_offer.offer_title,
                promo_code=best_offer.promo_code,
                discount_type=best_offer.discount_type,
                discount_amount=instant_discount,
                terms_and_conditions=best_offer.terms_and_conditions,
                source_url=best_offer.source_url,
                verification_status=best_offer.verification_status
            ))
            if best_offer.source_url:
                source_refs.append(best_offer.source_url)

            code_text = f" (Promo Code: {best_offer.promo_code})" if best_offer.promo_code else " (Auto-applied)"
            steps.append(CalculationStep(
                step_number=step_idx,
                rule_name=f"Instant Promotional Discount ({best_offer.merchant_name})",
                rate_percentage=to_decimal(best_offer.discount_value) if best_offer.discount_type == "PERCENTAGE" else Decimal("0.00"),
                raw_reward=instant_discount,
                cap_applied=best_offer.max_discount_amount,
                final_monetary_value=instant_discount,
                reason=f"Applied upfront offer '{best_offer.offer_title}'{code_text}. Discount: ₹{instant_discount}."
            ))
            step_idx += 1

        # The net charged amount on the credit card after instant discount
        charged_amount = max(Decimal("0.00"), amount - instant_discount)

        # 2. Match Permanent Reward Rules on the Card
        rules: List[CardRewardRule] = list(card.reward_rules) if card.reward_rules else []
        matched_rule: Optional[CardRewardRule] = None

        # Step A: Merchant-specific rule match
        if merchant_name:
            merchant_clean = merchant_name.strip().lower()
            for r in rules:
                if r.merchant_pattern:
                    pattern = r.merchant_pattern.strip().lower()
                    if pattern in merchant_clean or merchant_clean in pattern:
                        matched_rule = r
                        steps.append(CalculationStep(
                            step_number=step_idx,
                            rule_name=f"Merchant Specific Rule ({r.merchant_pattern})",
                            rate_percentage=to_decimal(r.reward_rate_percentage),
                            raw_reward=Decimal("0.00"),
                            final_monetary_value=Decimal("0.00"),
                            reason=f"Matched merchant '{merchant_name}' against card rule pattern '{r.merchant_pattern}'."
                        ))
                        step_idx += 1
                        break

        # Step B: Category match
        if not matched_rule:
            target_cat = category_id.strip().lower()
            for r in rules:
                if r.category_id and r.category_id.strip().lower() == target_cat:
                    if r.merchant_pattern:
                        if merchant_name and (r.merchant_pattern.strip().lower() in merchant_name.strip().lower() or merchant_name.strip().lower() in r.merchant_pattern.strip().lower()):
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
            point_value = to_decimal(matched_rule.point_monetary_value or Decimal("1.00"))
            min_spend = to_decimal(matched_rule.min_transaction_amount or Decimal("0.00"))
            max_per_txn = to_decimal(matched_rule.max_reward_per_transaction) if matched_rule.max_reward_per_transaction is not None else None
            monthly_cap = to_decimal(matched_rule.monthly_cap_amount) if matched_rule.monthly_cap_amount is not None else None
            is_excluded = matched_rule.is_excluded
            exclusion_reason = matched_rule.exclusion_reason

        # 3. Check Exclusion
        if is_excluded:
            steps.append(CalculationStep(
                step_number=step_idx,
                rule_name="Exclusion Enforced",
                rate_percentage=Decimal("0.00"),
                raw_reward=Decimal("0.00"),
                final_monetary_value=Decimal("0.00"),
                reason=exclusion_reason or "Category or merchant is explicitly excluded from earning rewards."
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
                reward_rate_percentage=Decimal("0.00"),
                point_monetary_value=point_value,
                instant_discount_monetary=instant_discount,
                post_reward_monetary=Decimal("0.00"),
                expected_reward_monetary=net_benefit,
                net_financial_benefit=net_benefit,
                effective_rate_percentage=effective_rate,
                is_excluded=True,
                exclusion_reason=exclusion_reason or "Exclusion applied",
                applicable_offers=applicable_offer_summaries,
                missing_information_notes=missing_notes,
                source_references=source_refs,
                breakdown_steps=steps
            )

        # 4. Check Minimum Spend Requirement on Card Rule
        calc_spend_basis = charged_amount if charged_amount > Decimal("0.00") else amount
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
                is_excluded=False,
                exclusion_reason=f"Minimum spend of ₹{min_spend} not met for rewards",
                applicable_offers=applicable_offer_summaries,
                missing_information_notes=missing_notes,
                source_references=source_refs,
                breakdown_steps=steps
            )

        # 5. Calculate Raw Post-Transaction Rewards
        rate_multiplier = (rate_percentage / Decimal("100.00"))
        if reward_type == "CASHBACK":
            raw_monetary = (calc_spend_basis * rate_multiplier).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
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
            raw_monetary = (points * point_value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            steps.append(CalculationStep(
                step_number=step_idx,
                rule_name=f"{reward_type} Calculation",
                rate_percentage=rate_percentage,
                raw_reward=raw_monetary,
                final_monetary_value=raw_monetary,
                reason=f"{points} points earned at ₹{point_value} per point = ₹{raw_monetary}"
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
            is_excluded=False,
            exclusion_reason=None,
            applicable_offers=applicable_offer_summaries,
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
        matched_card_offers_map: Optional[Dict[str, List[Tuple[Any, Decimal]]]] = None,
        language: str = "en"
    ) -> RecommendResponse:
        amount = to_decimal(amount)
        if not cards:
            return RecommendResponse(
                transaction_amount=amount,
                category_id=category_id,
                merchant_name=merchant_name,
                payment_channel=payment_channel,
                recommended_card=None,
                alternatives=[],
                explanation="No active credit cards registered in your portfolio. Please add a card to receive personalized recommendations.",
                language=language,
                queried_at=datetime.utcnow().isoformat()
            )

        evaluations: List[CardRecommendation] = []
        for card in cards:
            card_offers = matched_card_offers_map.get(card.id, []) if matched_card_offers_map else []
            eval_result = cls.evaluate_card_for_transaction(
                card=card,
                amount=amount,
                category_id=category_id,
                merchant_name=merchant_name,
                payment_channel=payment_channel,
                matched_offers=card_offers
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
            category_id=category_id,
            merchant_name=merchant_name,
            payment_channel=payment_channel,
            recommended_card=recommended,
            alternatives=alternatives,
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
