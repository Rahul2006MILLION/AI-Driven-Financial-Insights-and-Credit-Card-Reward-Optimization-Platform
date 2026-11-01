import json
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_

from app.models.entities import CardOffer, CreditCard, OfferAuditLog, Profile
from app.services.offers.normalization import OfferNormalizer
from app.schemas.offer import (
    CardOfferCreate,
    CardOfferResponse,
    ApplicableOfferSummary,
    AdminOfferEditRequest
)

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
        "source_name": "HDFC SmartBuy Portal",
        "source_evidence": 'Verified T&C: "Flat ₹150 instant discount on Swiggy using HDFC Bank Credit Cards with code HDFCFEST on orders >= ₹600."',
        "extraction_confidence": Decimal("0.96"),
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
        "source_name": "Amazon Bank Partnerships",
        "source_evidence": 'Amazon Official: "10% instant off on ICICI Credit Cards up to ₹1,500 on minimum spend of ₹5,000."',
        "extraction_confidence": Decimal("0.94"),
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
        "source_name": "Axis Dining Delights",
        "source_evidence": 'GrabDeals Official: "Enjoy 20% off up to ₹120 on Swiggy Dineout with your Axis Bank Credit Card."',
        "extraction_confidence": Decimal("0.95"),
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
        "source_name": "SBI Card Travel Deals",
        "source_evidence": 'SBI Card Offers: "Flat 12% instant discount up to ₹1,200 on Domestic Flights booked on MakeMyTrip."',
        "extraction_confidence": Decimal("0.92"),
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
        "source_name": "NPCI RuPay Privileges",
        "source_evidence": 'RuPay Select Portal: "Buy one movie ticket get one free up to ₹250 on BookMyShow twice a month."',
        "extraction_confidence": Decimal("0.93"),
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
        "source_name": "Blinkit Quick Commerce",
        "source_evidence": 'Blinkit App: "Flat ₹75 off on orders above ₹799 with HDFC Bank Credit Cards on weekends."',
        "extraction_confidence": Decimal("0.89"),
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
        "source_name": "Croma Retail Bank Deals",
        "source_evidence": 'In-Store POS Signage: "Instant ₹1,000 off at Croma stores on Axis Bank cards on spends above ₹15,000."',
        "extraction_confidence": Decimal("0.88"),
        "verification_status": "VERIFIED",
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
        "source_name": "Visa India Cardholder Perks",
        "source_evidence": 'Visa Signature Benefits: "Enjoy ₹100 off on dining payments exceeding ₹800 via Zomato Pay."',
        "extraction_confidence": Decimal("0.90"),
        "verification_status": "SAMPLE",
    },
    # Seed demonstrative PENDING_REVIEW offer for Admin Review Queue
    {
        "merchant_name": "Flipkart",
        "offer_title": "10% Instant Discount on SBI Credit Cards during Big Billion Days",
        "category_id": "shopping",
        "discount_type": "PERCENTAGE",
        "discount_value": Decimal("10.00"),
        "min_transaction_value": Decimal("4990.00"),
        "max_discount_amount": Decimal("1750.00"),
        "eligible_bank": "SBI Card",
        "eligible_network": None,
        "eligible_card_names": ["SBI SimplyCLICK", "SBI Card PRIME"],
        "payment_channel": "ONLINE",
        "promo_code": "SBIBBD",
        "activation_requirement": "Select SBI Credit Card at checkout on Flipkart",
        "terms_and_conditions": "Valid on Electronics, Mobiles, and Laptops. Excludes SBI Corporate and Paytm SBI cards.",
        "source_url": "https://www.flipkart.com/sbi-terms",
        "source_name": "Flipkart Automated Connector",
        "source_evidence": 'Official Banner: "Get 10% instant discount up to ₹1,750 with SBI Credit Cards on min cart ₹4,990."',
        "extraction_confidence": Decimal("0.91"),
        "verification_status": "PENDING_REVIEW",
    },
    # Seed demonstrative NEEDS_REVERIFICATION offer with previous version diff
    {
        "merchant_name": "EazyDiner",
        "offer_title": "Flat 25% off up to ₹500 on Prime Dining with IndusInd Bank Cards",
        "category_id": "dining",
        "discount_type": "PERCENTAGE",
        "discount_value": Decimal("25.00"),
        "min_transaction_value": Decimal("1500.00"),
        "max_discount_amount": Decimal("500.00"),
        "eligible_bank": "IndusInd Bank",
        "eligible_network": None,
        "eligible_card_names": [],
        "payment_channel": "ONLINE",
        "promo_code": "INDUSPRIME",
        "activation_requirement": "Pay via EazyDiner Pay using IndusInd Credit Card",
        "terms_and_conditions": "Previously maximum discount was ₹1,000; source changed to ₹500. Requires admin verification.",
        "source_url": "https://www.eazydiner.com/offers",
        "source_name": "EazyDiner Connector",
        "source_evidence": 'Updated T&C: "25% discount capped at ₹500 (revised down from ₹1,000) on IndusInd cards on EazyDiner Pay."',
        "extraction_confidence": Decimal("0.87"),
        "verification_status": "NEEDS_REVERIFICATION",
        "version": 2,
        "previous_version_json": json.dumps({
            "version": 1,
            "offer_title": "Flat 25% off up to ₹1,000 on Prime Dining with IndusInd Bank Cards",
            "discount_value": "25.00",
            "max_discount_amount": "1000.00",
            "min_transaction_value": "1500.00",
            "promo_code": "INDUSPRIME",
            "terms": "Valid up to ₹1,000 max discount per month."
        })
    }
]

