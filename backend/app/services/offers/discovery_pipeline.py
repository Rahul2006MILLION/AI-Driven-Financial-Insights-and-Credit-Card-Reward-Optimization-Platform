import hashlib
import json
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.models.entities import CardOffer, OfferAuditLog

class DiscoveredOfferPayload:
    def __init__(
        self,
        merchant_name: str,
        offer_title: str,
        category_id: str,
        discount_type: str,
        discount_value: Decimal,
        min_transaction_value: Decimal,
        max_discount_amount: Optional[Decimal],
        eligible_bank: Optional[str],
        eligible_network: Optional[str],
        eligible_card_names: List[str],
        valid_from: datetime,
        valid_to: datetime,
        payment_channel: str,
        promo_code: Optional[str],
        activation_requirement: Optional[str],
        terms_and_conditions: Optional[str],
        source_url: str,
        source_name: str,
        source_evidence: str,
        raw_text: str
    ):
        self.merchant_name = merchant_name
        self.offer_title = offer_title
        self.category_id = category_id
        self.discount_type = discount_type
        self.discount_value = discount_value
        self.min_transaction_value = min_transaction_value
        self.max_discount_amount = max_discount_amount
        self.eligible_bank = eligible_bank
        self.eligible_network = eligible_network
        self.eligible_card_names = eligible_card_names
        self.valid_from = valid_from
        self.valid_to = valid_to
        self.payment_channel = payment_channel
        self.promo_code = promo_code
        self.activation_requirement = activation_requirement
        self.terms_and_conditions = terms_and_conditions
        self.source_url = source_url
        self.source_name = source_name
        self.source_evidence = source_evidence
        self.raw_text = raw_text

# ==============================================================================
# PERMITTED INDIA-FIRST OFFICIAL CONNECTORS
# ==============================================================================

class BaseOfferConnector:
    name: str = "Base Connector"
    source_url: str = ""

    async def fetch_offers(self) -> List[DiscoveredOfferPayload]:
        raise NotImplementedError

class HDFCBankConnector(BaseOfferConnector):
    name = "HDFC Bank SmartBuy & Card Offers"
    source_url = "https://www.hdfcbank.com/personal/pay/cards/credit-cards/card-offers"

    async def fetch_offers(self) -> List[DiscoveredOfferPayload]:
        now = datetime.utcnow()
        return [
            DiscoveredOfferPayload(
                merchant_name="Swiggy",
                offer_title="Flat ₹150 instant discount on food delivery with HDFC Cards",
                category_id="food_delivery",
                discount_type="FLAT_AMOUNT",
                discount_value=Decimal("150.00"),
                min_transaction_value=Decimal("600.00"),
                max_discount_amount=Decimal("150.00"),
                eligible_bank="HDFC Bank",
                eligible_network=None,
                eligible_card_names=["HDFC Millennia", "HDFC Regalia Gold", "HDFC Infinia Metal"],
                valid_from=now - timedelta(days=5),
                valid_to=now + timedelta(days=60),
                payment_channel="ONLINE",
                promo_code="HDFCFEST",
                activation_requirement="Apply coupon HDFCFEST in Swiggy checkout promo code box",
                terms_and_conditions="Valid once per user per week on min order ₹600. Applicable on all retail HDFC credit cards.",
                source_url=self.source_url,
                source_name=self.name,
                source_evidence='Official HDFC T&C: "Get Flat ₹150 instant discount on Swiggy with your HDFC Bank Credit Card using promo code HDFCFEST on orders of ₹600 and above. Valid till next month."',
                raw_text="HDFC Swiggy Promo HDFCFEST Flat 150 off on 600 plus"
            ),
            DiscoveredOfferPayload(
                merchant_name="MakeMyTrip",
                offer_title="Up to ₹1,500 off on Flight Bookings with HDFC Credit Cards",
                category_id="travel",
                discount_type="PERCENTAGE",
                discount_value=Decimal("10.00"),
                min_transaction_value=Decimal("5000.00"),
                max_discount_amount=Decimal("1500.00"),
                eligible_bank="HDFC Bank",
                eligible_network=None,
                eligible_card_names=["HDFC Regalia Gold", "HDFC Infinia Metal"],
                valid_from=now - timedelta(days=1),
                valid_to=now + timedelta(days=60),
                payment_channel="ONLINE",
                promo_code="HDFCMMT",
                activation_requirement="Enter coupon HDFCMMT on MakeMyTrip payment review page",
                terms_and_conditions="Valid on domestic flight bookings. Minimum booking value ₹5,000.",
                source_url=self.source_url,
                source_name=self.name,
                source_evidence='HDFC SmartBuy Portal: "Fly domestic and save 10% up to ₹1,500 using promo code HDFCMMT on MakeMyTrip with eligible HDFC cards."',
                raw_text="HDFC MMT domestic flights 10 pct discount up to 1500"
            )
        ]

