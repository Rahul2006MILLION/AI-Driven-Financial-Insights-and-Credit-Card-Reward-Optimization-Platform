from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
from dataclasses import dataclass, field
import json

from app.models.entities import CreditCard, CardOffer, CardRewardRule
from app.services.reward_optimization.merchant_normalizer import MerchantNormalizer

class RejectionReason:
    CARD_INACTIVE = "CARD_INACTIVE"
    CARD_VARIANT_MISMATCH = "CARD_VARIANT_MISMATCH"
    MINIMUM_SPEND_NOT_MET = "MINIMUM_SPEND_NOT_MET"
    OFFER_EXPIRED = "OFFER_EXPIRED"
    OFFER_NOT_YET_VALID = "OFFER_NOT_YET_VALID"
    OFFER_NOT_VERIFIED = "OFFER_NOT_VERIFIED"
    MERCHANT_NOT_ELIGIBLE = "MERCHANT_NOT_ELIGIBLE"
    CHANNEL_NOT_SUPPORTED = "CHANNEL_NOT_SUPPORTED"
    CATEGORY_MISMATCH = "CATEGORY_MISMATCH"
    BANK_MISMATCH = "BANK_MISMATCH"
    NETWORK_MISMATCH = "NETWORK_MISMATCH"
    MONTHLY_CAP_EXHAUSTED = "MONTHLY_CAP_EXHAUSTED"
    CATEGORY_EXCLUDED = "CATEGORY_EXCLUDED"
    OFFER_INCOMPATIBLE_STACKING = "OFFER_INCOMPATIBLE_STACKING"

@dataclass
class OfferEligibilityResult:
    offer: CardOffer
    is_eligible: bool
    calculated_discount: Decimal = Decimal("0.00")
    rejection_reasons: List[str] = field(default_factory=list)
    rejection_details: List[str] = field(default_factory=list)
    stacking_group: str = "BANK_INSTANT"  # BANK_INSTANT, MERCHANT_PROMO, NETWORK_PERK

