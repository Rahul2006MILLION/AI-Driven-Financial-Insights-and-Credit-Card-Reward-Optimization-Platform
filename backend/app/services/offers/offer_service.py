import json
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_

from app.models.entities import CardOffer, CreditCard
from app.schemas.offer import CardOfferCreate, CardOfferResponse, ApplicableOfferSummary

SEED_OFFERS = [
    {
        "merchant_name": "Swiggy",
        "offer_title": "Flat ₹150 instant discount on food delivery with HDFC Cards",
        "category_id": "food_delivery",
        "discount_type": "FLAT_AMOUNT",
        "discount_value": Decimal("150.00"),
        "min_transaction_value": Decimal("600.00"),
        "max_discount_amount": Decimal("150.00"),
        "eligible_bank": "HDFC Bank",
        "eligible_network": None,
        "eligible_card_names": ["HDFC Millennia", "HDFC Regalia Gold", "HDFC Infinia Metal"],
        "payment_channel": "ONLINE",
        "promo_code": "HDFCFEST",
        "activation_requirement": "Apply coupon HDFCFEST in Swiggy checkout promo code box",
        "terms_and_conditions": "Valid once per user per week on minimum order of ₹600. Valid on credit cards only.",
        "source_url": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/card-offers",
        "verification_status": "VERIFIED",
    },
    {
        "merchant_name": "Amazon",
        "offer_title": "10% Instant Discount up to ₹1,500 on ICICI Bank Cards",
        "category_id": "shopping",
        "discount_type": "PERCENTAGE",
        "discount_value": Decimal("10.00"),
        "min_transaction_value": Decimal("5000.00"),
        "max_discount_amount": Decimal("1500.00"),
        "eligible_bank": "ICICI Bank",
        "eligible_network": None,
        "eligible_card_names": [],
        "payment_channel": "ONLINE",
        "promo_code": "ICICI10",
        "activation_requirement": "Select ICICI Bank Card at Amazon Pay checkout. Discount auto-applied.",
        "terms_and_conditions": "Applicable on Electronics, Fashion and Home appliances. Minimum cart value ₹5,000.",
        "source_url": "https://www.amazon.in/bankoffers",
        "verification_status": "VERIFIED",
    },
    {
        "merchant_name": "Swiggy",
        "offer_title": "20% off up to ₹120 on Dineout with Axis Bank Cards",
        "category_id": "dining",
        "discount_type": "PERCENTAGE",
        "discount_value": Decimal("20.00"),
        "min_transaction_value": Decimal("1000.00"),
        "max_discount_amount": Decimal("120.00"),
        "eligible_bank": "Axis Bank",
        "eligible_network": None,
        "eligible_card_names": ["Axis Ace", "Axis Bank Magnus"],
        "payment_channel": "ONLINE",
        "promo_code": "AXISDINEOUT",
        "activation_requirement": "Pay bill via Swiggy Dineout using Axis Bank Credit Card",
        "terms_and_conditions": "Valid twice a month at partner restaurants on Swiggy Dineout.",
        "source_url": "https://www.axisbank.com/dining-delights",
        "verification_status": "VERIFIED",
    },
    {
        "merchant_name": "MakeMyTrip",
        "offer_title": "Flat 12% off on domestic flights with SBI Cards",
        "category_id": "travel",
        "discount_type": "PERCENTAGE",
        "discount_value": Decimal("12.00"),
        "min_transaction_value": Decimal("4000.00"),
        "max_discount_amount": Decimal("1200.00"),
        "eligible_bank": "SBI Card",
        "eligible_network": None,
        "eligible_card_names": [],
        "payment_channel": "ONLINE",
        "promo_code": "MMTSBI",
        "activation_requirement": "Enter coupon code MMTSBI on flight review page",
        "terms_and_conditions": "Valid on domestic flight bookings. Offer valid till month end.",
        "source_url": "https://www.sbicard.com/offers",
        "verification_status": "VERIFIED",
    },
    {
        "merchant_name": "BookMyShow",
        "offer_title": "Buy 1 Get 1 Free Movie Ticket on RuPay Select Cards",
        "category_id": "entertainment",
        "discount_type": "FLAT_AMOUNT",
        "discount_value": Decimal("250.00"),
        "min_transaction_value": Decimal("300.00"),
        "max_discount_amount": Decimal("250.00"),
        "eligible_bank": None,
        "eligible_network": "RUPAY",
        "eligible_card_names": [],
        "payment_channel": "ONLINE",
        "promo_code": "RUPAYSELECT",
        "activation_requirement": "Select RuPay Offer on Payment Page and enter 16-digit card number",
        "terms_and_conditions": "Up to ₹250 discount on 2nd movie ticket. Valid twice per calendar month.",
        "source_url": "https://www.rupay.co.in/rupay-offers",
        "verification_status": "VERIFIED",
    },
    {
        "merchant_name": "Blinkit",
        "offer_title": "Flat ₹75 off on Grocery orders above ₹799 with HDFC Cards",
        "category_id": "grocery",
        "discount_type": "FLAT_AMOUNT",
        "discount_value": Decimal("75.00"),
        "min_transaction_value": Decimal("799.00"),
        "max_discount_amount": Decimal("75.00"),
        "eligible_bank": "HDFC Bank",
        "eligible_network": None,
        "eligible_card_names": [],
        "payment_channel": "ONLINE",
        "promo_code": "HDFCBLINK",
        "activation_requirement": "Apply coupon HDFCBLINK before payment on Blinkit app",
        "terms_and_conditions": "Valid once every Friday, Saturday, and Sunday on minimum purchase of ₹799.",
        "source_url": "https://blinkit.com/offers",
        "verification_status": "SAMPLE",
    },
    {
        "merchant_name": "Croma",
        "offer_title": "₹1,000 Instant Discount in-store on Axis Bank Credit Cards",
        "category_id": "shopping",
        "discount_type": "FLAT_AMOUNT",
        "discount_value": Decimal("1000.00"),
        "min_transaction_value": Decimal("15000.00"),
        "max_discount_amount": Decimal("1000.00"),
        "eligible_bank": "Axis Bank",
        "eligible_network": None,
        "eligible_card_names": [],
        "payment_channel": "OFFLINE",
        "promo_code": None,
        "activation_requirement": "Swipe or tap Axis Bank Credit Card on PineLabs POS at Croma store",
        "terms_and_conditions": "Valid only at physical Croma retail stores on non-EMI and brand EMI transactions.",
        "source_url": "https://www.croma.com/bank-offers",
        "verification_status": "SAMPLE",
    },
    {
        "merchant_name": "Zomato",
        "offer_title": "Flat ₹100 off on dining bill with Visa Signature cards",
        "category_id": "dining",
        "discount_type": "FLAT_AMOUNT",
        "discount_value": Decimal("100.00"),
        "min_transaction_value": Decimal("800.00"),
        "max_discount_amount": Decimal("100.00"),
        "eligible_bank": None,
        "eligible_network": "VISA",
        "eligible_card_names": [],
        "payment_channel": "ONLINE",
        "promo_code": "VISADINE",
        "activation_requirement": "Pay restaurant bill via Zomato Pay using Visa Signature or Infinite card",
        "terms_and_conditions": "Valid once per month per user at participating restaurants.",
        "source_url": "https://www.visa.co.in/en_in/visa-offers-and-perks",
        "verification_status": "SAMPLE",
    }
]