class OfferService:
    @classmethod
    async def seed_initial_offers_if_empty(cls, db: AsyncSession):
        now = datetime.utcnow()
        for off in SEED_OFFERS:
            stmt = select(CardOffer).where(CardOffer.offer_title == off["offer_title"])
            existing = (await db.execute(stmt)).scalars().first()
            if not existing:
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
                    source_name=off.get("source_name", "Official Bank / Merchant Partner"),
                    source_evidence=off.get("source_evidence", "Verified at official bank and merchant portal terms."),
                    extraction_confidence=off.get("extraction_confidence", Decimal("0.95")),
                    verification_status=off["verification_status"],
                    version=off.get("version", 1),
                    previous_version_json=off.get("previous_version_json"),
                    last_verified_timestamp=now
                )
                db.add(offer_entity)
            else:
                if off["verification_status"] in ("VERIFIED", "SAMPLE") and existing.verification_status in ("NEEDS_REVERIFICATION", "PENDING_REVIEW"):
                    existing.verification_status = off["verification_status"]
                    existing.valid_to = now + timedelta(days=60)
                    existing.valid_from = now - timedelta(days=5)
                    db.add(existing)
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
        is_admin: bool = False,
    ) -> List[CardOfferResponse]:
        now = datetime.utcnow()
        stmt = select(CardOffer).where(CardOffer.valid_to >= now)

        # For ordinary users, only display VERIFIED or verified test SAMPLE offers
        if not is_admin:
            if verification_status:
                stmt = stmt.where(CardOffer.verification_status == verification_status)
            else:
                stmt = stmt.where(CardOffer.verification_status.in_(["VERIFIED", "SAMPLE"]))
        else:
            if verification_status:
                stmt = stmt.where(CardOffer.verification_status == verification_status)

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
                source_name=o.source_name,
                source_evidence=o.source_evidence,
                extraction_confidence=o.extraction_confidence,
                verification_status=o.verification_status,
                freshness_state=getattr(o, "freshness_state", None) or OfferNormalizer.compute_freshness_state(o),
                source_id=getattr(o, "source_id", None),
                ingestion_channel=getattr(o, "ingestion_channel", "MANUAL_ENTRY"),
                source_document_id=getattr(o, "source_document_id", None),
                version=o.version,
                previous_version_json=o.previous_version_json,
                rejection_reason=o.rejection_reason,
                reviewed_by_name=o.reviewed_by_name,
                reviewed_at=o.reviewed_at,
                content_hash=o.content_hash,
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
        Retrieves active, strictly VERIFIED promotional offers matching this card, category, merchant, and channel.
        Unverified (PENDING_REVIEW, NEEDS_REVERIFICATION, REJECTED, EXPIRED, DISCOVERED) offers are strictly excluded.
        Returns list of (Offer, Calculated Discount Monetary Value).
        """
        now = datetime.utcnow()
        stmt = (
            select(CardOffer)
            .where(
                CardOffer.verification_status == "VERIFIED",
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

    # ==========================================================================
    # ADMIN HUMAN VERIFICATION & WORKFLOW ACTIONS
    # ==========================================================================

    @classmethod
    async def get_admin_review_queue(
        cls,
        db: AsyncSession,
        status_filter: Optional[str] = None,
        query: Optional[str] = None
    ) -> List[CardOfferResponse]:
        """
        Lists offers for administrative review across all verification statuses.
        """
        stmt = select(CardOffer)
        if status_filter and status_filter.upper() != "ALL":
            stmt = stmt.where(CardOffer.verification_status == status_filter.upper().strip())

        if query:
            q_term = f"%{query.strip()}%"
            stmt = stmt.where(
                or_(
                    CardOffer.merchant_name.ilike(q_term),
                    CardOffer.offer_title.ilike(q_term),
                    CardOffer.promo_code.ilike(q_term),
                    CardOffer.eligible_bank.ilike(q_term)
                )
            )

        # Sort priority: NEEDS_REVERIFICATION first, then PENDING_REVIEW, then others
        offers = (await db.execute(stmt)).scalars().all()
        priority_map = {
            "NEEDS_REVERIFICATION": 1,
            "PENDING_REVIEW": 2,
            "DISCOVERED": 3,
            "VERIFIED": 4,
            "REJECTED": 5,
            "EXPIRED": 6,
            "SOURCE_UNAVAILABLE": 7
        }
        offers = sorted(
            offers,
            key=lambda x: (priority_map.get(x.verification_status, 9), x.valid_to)
        )

        results: List[CardOfferResponse] = []
        for o in offers:
            try:
                card_names = json.loads(o.eligible_card_names_json or "[]")
            except Exception:
                card_names = []

            results.append(
                CardOfferResponse(
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
                    source_name=o.source_name,
                    source_evidence=o.source_evidence,
                    extraction_confidence=o.extraction_confidence,
                    verification_status=o.verification_status,
                    freshness_state=getattr(o, "freshness_state", None) or OfferNormalizer.compute_freshness_state(o),
                    source_id=getattr(o, "source_id", None),
                    ingestion_channel=getattr(o, "ingestion_channel", "MANUAL_ENTRY"),
                    source_document_id=getattr(o, "source_document_id", None),
                    version=o.version,
                    previous_version_json=o.previous_version_json,
                    rejection_reason=o.rejection_reason,
                    reviewed_by_name=o.reviewed_by_name,
                    reviewed_at=o.reviewed_at,
                    content_hash=o.content_hash,
                    last_verified_timestamp=o.last_verified_timestamp,
                    created_at=o.created_at,
                    matching_user_card_names=[],
                    is_applicable_to_user=False
                )
            )
        return results

    @classmethod
    async def approve_offer(
        cls,
        db: AsyncSession,
        offer_id: str,
        admin_user: Profile,
        notes: Optional[str] = None
    ) -> CardOffer:
        """
        Approves an offer into VERIFIED state with audit tracking.
        """
        stmt = select(CardOffer).where(CardOffer.id == offer_id)
        offer = (await db.execute(stmt)).scalar_one_or_none()
        if not offer:
            raise ValueError("Offer not found.")

        old_status = offer.verification_status
        now = datetime.utcnow()

        offer.verification_status = "VERIFIED"
        offer.reviewed_by_id = admin_user.id
        offer.reviewed_by_name = admin_user.full_name or admin_user.email
        offer.reviewed_at = now
        offer.last_verified_timestamp = now
        offer.rejection_reason = None
        offer.updated_at = now

        audit = OfferAuditLog(
            offer_id=offer.id,
            action="APPROVED",
            actor_id=admin_user.id,
            actor_name=admin_user.full_name or admin_user.email,
            actor_role="ADMIN",
            from_status=old_status,
            to_status="VERIFIED",
            notes=notes or "Offer approved by authorized administrator.",
            snapshot_json=None
        )
        db.add(audit)
        await db.commit()
        await db.refresh(offer)
        return offer

    @classmethod
    async def reject_offer(
        cls,
        db: AsyncSession,
        offer_id: str,
        admin_user: Profile,
        rejection_reason: str,
        notes: Optional[str] = None
    ) -> CardOffer:
        """
        Rejects an offer with documented reason.
        """
        stmt = select(CardOffer).where(CardOffer.id == offer_id)
        offer = (await db.execute(stmt)).scalar_one_or_none()
        if not offer:
            raise ValueError("Offer not found.")

        old_status = offer.verification_status
        now = datetime.utcnow()

        offer.verification_status = "REJECTED"
        offer.rejection_reason = rejection_reason
        offer.reviewed_by_id = admin_user.id
        offer.reviewed_by_name = admin_user.full_name or admin_user.email
        offer.reviewed_at = now
        offer.updated_at = now

        audit = OfferAuditLog(
            offer_id=offer.id,
            action="REJECTED",
            actor_id=admin_user.id,
            actor_name=admin_user.full_name or admin_user.email,
            actor_role="ADMIN",
            from_status=old_status,
            to_status="REJECTED",
            notes=f"Rejection Reason: {rejection_reason}. Notes: {notes or ''}",
            snapshot_json=None
        )
        db.add(audit)
        await db.commit()
        await db.refresh(offer)
        return offer

    @classmethod
    async def edit_offer(
        cls,
        db: AsyncSession,
        offer_id: str,
        admin_user: Profile,
        req: AdminOfferEditRequest
    ) -> CardOffer:
        """
        Allows an admin to correct extracted parameters, terms, caps, variants, and optionally approve.
        """
        stmt = select(CardOffer).where(CardOffer.id == offer_id)
        offer = (await db.execute(stmt)).scalar_one_or_none()
        if not offer:
            raise ValueError("Offer not found.")

        old_status = offer.verification_status
        now = datetime.utcnow()

        if req.merchant_name is not None:
            offer.merchant_name = req.merchant_name.strip()
        if req.offer_title is not None:
            offer.offer_title = req.offer_title.strip()
        if req.category_id is not None:
            offer.category_id = req.category_id.strip()
        if req.discount_type is not None:
            offer.discount_type = req.discount_type
        if req.discount_value is not None:
            offer.discount_value = req.discount_value
        if req.min_transaction_value is not None:
            offer.min_transaction_value = req.min_transaction_value
        if req.max_discount_amount is not None:
            offer.max_discount_amount = req.max_discount_amount
        if req.eligible_bank is not None:
            offer.eligible_bank = req.eligible_bank.strip() if req.eligible_bank else None
        if req.eligible_network is not None:
            offer.eligible_network = req.eligible_network
        if req.eligible_card_names is not None:
            offer.eligible_card_names_json = json.dumps(req.eligible_card_names)
        if req.valid_from is not None:
            offer.valid_from = req.valid_from
        if req.valid_to is not None:
            offer.valid_to = req.valid_to
        if req.payment_channel is not None:
            offer.payment_channel = req.payment_channel
        if req.promo_code is not None:
            offer.promo_code = req.promo_code.strip() if req.promo_code else None
        if req.activation_requirement is not None:
            offer.activation_requirement = req.activation_requirement
        if req.terms_and_conditions is not None:
            offer.terms_and_conditions = req.terms_and_conditions
        if req.source_url is not None:
            offer.source_url = req.source_url
        if req.source_evidence is not None:
            offer.source_evidence = req.source_evidence

        offer.version += 1
        offer.reviewed_by_id = admin_user.id
        offer.reviewed_by_name = admin_user.full_name or admin_user.email
        offer.reviewed_at = now
        offer.updated_at = now

        if req.approve_immediately:
            offer.verification_status = "VERIFIED"
            offer.last_verified_timestamp = now
            offer.rejection_reason = None

        audit = OfferAuditLog(
            offer_id=offer.id,
            action="EDITED_AND_APPROVED" if req.approve_immediately else "EDITED",
            actor_id=admin_user.id,
            actor_name=admin_user.full_name or admin_user.email,
            actor_role="ADMIN",
            from_status=old_status,
            to_status=offer.verification_status,
            notes=req.notes or f"Terms revised by admin (v{offer.version}).",
            snapshot_json=None
        )
        db.add(audit)
        await db.commit()
        await db.refresh(offer)
        return offer

    @classmethod
    async def trigger_reverification(
        cls,
        db: AsyncSession,
        offer_id: str,
        admin_user: Profile,
        reason: str
    ) -> CardOffer:
        """
        Manually or automatically flags an offer as NEEDS_REVERIFICATION.
        Quarantines it from active recommendations until re-verified.
        """
        stmt = select(CardOffer).where(CardOffer.id == offer_id)
        offer = (await db.execute(stmt)).scalar_one_or_none()
        if not offer:
            raise ValueError("Offer not found.")

        old_status = offer.verification_status
        now = datetime.utcnow()

        # Preserve snapshot of the previous version
        previous_snapshot = {
            "version": offer.version,
            "offer_title": offer.offer_title,
            "discount_value": str(offer.discount_value),
            "max_discount_amount": str(offer.max_discount_amount) if offer.max_discount_amount else None,
            "min_transaction_value": str(offer.min_transaction_value),
            "valid_to": offer.valid_to.isoformat(),
            "promo_code": offer.promo_code,
            "terms": offer.terms_and_conditions,
            "source_evidence": offer.source_evidence,
            "verified_at": offer.last_verified_timestamp.isoformat() if offer.last_verified_timestamp else None
        }
        offer.previous_version_json = json.dumps(previous_snapshot)
        offer.version += 1
        offer.verification_status = "NEEDS_REVERIFICATION"
        offer.updated_at = now

        audit = OfferAuditLog(
            offer_id=offer.id,
            action="REVERIFICATION_TRIGGERED",
            actor_id=admin_user.id,
            actor_name=admin_user.full_name or admin_user.email,
            actor_role="ADMIN",
            from_status=old_status,
            to_status="NEEDS_REVERIFICATION",
            notes=reason,
            snapshot_json=offer.previous_version_json
        )
        db.add(audit)
        await db.commit()
        await db.refresh(offer)
        return offer

    @classmethod
    async def get_offer_audit_trail(
        cls,
        db: AsyncSession,
        offer_id: str
    ) -> List[OfferAuditLog]:
        stmt = (
            select(OfferAuditLog)
            .where(OfferAuditLog.offer_id == offer_id)
            .order_by(OfferAuditLog.timestamp.desc())
        )
        return (await db.execute(stmt)).scalars().all()