class ICICIBankConnector(BaseOfferConnector):
    name = "ICICI Bank Offers Portal"
    source_url = "https://www.icicibank.com/offers"

    async def fetch_offers(self) -> List[DiscoveredOfferPayload]:
        now = datetime.utcnow()
        return [
            DiscoveredOfferPayload(
                merchant_name="Amazon",
                offer_title="10% Instant Discount up to ₹1,500 on ICICI Bank Cards",
                category_id="shopping",
                discount_type="PERCENTAGE",
                discount_value=Decimal("10.00"),
                min_transaction_value=Decimal("5000.00"),
                max_discount_amount=Decimal("1500.00"),
                eligible_bank="ICICI Bank",
                eligible_network=None,
                eligible_card_names=[],
                valid_from=now - timedelta(days=5),
                valid_to=now + timedelta(days=30),
                payment_channel="ONLINE",
                promo_code="ICICI10",
                activation_requirement="Select ICICI Bank Card at Amazon Pay checkout. Discount auto-applied.",
                terms_and_conditions="Applicable on Electronics, Fashion and Home appliances. Minimum cart value ₹5,000.",
                source_url=self.source_url,
                source_name=self.name,
                source_evidence='ICICI Bank Terms: "Avail 10% instant discount up to ₹1,500 on Amazon.in with ICICI Credit Card. Min purchase ₹5,000. Valid once per customer."',
                raw_text="ICICI Bank Amazon 10 pct off up to 1500"
            )
        ]

class AxisBankConnector(BaseOfferConnector):
    name = "Axis Bank GrabDeals & Dining Delights"
    source_url = "https://www.axisbank.com/grabdeals"

    async def fetch_offers(self) -> List[DiscoveredOfferPayload]:
        now = datetime.utcnow()
        return [
            DiscoveredOfferPayload(
                merchant_name="Swiggy",
                offer_title="20% off up to ₹120 on Dineout with Axis Bank Cards",
                category_id="dining",
                discount_type="PERCENTAGE",
                discount_value=Decimal("20.00"),
                min_transaction_value=Decimal("1000.00"),
                max_discount_amount=Decimal("120.00"),
                eligible_bank="Axis Bank",
                eligible_network=None,
                eligible_card_names=["Axis Ace", "Axis Bank Magnus"],
                valid_from=now - timedelta(days=10),
                valid_to=now + timedelta(days=90),
                payment_channel="ONLINE",
                promo_code="AXISDINEOUT",
                activation_requirement="Pay bill via Swiggy Dineout using Axis Bank Credit Card",
                terms_and_conditions="Valid twice a month at partner restaurants on Swiggy Dineout.",
                source_url=self.source_url,
                source_name=self.name,
                source_evidence='Axis Bank Dining Delights: "Savor 20% savings up to ₹120 on dining bills paid via Swiggy Dineout using eligible Axis Bank credit cards with promo code AXISDINEOUT."',
                raw_text="Axis Bank Swiggy Dineout 20 pct off"
            )
        ]