class OfferService:
    @classmethod
    async def seed_initial_offers_if_empty(cls, db: AsyncSession):
        stmt = select(CardOffer)
        existing = (await db.execute(stmt)).scalars().first()
        if not existing:
            now = datetime.utcnow()
            for off in SEED_OFFERS:
                offer_entity = CardOffer(
                    merchant_name=off["merchant_name"],
                    offer_title=off["offer_title"],
                    category_id=off["category_id"],
                    discount_type=off["discount_type"],
                    discount_value=off["discount_value"],
                    min_transaction_value=off["min_transaction_value"],
                    max_discount_amount=off["max_discount_amount"],
                    eligible_bank=off["eligible_bank"],
                    eligible_network=off["eligible_network"],
                    eligible_card_names_json=json.dumps(off["eligible_card_names"]),
                    valid_from=now - timedelta(days=5),
                    valid_to=now + timedelta(days=60),
                    payment_channel=off["payment_channel"],
                    promo_code=off["promo_code"],
                    activation_requirement=off["activation_requirement"],
                    terms_and_conditions=off["terms_and_conditions"],
                    source_url=off["source_url"],
                    verification_status=off["verification_status"],
                    last_verified_timestamp=now
                )
                db.add(offer_entity)
            await db.commit()

    @classmethod
    async def list_offers(
        cls,
        db: AsyncSession,
        user_cards: List[CreditCard],
        category: Optional[str] = None,
        merchant_name: Optional[str] = None,
        only_user_cards: bool = False,
        expiring_soon: bool = False,
        verification_status: Optional[str] = None,
        query: Optional[str] = None,
    ) -> List[CardOfferResponse]:
        now = datetime.utcnow()
        stmt = select(CardOffer).where(CardOffer.valid_to >= now)

        if category and category.lower() != "all":
            cat_clean = category.lower().strip()
            # map food delivery to food_delivery or dining
            if cat_clean in ["food", "food_delivery", "delivery"]:
                stmt = stmt.where(CardOffer.category_id.in_(["food_delivery", "dining"]))
            else:
                stmt = stmt.where(CardOffer.category_id == cat_clean)

        if merchant_name:
            stmt = stmt.where(CardOffer.merchant_name.ilike(f"%{merchant_name.strip()}%"))

        if expiring_soon:
            seven_days = now + timedelta(days=7)
            stmt = stmt.where(CardOffer.valid_to <= seven_days)

        if verification_status:
            stmt = stmt.where(CardOffer.verification_status == verification_status)

        if query:
            q_term = f"%{query.strip()}%"
            stmt = stmt.where(
                or_(
                    CardOffer.merchant_name.ilike(q_term),
                    CardOffer.offer_title.ilike(q_term),
                    CardOffer.category_id.ilike(q_term),
                    CardOffer.promo_code.ilike(q_term)
                )
            )

        stmt = stmt.order_by(CardOffer.verification_status.asc(), CardOffer.valid_to.asc())
        offers = (await db.execute(stmt)).scalars().all()

        results: List[CardOfferResponse] = []
        for o in offers:
            matching_cards = cls.find_matching_user_cards(o, user_cards)
            is_match = len(matching_cards) > 0

            if only_user_cards and not is_match:
                continue

            try:
                card_names = json.loads(o.eligible_card_names_json or "[]")
            except Exception:
                card_names = []

            resp = CardOfferResponse(
                id=o.id,
                merchant_name=o.merchant_name,
                offer_title=o.offer_title,
                category_id=o.category_id,
                discount_type=o.discount_type,
                discount_value=o.discount_value,
                min_transaction_value=o.min_transaction_value,
                max_discount_amount=o.max_discount_amount,
                eligible_bank=o.eligible_bank,
                eligible_network=o.eligible_network,
                eligible_card_names=card_names,
                valid_from=o.valid_from,
                valid_to=o.valid_to,
                payment_channel=o.payment_channel,
                promo_code=o.promo_code,
                activation_requirement=o.activation_requirement,
                terms_and_conditions=o.terms_and_conditions,
                source_url=o.source_url,
                verification_status=o.verification_status,
                last_verified_timestamp=o.last_verified_timestamp,
                created_at=o.created_at,
                matching_user_card_names=matching_cards,
                is_applicable_to_user=is_match
            )
            results.append(resp)

        return results

    @classmethod
    def find_matching_user_cards(cls, offer: CardOffer, user_cards: List[CreditCard]) -> List[str]:
        matching: List[str] = []
        try:
            specific_names = [n.lower() for n in json.loads(offer.eligible_card_names_json or "[]")]
        except Exception:
            specific_names = []

        for card in user_cards:
            if not card.is_active:
                continue
            # Bank check
            if offer.eligible_bank and offer.eligible_bank.lower() not in card.bank_name.lower() and card.bank_name.lower() not in offer.eligible_bank.lower():
                continue
            # Network check
            if offer.eligible_network and offer.eligible_network.upper() != card.network.upper():
                continue
            # Specific card name check (if offer restricts to specific variants)
            if specific_names:
                card_matched = any(sn in card.card_name.lower() for sn in specific_names)
                if not card_matched:
                    continue
            matching.append(f"{card.card_name} ({card.bank_name})")
        return matching

    @classmethod
    async def get_applicable_offers_for_card(
        cls,
        db: AsyncSession,
        card: CreditCard,
        amount: Decimal,
        category_id: str,
        merchant_name: Optional[str] = None,
        payment_channel: str = "ONLINE"
    ) -> List[Tuple[CardOffer, Decimal]]:
        """
        Retrieves active, valid promotional offers matching this card, category, merchant, and channel.
        Returns list of (Offer, Calculated Discount Monetary Value).
        """
        now = datetime.utcnow()
        stmt = (
            select(CardOffer)
            .where(
                CardOffer.valid_from <= now,
                CardOffer.valid_to >= now,
                CardOffer.min_transaction_value <= amount
            )
        )
        all_active = (await db.execute(stmt)).scalars().all()

        applicable: List[Tuple[CardOffer, Decimal]] = []
        cat_clean = category_id.lower().strip()
        merch_clean = merchant_name.lower().strip() if merchant_name else None

        for o in all_active:
            # 1. Channel check: ONLINE / OFFLINE / BOTH
            if o.payment_channel != "BOTH" and o.payment_channel != payment_channel:
                continue

            # 2. Merchant check
            o_merch = o.merchant_name.lower().strip()
            if merch_clean:
                # If transaction specifies a merchant, offer must match it unless offer is general/all
                if o_merch not in ("all", "any", "general") and (o_merch not in merch_clean and merch_clean not in o_merch):
                    continue

            # 3. Category check
            offer_cat = o.category_id.lower().strip()
            cat_match = (
                offer_cat in (cat_clean, "all") or
                (offer_cat in ["food_delivery", "dining"] and cat_clean in ["food_delivery", "dining"]) or
                (offer_cat in ["travel", "flights", "hotels"] and cat_clean in ["travel", "flights", "hotels"]) or
                (offer_cat in ["shopping", "shopping_online", "shopping_offline"] and cat_clean in ["shopping", "shopping_online", "shopping_offline"])
            )
            if not cat_match:
                continue

            # 4. Card eligibility check (Issuer, Network, Specific Names)
            if o.eligible_bank and o.eligible_bank.lower() not in card.bank_name.lower() and card.bank_name.lower() not in o.eligible_bank.lower():
                continue
            if o.eligible_network and o.eligible_network.upper() != card.network.upper():
                continue
            if o.eligible_card_names_json:
                try:
                    s_names = [n.lower() for n in json.loads(o.eligible_card_names_json)]
                    if s_names:
                        # Match if all words in any target name exist in card name
                        card_matched = any(all(w in card.card_name.lower() for w in sn.split()) for sn in s_names)
                        if not card_matched:
                            continue
                except Exception:
                    pass

            # 4. Calculate discount monetary value
            if o.discount_type == "PERCENTAGE":
                raw_disc = (amount * (o.discount_value / Decimal("100.00"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                if o.max_discount_amount:
                    discount_val = min(raw_disc, o.max_discount_amount)
                else:
                    discount_val = raw_disc
            else:  # FLAT_AMOUNT
                discount_val = min(o.discount_value, amount)

            applicable.append((o, discount_val))

        # Sort by highest discount value first
        applicable.sort(key=lambda x: x[1], reverse=True)
        return applicable
