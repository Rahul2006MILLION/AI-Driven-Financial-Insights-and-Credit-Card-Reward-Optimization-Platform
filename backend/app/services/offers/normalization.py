import hashlib
import json
import re
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, field

VALID_CATEGORIES = {
    "dining", "food_delivery", "grocery", "shopping", "travel",
    "utility", "fuel", "entertainment", "health", "international", "other"
}

VALID_NETWORKS = {"VISA", "MASTERCARD", "RUPAY", "AMEX", "DINERS"}
VALID_CHANNELS = {"ONLINE", "OFFLINE", "BOTH"}
VALID_DISCOUNT_TYPES = {"PERCENTAGE", "FLAT_AMOUNT"}
VALID_INGESTION_CHANNELS = {
    "HTML_EXTRACTION", "PDF_CIRCULAR", "AUTHORIZED_API", "ADMIN_DOCUMENT", "MANUAL_ENTRY"
}

@dataclass
class CanonicalOfferPayload:
    merchant_name: str
    offer_title: str
    category_id: str
    discount_type: str
    discount_value: Decimal
    min_transaction_value: Decimal
    max_discount_amount: Optional[Decimal]
    eligible_bank: Optional[str]
    eligible_network: Optional[str]
    eligible_card_names: List[str]
    valid_from: datetime
    valid_to: datetime
    payment_channel: str
    promo_code: Optional[str]
    activation_requirement: Optional[str]
    terms_and_conditions: Optional[str]
    source_url: str
    source_name: str
    source_evidence: str
    extraction_confidence: Decimal
    ingestion_channel: str = "MANUAL_ENTRY"
    source_id: Optional[str] = None
    source_document_id: Optional[str] = None
    raw_text: Optional[str] = None
    validation_warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "merchant_name": self.merchant_name,
            "offer_title": self.offer_title,
            "category_id": self.category_id,
            "discount_type": self.discount_type,
            "discount_value": str(self.discount_value),
            "min_transaction_value": str(self.min_transaction_value),
            "max_discount_amount": str(self.max_discount_amount) if self.max_discount_amount is not None else None,
            "eligible_bank": self.eligible_bank,
            "eligible_network": self.eligible_network,
            "eligible_card_names": self.eligible_card_names,
            "valid_from": self.valid_from.isoformat(),
            "valid_to": self.valid_to.isoformat(),
            "payment_channel": self.payment_channel,
            "promo_code": self.promo_code,
            "activation_requirement": self.activation_requirement,
            "terms_and_conditions": self.terms_and_conditions,
            "source_url": self.source_url,
            "source_name": self.source_name,
            "source_evidence": self.source_evidence,
            "extraction_confidence": str(self.extraction_confidence),
            "ingestion_channel": self.ingestion_channel,
            "source_id": self.source_id,
            "source_document_id": self.source_document_id
        }