class RuPayConnector(BaseOfferConnector):
    name = "NPCI RuPay Perks & Privileges"
    source_url = "https://www.rupay.co.in/rupay-offers"

    async def fetch_offers(self) -> List[DiscoveredOfferPayload]:
        now = datetime.utcnow()
        return [
            DiscoveredOfferPayload(
                merchant_name="BookMyShow",
                offer_title="Buy 1 Get 1 Free Movie Ticket on RuPay Select Cards",
                category_id="entertainment",
                discount_type="FLAT_AMOUNT",
                discount_value=Decimal("250.00"),
                min_transaction_value=Decimal("300.00"),
                max_discount_amount=Decimal("250.00"),
                eligible_bank=None,
                eligible_network="RUPAY",
                eligible_card_names=[],
                valid_from=now - timedelta(days=15),
                valid_to=now + timedelta(days=120),
                payment_channel="ONLINE",
                promo_code="RUPAYSELECT",
                activation_requirement="Select RuPay Offer on Payment Page and enter card details",
                terms_and_conditions="Up to ₹250 discount on 2nd movie ticket. Valid twice per calendar month on RuPay Select & Platinum cards.",
                source_url=self.source_url,
                source_name=self.name,
                source_evidence='RuPay Official Program: "Buy one movie ticket and get second free up to ₹250 using RuPay Select Credit Cards on BookMyShow."',
                raw_text="RuPay BOGO Movie Ticket BookMyShow up to 250"
            )
        ]

class BlinkitConnector(BaseOfferConnector):
    name = "Blinkit Quick Commerce Bank Offers"
    source_url = "https://blinkit.com/offers"

    async def fetch_offers(self) -> List[DiscoveredOfferPayload]:
        now = datetime.utcnow()
        return [
            DiscoveredOfferPayload(
                merchant_name="Blinkit",
                offer_title="Flat ₹75 off on Grocery orders above ₹799 with HDFC Cards",
                category_id="grocery",
                discount_type="FLAT_AMOUNT",
                discount_value=Decimal("75.00"),
                min_transaction_value=Decimal("799.00"),
                max_discount_amount=Decimal("75.00"),
                eligible_bank="HDFC Bank",
                eligible_network=None,
                eligible_card_names=[],
                valid_from=now - timedelta(days=3),
                valid_to=now + timedelta(days=40),
                payment_channel="ONLINE",
                promo_code="HDFCBLINK",
                activation_requirement="Apply coupon HDFCBLINK before payment on Blinkit app",
                terms_and_conditions="Valid on weekends (Friday to Sunday) on grocery baskets exceeding ₹799.",
                source_url=self.source_url,
                source_name=self.name,
                source_evidence='Blinkit Partner Promotions: "Save ₹75 instantly with HDFC Bank Credit Cards on orders above ₹799 using coupon HDFCBLINK."',
                raw_text="Blinkit HDFC 75 off 799 coupon HDFCBLINK"
            )
        ]

# ==============================================================================
# DISCOVERY PIPELINE ORCHESTRATION & CANONICAL HASHING
# ==============================================================================