class OfferEligibilityEngine:
    """
    Evaluates promotional offer eligibility against cards, transactions, and stacking rules.
    Enforces that unverified, expired, or incompatible offers never influence financial recommendations.
    """

    CATEGORY_SYNONYMS = {
        "food_delivery": {"food_delivery", "dining", "food", "restaurants"},
        "dining": {"dining", "food_delivery", "food", "restaurants"},
        "grocery": {"grocery", "supermarket", "quick_commerce"},
        "shopping": {"shopping", "shopping_online", "shopping_offline", "ecommerce", "retail"},
        "travel": {"travel", "flights", "hotels", "domestic_travel", "international_travel"},
        "utility": {"utility", "bill_payments", "recharge"},
        "fuel": {"fuel", "petrol", "diesel", "cng"},
        "entertainment": {"entertainment", "movies", "cinema", "events"},
        "health": {"health", "pharmacy", "medical"}
    }

    @classmethod
    def evaluate_offer_eligibility(
        cls,
        offer: CardOffer,
        card: CreditCard,
        amount: Decimal,
        category_id: str,
        merchant_name: Optional[str] = None,
        payment_channel: str = "ONLINE",
        transaction_date: Optional[datetime] = None
    ) -> OfferEligibilityResult:
        """
        Conducts exhaustive eligibility verification on an offer for a given card and spend.
        Collects structured rejection reasons on failure.
        """
        rejection_reasons: List[str] = []
        details: List[str] = []
        now = transaction_date or datetime.utcnow()

        # 1. Verification Status Check
        # STRICT REQUIREMENT: Only strictly VERIFIED offers may influence recommendations!
        if offer.verification_status != "VERIFIED":
            rejection_reasons.append(RejectionReason.OFFER_NOT_VERIFIED)
            details.append(f"Offer verification status is '{offer.verification_status}', not 'VERIFIED'.")

        # 2. Date Validity Check
        if offer.valid_from and offer.valid_from > now:
            rejection_reasons.append(RejectionReason.OFFER_NOT_YET_VALID)
            details.append(f"Offer is not yet active (valid from {offer.valid_from.date()}).")

        if offer.valid_to and offer.valid_to < now:
            rejection_reasons.append(RejectionReason.OFFER_EXPIRED)
            details.append(f"Offer expired on {offer.valid_to.date()}.")

        # 3. Channel Check
        if offer.payment_channel != "BOTH" and offer.payment_channel.upper() != payment_channel.upper():
            rejection_reasons.append(RejectionReason.CHANNEL_NOT_SUPPORTED)
            details.append(f"Payment channel '{payment_channel}' not supported; requires '{offer.payment_channel}'.")

        # 4. Minimum Spend Requirement
        if amount < offer.min_transaction_value:
            rejection_reasons.append(RejectionReason.MINIMUM_SPEND_NOT_MET)
            details.append(f"Transaction amount ₹{amount} is less than required minimum ₹{offer.min_transaction_value}.")

        # 5. Merchant Matching (using MerchantNormalizer)
        if merchant_name:
            offer_merch_clean = offer.merchant_name.strip().lower()
            if offer_merch_clean not in ("all", "any", "general"):
                is_match, conf, reason = MerchantNormalizer.matches_pattern(merchant_name, offer.merchant_name)
                if not is_match:
                    rejection_reasons.append(RejectionReason.MERCHANT_NOT_ELIGIBLE)
                    details.append(f"Merchant '{merchant_name}' does not match offer merchant '{offer.merchant_name}' ({reason}).")

        # 6. Category Matching
        cat_clean = category_id.strip().lower()
        offer_cat_clean = offer.category_id.strip().lower()
        if offer_cat_clean not in ("all", "any", "general", "*"):
            synonyms = cls.CATEGORY_SYNONYMS.get(cat_clean, {cat_clean})
            if offer_cat_clean not in synonyms and cat_clean != offer_cat_clean:
                rejection_reasons.append(RejectionReason.CATEGORY_MISMATCH)
                details.append(f"Category '{category_id}' does not match offer category '{offer.category_id}'.")

        # 7. Bank Issuer Matching
        if offer.eligible_bank:
            card_bank = card.bank_name.strip().lower()
            offer_bank = offer.eligible_bank.strip().lower()
            if card_bank not in offer_bank and offer_bank not in card_bank:
                rejection_reasons.append(RejectionReason.BANK_MISMATCH)
                details.append(f"Card issuer '{card.bank_name}' does not match eligible bank '{offer.eligible_bank}'.")

        # 8. Network Matching
        if offer.eligible_network:
            card_net = card.network.strip().upper()
            offer_net = offer.eligible_network.strip().upper()
            if card_net != offer_net:
                rejection_reasons.append(RejectionReason.NETWORK_MISMATCH)
                details.append(f"Card network '{card.network}' does not match eligible network '{offer.eligible_network}'.")

        # 9. Specific Card Name / Variant Matching
        if offer.eligible_card_names_json:
            try:
                target_names = [n.lower().strip() for n in json.loads(offer.eligible_card_names_json)]
                if target_names:
                    card_full_name = f"{card.card_name} {card.card_variant or ''}".lower()
                    matched = False
                    for tn in target_names:
                        words = tn.split()
                        if all(w in card_full_name for w in words):
                            matched = True
                            break
                    if not matched:
                        rejection_reasons.append(RejectionReason.CARD_VARIANT_MISMATCH)
                        details.append(f"Card '{card.card_name}' is not in the eligible card variants: {target_names}.")
            except Exception:
                pass

        # Classify Stacking Group
        stacking_group = "BANK_INSTANT"
        if offer.eligible_bank:
            stacking_group = "BANK_INSTANT"
        elif offer.eligible_network:
            stacking_group = "NETWORK_PERK"
        else:
            stacking_group = "MERCHANT_PROMO"

        if rejection_reasons:
            return OfferEligibilityResult(
                offer=offer,
                is_eligible=False,
                calculated_discount=Decimal("0.00"),
                rejection_reasons=rejection_reasons,
                rejection_details=details,
                stacking_group=stacking_group
            )

        # Calculate discount amount
        if offer.discount_type == "PERCENTAGE":
            raw_discount = (amount * (offer.discount_value / Decimal("100.00"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            if offer.max_discount_amount:
                discount_val = min(raw_discount, offer.max_discount_amount)
            else:
                discount_val = raw_discount
        else:  # FLAT_AMOUNT
            discount_val = min(offer.discount_value, amount)

        return OfferEligibilityResult(
            offer=offer,
            is_eligible=True,
            calculated_discount=discount_val,
            rejection_reasons=[],
            rejection_details=[],
            stacking_group=stacking_group
        )

    @classmethod
    def resolve_stacking(
        cls,
        eligibility_results: List[OfferEligibilityResult]
    ) -> Tuple[List[OfferEligibilityResult], List[OfferEligibilityResult]]:
        """
        Resolves offer stacking conflicts to prevent double-counting.
        Rules:
        - Only ONE Bank Instant Discount per transaction (highest benefit chosen).
        - Only ONE Promo Code applied per checkout (highest benefit chosen).
        - Merchant Promos stack with Bank Discounts only if promo codes do not conflict.
        Returns: (applied_offers, excluded_offers_with_reasons)
        """
        applied: List[OfferEligibilityResult] = []
        excluded: List[OfferEligibilityResult] = []

        # Filter strictly eligible offers
        eligible = [r for r in eligibility_results if r.is_eligible and r.calculated_discount > Decimal("0.00")]
        ineligible = [r for r in eligibility_results if not r.is_eligible]
        excluded.extend(ineligible)

        if not eligible:
            return applied, excluded

        # Group by stacking group
        bank_offers = [r for r in eligible if r.stacking_group == "BANK_INSTANT"]
        network_offers = [r for r in eligible if r.stacking_group == "NETWORK_PERK"]
        merchant_offers = [r for r in eligible if r.stacking_group == "MERCHANT_PROMO"]

        # 1. Select best Bank Instant Discount (cannot stack multiple bank discounts)
        chosen_bank_offer: Optional[OfferEligibilityResult] = None
        if bank_offers:
            bank_offers.sort(key=lambda x: x.calculated_discount, reverse=True)
            chosen_bank_offer = bank_offers[0]
            applied.append(chosen_bank_offer)
            for conflicting in bank_offers[1:]:
                conflicting.is_eligible = False
                conflicting.rejection_reasons.append(RejectionReason.OFFER_INCOMPATIBLE_STACKING)
                conflicting.rejection_details.append(
                    f"Conflicting bank discount; superseded by '{chosen_bank_offer.offer.offer_title}' (₹{chosen_bank_offer.calculated_discount})."
                )
                excluded.append(conflicting)

        # 2. Select best Network Perk (if bank offer not already applying a conflicting instant discount)
        if network_offers:
            network_offers.sort(key=lambda x: x.calculated_discount, reverse=True)
            best_net = network_offers[0]
            if chosen_bank_offer and best_net.offer.promo_code and chosen_bank_offer.offer.promo_code:
                # Two conflicting promo codes cannot be entered in checkout
                best_net.is_eligible = False
                best_net.rejection_reasons.append(RejectionReason.OFFER_INCOMPATIBLE_STACKING)
                best_net.rejection_details.append(
                    f"Conflicting promo code '{best_net.offer.promo_code}' cannot stack with bank coupon '{chosen_bank_offer.offer.promo_code}'."
                )
                excluded.append(best_net)
            else:
                applied.append(best_net)
            for conflicting in network_offers[1:]:
                conflicting.is_eligible = False
                conflicting.rejection_reasons.append(RejectionReason.OFFER_INCOMPATIBLE_STACKING)
                conflicting.rejection_details.append("Only one network perk may be claimed per transaction.")
                excluded.append(conflicting)

        # 3. Select Merchant Promo (auto-applied or non-conflicting coupon)
        if merchant_offers:
            merchant_offers.sort(key=lambda x: x.calculated_discount, reverse=True)
            best_merch = merchant_offers[0]
            existing_codes = [a.offer.promo_code for a in applied if a.offer.promo_code]
            if best_merch.offer.promo_code and existing_codes:
                # Conflicting promo code
                best_merch.is_eligible = False
                best_merch.rejection_reasons.append(RejectionReason.OFFER_INCOMPATIBLE_STACKING)
                best_merch.rejection_details.append(
                    f"Promo code '{best_merch.offer.promo_code}' cannot stack with checkout coupon '{existing_codes[0]}'."
                )
                excluded.append(best_merch)
            else:
                applied.append(best_merch)
            for conflicting in merchant_offers[1:]:
                conflicting.is_eligible = False
                conflicting.rejection_reasons.append(RejectionReason.OFFER_INCOMPATIBLE_STACKING)
                conflicting.rejection_details.append("Multiple merchant promo codes cannot be combined.")
                excluded.append(conflicting)

        return applied, excluded

