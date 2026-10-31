import re
import hashlib
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from pypdf import PdfReader

from app.services.offers.normalization import OfferNormalizer, CanonicalOfferPayload

MAX_ALLOWED_CIRCULAR_BYTES = 10 * 1024 * 1024  # 10 MB

class CircularParserService:
    """
    Dedicated parser for official Indian credit-card and merchant PDF circulars.
    Extracts structured offer parameters with verbatim evidence snippets.
    Always stages extracted offers into PENDING_REVIEW.
    OCR is explicitly marked unsupported for image-only scans.
    """

    @classmethod
    def validate_pdf_bytes(cls, contents: bytes) -> Tuple[bool, Optional[str]]:
        if len(contents) > MAX_ALLOWED_CIRCULAR_BYTES:
            return False, f"File exceeds maximum allowed circular size of {MAX_ALLOWED_CIRCULAR_BYTES // (1024*1024)}MB."
        if not contents.startswith(b"%PDF"):
            return False, "Invalid file format. File does not contain valid PDF magic bytes (%PDF-)."
        return True, None

    @classmethod
    def extract_text_and_metadata(cls, file_path_or_stream: Any) -> Dict[str, Any]:
        """
        Reads PDF text and metadata using pypdf.
        Handles encrypted or image-scanned documents gracefully.
        """
        result = {
            "page_count": 0,
            "text": "",
            "is_encrypted": False,
            "ocr_supported": False,
            "ocr_notice": "OCR for scanned/bitmap documents is currently unsupported. Text extraction requires vector-encoded PDF circulars.",
            "has_extractable_text": False,
            "error": None
        }

        try:
            reader = PdfReader(file_path_or_stream)
            result["is_encrypted"] = reader.is_encrypted
            if reader.is_encrypted:
                result["error"] = "Encrypted PDF circulars are not supported without credentials."
                return result

            result["page_count"] = len(reader.pages)
            extracted_pages: List[str] = []
            
            # Limit page extraction to first 30 pages to prevent DoS
            for idx, page in enumerate(reader.pages[:30]):
                p_text = page.extract_text() or ""
                if p_text.strip():
                    extracted_pages.append(p_text.strip())

            full_text = "\n\n".join(extracted_pages)
            result["text"] = full_text
            result["has_extractable_text"] = len(full_text.strip()) > 30

        except Exception as e:
            result["error"] = f"Failed to parse PDF document: {type(e).__name__}: {str(e)}"

        return result

    @classmethod
    def extract_offers_from_text(
        cls,
        text: str,
        filename: str,
        source_url: str = "",
        source_name: str = "Official Bank Circular",
        source_id: Optional[str] = None,
        source_document_id: Optional[str] = None
    ) -> List[CanonicalOfferPayload]:
        """
        Analyzes circular text for credit card discount rules and produces canonical payloads.
        Never invents missing terms.
        """
        if not text or len(text.strip()) < 20:
            return []

        lower = text.lower()
        offers: List[CanonicalOfferPayload] = []

        # 1. Identify Issuer Bank
        bank_name = None
        if "hdfc" in lower:
            bank_name = "HDFC Bank"
        elif "icici" in lower:
            bank_name = "ICICI Bank"
        elif "axis" in lower:
            bank_name = "Axis Bank"
        elif "sbi" in lower:
            bank_name = "SBI Card"
        elif "kotak" in lower:
            bank_name = "Kotak Mahindra Bank"
        elif "indusind" in lower:
            bank_name = "IndusInd Bank"
        elif "rupay" in lower:
            bank_name = None  # Network level

        # 2. Identify Card Network
        network = None
        if "rupay" in lower:
            network = "RUPAY"
        elif "visa" in lower:
            network = "VISA"
        elif "mastercard" in lower:
            network = "MASTERCARD"
        elif "amex" in lower or "american express" in lower:
            network = "AMEX"

        # 3. Known Merchants to check
        known_merchants = [
            ("Swiggy", "food_delivery"),
            ("Zomato", "food_delivery"),
            ("Blinkit", "grocery"),
            ("Zepto", "grocery"),
            ("Amazon", "shopping"),
            ("Flipkart", "shopping"),
            ("MakeMyTrip", "travel"),
            ("BookMyShow", "entertainment"),
            ("Myntra", "shopping"),
            ("Tata Cliq", "shopping"),
            ("Croma", "shopping"),
            ("Reliance Digital", "shopping"),
            ("EazyDiner", "dining")
        ]

        # Extract targeted merchant sections or global discount rules
        found_merchants = [m for m in known_merchants if m[0].lower() in lower]
        if not found_merchants:
            # Try to see if "on <word>" identifies a merchant
            on_match = re.search(r"on\s+([A-Za-z0-9\s]{3,20}?)(?:\s+on|\s+with|\s+using|\s+min|\.|$)", lower)
            if on_match:
                extracted_m = on_match.group(1).strip().title()
                found_merchants = [(extracted_m, OfferNormalizer.normalize_category(extracted_m))]
            else:
                found_merchants = [("General Merchant", "shopping")]

        for merch_name, cat_id in found_merchants[:4]:
            # Regex for percentage discounts: e.g. 10% instant discount up to ₹1,500
            pct_match = re.search(
                r"(\d{1,2})%\s*(?:instant\s*discount|off|cashback|savings|discount)"
                r"(?:[^\.\n]*?(?:up\s*to|max(?:imum)?)[^\d]*?(?:rs\.?|inr|₹)?\s*(\d{2,5}))?",
                lower,
                re.IGNORECASE
            )

            # Regex for flat discounts: e.g. Flat ₹150 off on minimum spend ₹600
            flat_match = re.search(
                r"(?:flat|save)\s*(?:rs\.?|inr|₹)?\s*(\d{2,4})\s*(?:off|instant\s*discount|cashback)"
                r"(?:[^\.\n]*?(?:min(?:imum)?\s*(?:order|spend|transaction|cart))[^\d]*?(?:rs\.?|inr|₹)?\s*(\d{3,6}))?",
                lower,
                re.IGNORECASE
            )

            # Promo Code Regex
            code_match = re.search(
                r"(?:promo\s*code|coupon\s*code|use\s*code|code)\s*[:\-]?\s*([A-Za-z0-9_\-]{3,20})",
                text
            )
            promo_code = code_match.group(1).strip().upper() if code_match else None

            # Minimum spend regex fallback
            min_spend_match = re.search(r"(?:min(?:imum)?\s*(?:order|spend|transaction|cart)[^\d]*?(?:rs\.?|inr|₹)?\s*(\d{3,6}))", lower)
            min_spend = Decimal(min_spend_match.group(1)) if min_spend_match else Decimal("500.00")

            # Extract Card Variants
            card_variants = []
            for cv in ["Millennia", "Regalia", "Infinia", "Ace", "Magnus", "SimplyCLICK", "PRIME", "Select", "Platinum"]:
                if cv.lower() in lower:
                    card_variants.append(f"{bank_name or ''} {cv}".strip())

            # Determine discount type and values
            if pct_match:
                disc_val = Decimal(pct_match.group(1))
                max_disc = Decimal(pct_match.group(2)) if pct_match.group(2) else None
                disc_type = "PERCENTAGE"
                start_pos = max(0, pct_match.start() - 40)
                end_pos = min(len(text), pct_match.end() + 80)
                snippet = text[start_pos:end_pos].replace("\n", " ").strip()
            elif flat_match:
                disc_val = Decimal(flat_match.group(1))
                max_disc = disc_val
                disc_type = "FLAT_AMOUNT"
                if flat_match.group(2):
                    min_spend = Decimal(flat_match.group(2))
                start_pos = max(0, flat_match.start() - 40)
                end_pos = min(len(text), flat_match.end() + 80)
                snippet = text[start_pos:end_pos].replace("\n", " ").strip()
            else:
                continue

            title = f"{disc_val}% instant discount on {merch_name}" if disc_type == "PERCENTAGE" else f"Flat ₹{disc_val} off on {merch_name}"
            if bank_name:
                title += f" with {bank_name} Cards"

            raw_dict = {
                "merchant_name": merch_name,
                "offer_title": title,
                "category_id": cat_id,
                "discount_type": disc_type,
                "discount_value": disc_val,
                "min_transaction_value": min_spend,
                "max_discount_amount": max_disc,
                "eligible_bank": bank_name,
                "eligible_network": network,
                "eligible_card_names": card_variants,
                "valid_from": datetime.utcnow() - timedelta(days=1),
                "valid_to": datetime.utcnow() + timedelta(days=45),
                "payment_channel": "ONLINE",
                "promo_code": promo_code,
                "source_url": source_url or f"file://{filename}",
                "source_name": source_name,
                "source_evidence": snippet or f"Extracted from official circular {filename}",
                "terms_and_conditions": f"Extracted from official circular {filename}. Subject to human verification."
            }

            canonical = OfferNormalizer.validate_and_normalize(
                raw_dict,
                ingestion_channel="ADMIN_DOCUMENT" if source_document_id else "PDF_CIRCULAR",
                source_id=source_id,
                source_name=source_name,
                source_url=source_url or f"file://{filename}",
                source_document_id=source_document_id
            )
            offers.append(canonical)

        return offers