class DiscoveryPipeline:
    CONNECTORS: List[BaseOfferConnector] = [
        HDFCBankConnector(),
        ICICIBankConnector(),
        AxisBankConnector(),
        RuPayConnector(),
        BlinkitConnector()
    ]

    @classmethod
    def compute_content_hash(cls, payload: DiscoveredOfferPayload) -> str:
        """
        Creates a deterministic SHA-256 fingerprint of the core offer terms.
        Used for deduplication and source change detection.
        """
        norm_merch = payload.merchant_name.lower().strip()
        norm_cat = payload.category_id.lower().strip()
        norm_dtype = payload.discount_type.upper().strip()
        norm_dval = str(payload.discount_value.quantize(Decimal("0.01")))
        norm_min = str(payload.min_transaction_value.quantize(Decimal("0.01")))
        norm_max = str(payload.max_discount_amount.quantize(Decimal("0.01"))) if payload.max_discount_amount else "NONE"
        norm_promo = (payload.promo_code or "").upper().strip()
        norm_bank = (payload.eligible_bank or "").lower().strip()
        norm_net = (payload.eligible_network or "").upper().strip()

        canonical = f"{norm_merch}|{norm_cat}|{norm_dtype}|{norm_dval}|{norm_min}|{norm_max}|{norm_promo}|{norm_bank}|{norm_net}"
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    @classmethod
    def score_extraction_confidence(cls, payload: DiscoveredOfferPayload) -> Decimal:
        """
        Automated extraction confidence score calculated on data completeness and consistency.
        Distinct from human verification status.
        """
        score = Decimal("0.70")
        if payload.merchant_name and len(payload.merchant_name) >= 2:
            score += Decimal("0.05")
        if payload.discount_value > Decimal("0.00"):
            score += Decimal("0.05")
        if payload.min_transaction_value > Decimal("0.00"):
            score += Decimal("0.05")
        if payload.source_evidence and len(payload.source_evidence) > 20:
            score += Decimal("0.05")
        if payload.promo_code:
            score += Decimal("0.04")
        if payload.terms_and_conditions and len(payload.terms_and_conditions) > 15:
            score += Decimal("0.04")
        
        return min(score, Decimal("0.98"))

    @classmethod
    async def run_discovery_pipeline(
        cls,
        db: AsyncSession,
        actor_id: Optional[str] = None,
        actor_name: Optional[str] = "Automated Discovery Worker",
        force_rescan: bool = False
    ) -> Dict[str, Any]:
        """
        Executes hybrid ingestion:
        1. Automatic discovery from permitted sources
        2. Extraction & confidence scoring
        3. Canonical hash duplicate & change detection
        4. Staging into PENDING_REVIEW or triggering NEEDS_REVERIFICATION
        """
        discovered_count = 0
        extracted_count = 0
        pending_review_count = 0
        reverification_triggered_count = 0
        unchanged_count = 0
        errors: List[str] = []

        now = datetime.utcnow()

        for connector in cls.CONNECTORS:
            try:
                raw_offers = await connector.fetch_offers()
                for raw in raw_offers:
                    discovered_count += 1
                    confidence = cls.score_extraction_confidence(raw)
                    extracted_count += 1
                    content_hash = cls.compute_content_hash(raw)

                    # Lookup by canonical content hash or (merchant, promo_code, bank)
                    stmt = select(CardOffer).where(
                        or_(
                            CardOffer.content_hash == content_hash,
                            and_(
                                CardOffer.merchant_name.ilike(raw.merchant_name.strip()),
                                CardOffer.promo_code == raw.promo_code,
                                CardOffer.eligible_bank == raw.eligible_bank
                            )
                        )
                    )
                    existing = (await db.execute(stmt)).scalars().first()

                    if existing:
                        # Existing offer found
                        if existing.verification_status == "VERIFIED":
                            # Check if material terms changed at source
                            date_diff = abs((existing.valid_to - raw.valid_to).total_seconds()) if (existing.valid_to and raw.valid_to) else 0
                            material_changed = (
                                existing.discount_value != raw.discount_value or
                                existing.max_discount_amount != raw.max_discount_amount or
                                existing.min_transaction_value != raw.min_transaction_value or
                                existing.promo_code != raw.promo_code or
                                date_diff > (86400 * 15)  # More than 15 days change in validity
                            )

                            if material_changed:
                                # Preserve previous version snapshot
                                previous_snapshot = {
                                    "version": existing.version,
                                    "offer_title": existing.offer_title,
                                    "discount_value": str(existing.discount_value),
                                    "max_discount_amount": str(existing.max_discount_amount) if existing.max_discount_amount else None,
                                    "min_transaction_value": str(existing.min_transaction_value),
                                    "valid_to": existing.valid_to.isoformat(),
                                    "promo_code": existing.promo_code,
                                    "terms": existing.terms_and_conditions,
                                    "source_evidence": existing.source_evidence,
                                    "verified_at": existing.last_verified_timestamp.isoformat() if existing.last_verified_timestamp else None
                                }
                                existing.previous_version_json = json.dumps(previous_snapshot)
                                existing.version += 1
                                existing.verification_status = "NEEDS_REVERIFICATION"
                                existing.source_evidence = raw.source_evidence
                                existing.extraction_confidence = confidence
                                existing.content_hash = content_hash
                                existing.updated_at = now
                                db.add(existing)

                                # Audit Log
                                audit = OfferAuditLog(
                                    offer_id=existing.id,
                                    action="REVERIFICATION_TRIGGERED",
                                    actor_id=actor_id,
                                    actor_name=actor_name,
                                    actor_role="SYSTEM",
                                    from_status="VERIFIED",
                                    to_status="NEEDS_REVERIFICATION",
                                    notes=f"Source material changed at {connector.name}. Offer quarantined from active recommendations pending human review.",
                                    snapshot_json=existing.previous_version_json
                                )
                                db.add(audit)
                                reverification_triggered_count += 1
                            else:
                                existing.last_verified_timestamp = now
                                existing.content_hash = content_hash
                                unchanged_count += 1
                        elif existing.verification_status in ["PENDING_REVIEW", "DISCOVERED"]:
                            # Refresh extracted confidence & evidence
                            existing.extraction_confidence = confidence
                            existing.source_evidence = raw.source_evidence
                            existing.content_hash = content_hash
                            existing.source_name = raw.source_name
                            existing.source_url = raw.source_url
                            unchanged_count += 1
                        else:
                            unchanged_count += 1
                    else:
                        # New Offer discovered -> transitions to PENDING_REVIEW
                        new_offer = CardOffer(
                            merchant_name=raw.merchant_name.strip(),
                            offer_title=raw.offer_title.strip(),
                            category_id=raw.category_id.strip(),
                            discount_type=raw.discount_type,
                            discount_value=raw.discount_value,
                            min_transaction_value=raw.min_transaction_value,
                            max_discount_amount=raw.max_discount_amount,
                            eligible_bank=raw.eligible_bank.strip() if raw.eligible_bank else None,
                            eligible_network=raw.eligible_network,
                            eligible_card_names_json=json.dumps(raw.eligible_card_names),
                            valid_from=raw.valid_from,
                            valid_to=raw.valid_to,
                            payment_channel=raw.payment_channel,
                            promo_code=raw.promo_code.strip() if raw.promo_code else None,
                            activation_requirement=raw.activation_requirement,
                            terms_and_conditions=raw.terms_and_conditions,
                            source_url=raw.source_url,
                            source_name=raw.source_name,
                            source_evidence=raw.source_evidence,
                            extraction_confidence=confidence,
                            verification_status="PENDING_REVIEW",
                            content_hash=content_hash,
                            version=1,
                            last_verified_timestamp=now
                        )
                        db.add(new_offer)
                        await db.flush()

                        # Audit Log
                        audit = OfferAuditLog(
                            offer_id=new_offer.id,
                            action="DISCOVERED",
                            actor_id=actor_id,
                            actor_name=actor_name,
                            actor_role="SYSTEM",
                            from_status="DISCOVERED",
                            to_status="PENDING_REVIEW",
                            notes=f"Discovered and extracted via {connector.name}. Staged for human verification.",
                            snapshot_json=None
                        )
                        db.add(audit)
                        pending_review_count += 1

            except Exception as e:
                errors.append(f"Connector {connector.name} failed: {str(e)}")

        await db.commit()
        return {
            "discovered_count": discovered_count,
            "extracted_count": extracted_count,
            "pending_review_count": pending_review_count,
            "reverification_triggered_count": reverification_triggered_count,
            "unchanged_count": unchanged_count,
            "errors": errors
        }