class OfferNormalizer:
    @staticmethod
    def normalize_monetary_value(val: Any, default: Decimal = Decimal("0.00")) -> Decimal:
        """Safely parses any numeric/string into a rounded 2-decimal Decimal."""
        if val is None or val == "":
            return default
        try:
            if isinstance(val, (int, float)):
                d = Decimal(str(val))
            elif isinstance(val, Decimal):
                d = val
            else:
                # Remove currency symbols and non-numeric chars except '.'
                cleaned = re.sub(r"[^\d.]", "", str(val).strip())
                if not cleaned:
                    return default
                d = Decimal(cleaned)
            return d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError):
            return default

    @staticmethod
    def normalize_category(cat: Optional[str]) -> str:
        """Maps freeform category text to canonical CLIQ category ID."""
        if not cat:
            return "shopping"
        clean = cat.lower().strip()
        if clean in VALID_CATEGORIES:
            return clean
        if any(w in clean for w in ["food", "dining", "restaurant", "swiggy", "zomato"]):
            if "delivery" in clean or "swiggy" in clean or "zomato" in clean:
                return "food_delivery"
            return "dining"
        if any(w in clean for w in ["grocery", "supermarket", "blinkit", "zepto", "instamart"]):
            return "grocery"
        if any(w in clean for w in ["flight", "hotel", "travel", "holiday", "makemytrip", "easemytrip"]):
            return "travel"
        if any(w in clean for w in ["movie", "cinema", "entertainment", "bookmyshow"]):
            return "entertainment"
        if any(w in clean for w in ["fuel", "petrol", "diesel", "hpcl", "bpcl", "ioc"]):
            return "fuel"
        if any(w in clean for w in ["bill", "utility", "electricity", "water", "recharge"]):
            return "utility"
        if any(w in clean for w in ["health", "pharmacy", "medical", "1mg", "apollo"]):
            return "health"
        if any(w in clean for w in ["international", "forex", "cross-border"]):
            return "international"
        return "shopping"

    @staticmethod
    def normalize_network(net: Optional[str]) -> Optional[str]:
        if not net:
            return None
        upper = net.strip().upper()
        if "RUPAY" in upper:
            return "RUPAY"
        if "VISA" in upper:
            return "VISA"
        if "MASTER" in upper:
            return "MASTERCARD"
        if "AMEX" in upper or "AMERICAN EXPRESS" in upper:
            return "AMEX"
        if "DINERS" in upper:
            return "DINERS"
        return None

    @staticmethod
    def normalize_discount_type(dtype: Optional[str]) -> str:
        if not dtype:
            return "PERCENTAGE"
        upper = dtype.strip().upper()
        if "FLAT" in upper or "CASH" in upper or "FIXED" in upper or "AMOUNT" in upper or "INR" in upper or "RS" in upper:
            return "FLAT_AMOUNT"
        return "PERCENTAGE"

    @staticmethod
    def compute_canonical_hash(payload: CanonicalOfferPayload) -> str:
        """
        Creates a deterministic SHA-256 fingerprint of canonical terms
        for deduplication and change tracking.
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

    @staticmethod
    def compute_confidence_score(payload: CanonicalOfferPayload) -> Decimal:
        """
        Calculates extraction confidence based on completeness and verbatim evidence presence.
        Penalizes missing merchant, zero discounts, missing evidence, or vague terms.
        """
        score = Decimal("0.60")

        # Factual core terms present
        if payload.merchant_name and len(payload.merchant_name) >= 2:
            score += Decimal("0.08")
        if payload.discount_value > Decimal("0.00"):
            score += Decimal("0.08")
        else:
            score -= Decimal("0.15")  # Missing or zero discount penalty

        if payload.min_transaction_value > Decimal("0.00"):
            score += Decimal("0.04")

        # Verbatim evidence backing
        has_placeholder_evidence = any("Missing verbatim" in w for w in payload.validation_warnings)
        if payload.source_evidence and len(payload.source_evidence.strip()) >= 20 and not has_placeholder_evidence:
            score += Decimal("0.10")
        elif payload.source_evidence and not has_placeholder_evidence:
            score += Decimal("0.04")
        else:
            score -= Decimal("0.10")  # Missing verbatim evidence penalty

        # Specificity
        if payload.promo_code and len(payload.promo_code.strip()) >= 3:
            score += Decimal("0.04")
        if payload.eligible_bank:
            score += Decimal("0.03")
        if payload.eligible_card_names and len(payload.eligible_card_names) > 0:
            score += Decimal("0.03")

        return min(score, Decimal("0.98"))

    @staticmethod
    def compute_freshness_state(offer: Any, now: Optional[datetime] = None) -> str:
        """
        Evaluates source and offer freshness without claiming stale database records are fresh.
        Returns: FRESH, EXPIRING_SOON, STALE, EXPIRED, QUARANTINED, UNAVAILABLE
        """
        if not now:
            now = datetime.utcnow()

        # Quarantined & Unavailable take precedence
        if getattr(offer, "verification_status", None) == "NEEDS_REVERIFICATION":
            return "QUARANTINED"
        if getattr(offer, "verification_status", None) == "SOURCE_UNAVAILABLE":
            return "UNAVAILABLE"

        valid_to = getattr(offer, "valid_to", None)
        if valid_to and valid_to < now:
            return "EXPIRED"

        # Check if expiring within 7 days
        if valid_to and valid_to <= (now + timedelta(days=7)):
            return "EXPIRING_SOON"

        # Check verification recency: if not verified within 7 days, it is STALE
        last_ver = getattr(offer, "last_verified_timestamp", None)
        if last_ver and (now - last_ver).total_seconds() > (86400 * 7):
            return "STALE"

        return "FRESH"

    @classmethod
    def validate_and_normalize(
        cls,
        raw_data: Dict[str, Any],
        ingestion_channel: str = "MANUAL_ENTRY",
        source_id: Optional[str] = None,
        source_name: Optional[str] = None,
        source_url: Optional[str] = None,
        source_document_id: Optional[str] = None
    ) -> CanonicalOfferPayload:
        """
        Converts any incoming raw dictionary (HTML, PDF, Partner JSON, Admin Form)
        into a strictly normalized CanonicalOfferPayload.
        Validates constraints and never invents missing information.
        """
        warnings: List[str] = []

        # Merchant
        raw_merch = str(raw_data.get("merchant_name") or "").strip()
        if not raw_merch:
            raw_merch = "General Merchant"
            warnings.append("Missing merchant name; default assigned for review.")

        # Title
        raw_title = str(raw_data.get("offer_title") or "").strip()
        if not raw_title:
            raw_title = f"{raw_merch} Promotional Offer"

        # Category
        cat_id = cls.normalize_category(raw_data.get("category_id"))

        # Discount type & value
        disc_type = cls.normalize_discount_type(raw_data.get("discount_type"))
        disc_val = cls.normalize_monetary_value(raw_data.get("discount_value"))
        if disc_val < Decimal("0.00"):
            warnings.append("Discount value was negative; reset to 0.00")
            disc_val = Decimal("0.00")

        # Min transaction & Max discount
        min_spend = cls.normalize_monetary_value(raw_data.get("min_transaction_value"))
        max_disc_raw = raw_data.get("max_discount_amount")
        max_disc = cls.normalize_monetary_value(max_disc_raw) if (max_disc_raw is not None and str(max_disc_raw).strip() != "") else None

        # Bank & Network
        eligible_bank = str(raw_data.get("eligible_bank")).strip() if raw_data.get("eligible_bank") else None
        eligible_network = cls.normalize_network(raw_data.get("eligible_network"))

        # Card Variants
        raw_cards = raw_data.get("eligible_card_names") or []
        if isinstance(raw_cards, str):
            try:
                eligible_cards = json.loads(raw_cards)
            except Exception:
                eligible_cards = [c.strip() for c in raw_cards.split(",") if c.strip()]
        elif isinstance(raw_cards, list):
            eligible_cards = [str(c).strip() for c in raw_cards if str(c).strip()]
        else:
            eligible_cards = []

        # Validity Dates
        now = datetime.utcnow()
        valid_from = raw_data.get("valid_from")
        if isinstance(valid_from, str):
            try:
                valid_from = datetime.fromisoformat(valid_from.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                valid_from = now
        elif not isinstance(valid_from, datetime):
            valid_from = now

        valid_to = raw_data.get("valid_to")
        if isinstance(valid_to, str):
            try:
                valid_to = datetime.fromisoformat(valid_to.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                valid_to = now + timedelta(days=60)
        elif not isinstance(valid_to, datetime):
            valid_to = now + timedelta(days=60)

        # Payment Channel
        channel_in = str(raw_data.get("payment_channel") or "ONLINE").strip().upper()
        payment_channel = channel_in if channel_in in VALID_CHANNELS else "ONLINE"

        # Promo Code
        promo_raw = raw_data.get("promo_code")
        promo_code = str(promo_raw).strip().upper() if promo_raw and str(promo_raw).strip() else None

        # Source URL & Evidence
        url = str(source_url or raw_data.get("source_url") or "").strip()
        s_name = str(source_name or raw_data.get("source_name") or "Official Partner Ingestion").strip()
        evidence = str(raw_data.get("source_evidence") or "").strip()
        if not evidence:
            evidence = f"Extracted via {ingestion_channel} channel. Evidence pending reviewer verification."
            warnings.append("Missing verbatim source evidence snippet.")

        # Construct Canonical Payload
        payload = CanonicalOfferPayload(
            merchant_name=raw_merch,
            offer_title=raw_title,
            category_id=cat_id,
            discount_type=disc_type,
            discount_value=disc_val,
            min_transaction_value=min_spend,
            max_discount_amount=max_disc,
            eligible_bank=eligible_bank,
            eligible_network=eligible_network,
            eligible_card_names=eligible_cards,
            valid_from=valid_from,
            valid_to=valid_to,
            payment_channel=payment_channel,
            promo_code=promo_code,
            activation_requirement=raw_data.get("activation_requirement"),
            terms_and_conditions=raw_data.get("terms_and_conditions"),
            source_url=url,
            source_name=s_name,
            source_evidence=evidence,
            extraction_confidence=Decimal("0.85"),
            ingestion_channel=ingestion_channel,
            source_id=source_id,
            source_document_id=source_document_id,
            raw_text=raw_data.get("raw_text"),
            validation_warnings=warnings
        )

        # Compute dynamic confidence score
        payload.extraction_confidence = cls.compute_confidence_score(payload)
        return payload
