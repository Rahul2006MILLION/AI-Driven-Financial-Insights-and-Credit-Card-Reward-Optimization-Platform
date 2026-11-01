import re
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, field

@dataclass
class MerchantMatchResult:
    """
    Result of normalizing and resolving a merchant query against CLIQ's alias registry.
    """
    original_name: str
    normalized_name: str
    canonical_id: Optional[str] = None
    canonical_name: Optional[str] = None
    category_hint: Optional[str] = None
    confidence: float = 0.0
    is_known_merchant: bool = False
    is_ambiguous: bool = False
    matched_aliases: List[str] = field(default_factory=list)

    @property
    def is_confident_match(self) -> bool:
        return self.is_known_merchant and not self.is_ambiguous and self.confidence >= 0.80

class MerchantNormalizer:
    """
    Deterministic, maintainable merchant normalization and alias resolution registry.
    Tailored specifically for the Indian commerce, quick-commerce, travel, and dining ecosystem.
    Never relies on external AI or probabilistic LLMs.
    """

    # Comprehensive Registry of Indian Merchants:
    # canonical_id -> { "name": canonical_name, "category_hint": category, "aliases": [regex/strings], "exact_only": bool }
    MERCHANT_REGISTRY: Dict[str, Dict[str, Any]] = {
        "swiggy": {
            "canonical_name": "Swiggy",
            "category_hint": "food_delivery",
            "aliases": [
                "swiggy", "swiggy instamart", "swiggy dineout", "swiggy genie",
                "swiggy gourmet", "swiggy min", "swiggy delivery", "swiggy one",
                "swiggy in", "bundl technologies"
            ]
        },
        "zomato": {
            "canonical_name": "Zomato",
            "category_hint": "food_delivery",
            "aliases": [
                "zomato", "zomato gold", "zomato dining", "zomato pay",
                "zomato pro", "zomato feeding india", "zomato media"
            ]
        },
        "amazon": {
            "canonical_name": "Amazon",
            "category_hint": "shopping",
            "aliases": [
                "amazon", "amazon.in", "amazon india", "amazon pay",
                "amazon fresh", "amazon prime", "amazon seller", "amazon pantry"
            ]
        },
        "flipkart": {
            "canonical_name": "Flipkart",
            "category_hint": "shopping",
            "aliases": [
                "flipkart", "flipkart internet", "flipkart grocery",
                "flipkart minutes", "supercoins flipkart", "flipkart wholesale"
            ]
        },
        "myntra": {
            "canonical_name": "Myntra",
            "category_hint": "shopping",
            "aliases": [
                "myntra", "myntra designs", "myntra jabong"
            ]
        },
        "makemytrip": {
            "canonical_name": "MakeMyTrip",
            "category_hint": "travel",
            "aliases": [
                "makemytrip", "mmt", "makemytrip india", "makemytrip domestic",
                "makemytrip international", "mmt hotels"
            ]
        },
        "bookmyshow": {
            "canonical_name": "BookMyShow",
            "category_hint": "entertainment",
            "aliases": [
                "bookmyshow", "bms", "bigtree entertainment", "book my show"
            ]
        },
        "blinkit": {
            "canonical_name": "Blinkit",
            "category_hint": "grocery",
            "aliases": [
                "blinkit", "grofers", "blink commerce"
            ]
        },
        "bigbasket": {
            "canonical_name": "BigBasket",
            "category_hint": "grocery",
            "aliases": [
                "bigbasket", "big basket", "bb daily", "bb instant", "innovative retail concepts"
            ]
        },
        "zepto": {
            "canonical_name": "Zepto",
            "category_hint": "grocery",
            "aliases": [
                "zepto", "zepto quick commerce", "kirana kart technologies"
            ]
        },
        "uber": {
            "canonical_name": "Uber",
            "category_hint": "travel",
            "aliases": [
                "uber", "uber india", "uber bv", "uber rides", "uber trip"
            ]
        },
        "ola": {
            "canonical_name": "Ola",
            "category_hint": "travel",
            "aliases": [
                "ola", "ola cabs", "ani technologies", "ola ride"
            ]
        },
        "croma": {
            "canonical_name": "Croma",
            "category_hint": "shopping",
            "aliases": [
                "croma", "croma retail", "infiniti retail", "croma electronics"
            ]
        },
        "reliance_digital": {
            "canonical_name": "Reliance Digital",
            "category_hint": "shopping",
            "aliases": [
                "reliance digital", "jiomart digital", "reliance retail electronics"
            ]
        },
        "eazydiner": {
            "canonical_name": "EazyDiner",
            "category_hint": "dining",
            "aliases": [
                "eazydiner", "eazydiner prime", "eazy diner"
            ]
        },
        "apollo_pharmacy": {
            "canonical_name": "Apollo Pharmacy",
            "category_hint": "health",
            "aliases": [
                "apollo pharmacy", "apollo 247", "apollo hospitals", "apollo healthcare"
            ]
        },
        "tata_1mg": {
            "canonical_name": "Tata 1mg",
            "category_hint": "health",
            "aliases": [
                "1mg", "tata 1mg", "1mg technologies"
            ]
        },
        "nykaa": {
            "canonical_name": "Nykaa",
            "category_hint": "shopping",
            "aliases": [
                "nykaa", "fsn e-commerce", "nykaa man", "nykaa fashion"
            ]
        },
        "ajio": {
            "canonical_name": "AJIO",
            "category_hint": "shopping",
            "aliases": [
                "ajio", "ajio luxe", "reliance ajio"
            ]
        },
        "yatra": {
            "canonical_name": "Yatra",
            "category_hint": "travel",
            "aliases": [
                "yatra", "yatra online", "yatra travel"
            ]
        },
        "irctc": {
            "canonical_name": "IRCTC",
            "category_hint": "travel",
            "aliases": [
                "irctc", "indian railway catering and tourism", "irctc app", "irctc rail"
            ]
        },
        "hpcl": {
            "canonical_name": "HPCL",
            "category_hint": "fuel",
            "aliases": [
                "hpcl", "hindustan petroleum", "hp auto care", "hp petrol", "hp gas", "hpcl retail"
            ]
        },
        "bpcl": {
            "canonical_name": "BPCL",
            "category_hint": "fuel",
            "aliases": [
                "bpcl", "bharat petroleum", "bharat gas", "bpcl petrol", "bpcl retail", "speed petrol"
            ]
        },
        "iocl": {
            "canonical_name": "Indian Oil",
            "category_hint": "fuel",
            "aliases": [
                "iocl", "indian oil", "indianoil", "indian oil corp", "indane", "ioc petrol"
            ]
        },
        "shell": {
            "canonical_name": "Shell",
            "category_hint": "fuel",
            "aliases": [
                "shell", "shell petrol", "shell india", "shell lubricants"
            ]
        },
        "dmart": {
            "canonical_name": "DMart",
            "category_hint": "grocery",
            "aliases": [
                "dmart", "d mart", "avenue supermarts", "dmart ready"
            ]
        },
        "starbucks": {
            "canonical_name": "Starbucks",
            "category_hint": "dining",
            "aliases": [
                "starbucks", "tata starbucks", "starbucks coffee"
            ]
        },
        "mcdonalds": {
            "canonical_name": "McDonald's",
            "category_hint": "dining",
            "aliases": [
                "mcdonalds", "mcdonald", "hardcastle restaurants", "connaught plaza"
            ]
        },
        "kfc": {
            "canonical_name": "KFC",
            "category_hint": "dining",
            "aliases": [
                "kfc", "yum restaurants", "kfc india", "devyani international"
            ]
        },
        "tataneu": {
            "canonical_name": "Tata Neu",
            "category_hint": "shopping",
            "aliases": [
                "tata neu", "tataneu", "tata digital"
            ]
        },
        "netmeds": {
            "canonical_name": "Netmeds",
            "category_hint": "health",
            "aliases": [
                "netmeds", "netmeds marketplace"
            ]
        },
        "airtel": {
            "canonical_name": "Airtel",
            "category_hint": "utility",
            "aliases": [
                "airtel", "bharti airtel", "airtel payments", "airtel bill", "airtel broadband"
            ]
        },
        "jio": {
            "canonical_name": "Jio",
            "category_hint": "utility",
            "aliases": [
                "jio", "reliance jio", "jio infocomm", "jio fiber", "jio prepaid", "jio postpaid"
            ]
        },
        "netflix": {
            "canonical_name": "Netflix",
            "category_hint": "entertainment",
            "aliases": [
                "netflix", "netflix entertainment", "netflix india"
            ]
        },
        "spotify": {
            "canonical_name": "Spotify",
            "category_hint": "entertainment",
            "aliases": [
                "spotify", "spotify india", "spotify ab"
            ]
        }
    }

    # Noise tokens commonly found in Indian credit card SMS, POS terminals, and statements
    LEGAL_NOISE_TOKENS = {
        "pvt", "ltd", "private", "limited", "india", "retail", "services",
        "technologies", "tech", "in", "inc", "corp", "llp", "store",
        "online", "pay", "pos", "gateway", "checkout", "order", "ind",
        "bangalore", "mumbai", "delhi", "gurgaon", "noida", "hyderabad",
        "chennai", "kolkata", "pune", "ahmedabad", "jaipur"
    }

    # Ambiguous generic single words that should NEVER trigger merchant-specific offers alone
    AMBIGUOUS_GENERIC_WORDS = {
        "pay", "store", "online", "shop", "direct", "express", "mart", "bazaar",
        "food", "cafe", "restaurant", "hotel", "travel", "bill", "recharge",
        "cinema", "mall", "market", "kart", "eats"
    }

    @classmethod
    def clean_text(cls, text: str) -> str:
        """
        Strips whitespace, lowercases, removes non-alphanumeric noise (preserving spaces),
        and normalizes spacing.
        """
        if not text:
            return ""
        # Lowercase and replace non-alphanumeric (except whitespace)
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
        # Collapse multiple spaces
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @classmethod
    def resolve_merchant(cls, raw_merchant: Optional[str]) -> MerchantMatchResult:
        """
        Resolves an input merchant string into a structured MerchantMatchResult.
        Guarantees that original_name is preserved.
        """
        if not raw_merchant or not raw_merchant.strip():
            return MerchantMatchResult(
                original_name=raw_merchant or "",
                normalized_name="",
                is_known_merchant=False,
                is_ambiguous=False,
                confidence=0.0
            )

        original = raw_merchant.strip()
        cleaned = cls.clean_text(original)

        if not cleaned:
            return MerchantMatchResult(
                original_name=original,
                normalized_name="",
                is_known_merchant=False,
                is_ambiguous=False,
                confidence=0.0
            )

        # Check if the query is just a single ambiguous generic word
        if cleaned in cls.AMBIGUOUS_GENERIC_WORDS:
            return MerchantMatchResult(
                original_name=original,
                normalized_name=cleaned,
                is_known_merchant=False,
                is_ambiguous=True,
                confidence=0.0
            )

        # Token set for comparison
        cleaned_tokens = set(cleaned.split())

        matches: List[Tuple[str, str, float]] = []  # (canonical_id, alias, score)

        for c_id, data in cls.MERCHANT_REGISTRY.items():
            for alias in data["aliases"]:
                clean_alias = cls.clean_text(alias)
                alias_tokens = set(clean_alias.split())

                # 1. Exact cleaned match
                if cleaned == clean_alias:
                    matches.append((c_id, alias, 1.0))
                    continue

                # 2. Strict word boundary prefix / containment
                # e.g., "Swiggy Instamart Koramangala" contains alias "swiggy instamart"
                pattern = r"\b" + re.escape(clean_alias) + r"\b"
                if re.search(pattern, cleaned):
                    # If other words are known legal/city noise tokens, award high confidence
                    remaining_tokens = cleaned_tokens - alias_tokens
                    if remaining_tokens and remaining_tokens.issubset(cls.LEGAL_NOISE_TOKENS):
                        score = 0.92
                    else:
                        score = min(0.95, 0.75 + (len(clean_alias) / len(cleaned)) * 0.20)
                    matches.append((c_id, alias, score))
                    continue

                # 3. If cleaned input is a multi-word sequence where all alias tokens are present
                if len(alias_tokens) > 1 and alias_tokens.issubset(cleaned_tokens):
                    matches.append((c_id, alias, 0.88))
                    continue

                # 4. Reverse containment: alias contains cleaned (only if cleaned has substantial length >= 4)
                if len(cleaned) >= 4 and re.search(r"\b" + re.escape(cleaned) + r"\b", clean_alias):
                    score = min(0.90, 0.70 + (len(cleaned) / len(clean_alias)) * 0.20)
                    matches.append((c_id, alias, score))

        if not matches:
            # Strip noise words and try one more token match
            meaningful_tokens = [t for t in cleaned.split() if t not in cls.LEGAL_NOISE_TOKENS]
            if len(meaningful_tokens) == 1:
                token = meaningful_tokens[0]
                if token in cls.MERCHANT_REGISTRY:
                    c_data = cls.MERCHANT_REGISTRY[token]
                    return MerchantMatchResult(
                        original_name=original,
                        normalized_name=token,
                        canonical_id=token,
                        canonical_name=c_data["canonical_name"],
                        category_hint=c_data["category_hint"],
                        confidence=0.90,
                        is_known_merchant=True,
                        is_ambiguous=False,
                        matched_aliases=[token]
                    )

            return MerchantMatchResult(
                original_name=original,
                normalized_name=cleaned,
                canonical_id=None,
                canonical_name=original.title(),
                category_hint=None,
                confidence=0.0,
                is_known_merchant=False,
                is_ambiguous=False
            )

        # Sort matches by highest confidence score
        matches.sort(key=lambda x: x[2], reverse=True)
        top_c_id, top_alias, top_score = matches[0]

        # Check for ambiguity: if top two matches have different canonical IDs with close scores
        candidate_c_ids = set(m[0] for m in matches if m[2] >= 0.80)
        if len(candidate_c_ids) > 1:
            # Truly ambiguous match across distinct merchants
            return MerchantMatchResult(
                original_name=original,
                normalized_name=cleaned,
                canonical_id=None,
                canonical_name=None,
                category_hint=None,
                confidence=0.30,
                is_known_merchant=False,
                is_ambiguous=True,
                matched_aliases=[m[1] for m in matches]
            )

        c_info = cls.MERCHANT_REGISTRY[top_c_id]
        return MerchantMatchResult(
            original_name=original,
            normalized_name=cleaned,
            canonical_id=top_c_id,
            canonical_name=c_info["canonical_name"],
            category_hint=c_info["category_hint"],
            confidence=top_score,
            is_known_merchant=True,
            is_ambiguous=False,
            matched_aliases=[top_alias]
        )

    @classmethod
    def matches_pattern(
        cls,
        candidate_merchant: Optional[str],
        pattern_or_target: Optional[str]
    ) -> Tuple[bool, float, str]:
        """
        Determines whether candidate_merchant safely matches pattern_or_target.
        Returns: (is_match, confidence, reason)
        Guarantees that ambiguous or accidental substring matches are rejected.
        """
        if not candidate_merchant or not pattern_or_target:
            return False, 0.0, "Missing candidate or pattern"

        cand_res = cls.resolve_merchant(candidate_merchant)
        target_res = cls.resolve_merchant(pattern_or_target)

        # 1. Both resolved to the same canonical merchant ID with confidence
        if cand_res.is_confident_match and target_res.is_confident_match:
            if cand_res.canonical_id == target_res.canonical_id:
                return True, min(cand_res.confidence, target_res.confidence), f"Resolved to canonical merchant '{cand_res.canonical_name}'"
            return False, 0.0, f"Canonical mismatch: '{cand_res.canonical_name}' != '{target_res.canonical_name}'"

        # 2. If candidate is ambiguous, never match a specific target pattern
        if cand_res.is_ambiguous or target_res.is_ambiguous:
            return False, 0.0, "Ambiguous merchant match rejected for safety"

        # 3. Clean exact text comparison
        c_clean = cand_res.normalized_name
        t_clean = target_res.normalized_name

        if c_clean == t_clean:
            return True, 1.0, "Exact normalized merchant match"

        # 4. Strict word boundary search (prevents 'art' matching 'Flipkart' or 'pay' matching 'Amazon Pay')
        if len(t_clean) >= 4:
            pattern = r"\b" + re.escape(t_clean) + r"\b"
            if re.search(pattern, c_clean):
                return True, 0.90, f"Word boundary match of '{t_clean}' in '{c_clean}'"

        if len(c_clean) >= 4:
            pattern = r"\b" + re.escape(c_clean) + r"\b"
            if re.search(pattern, t_clean):
                return True, 0.90, f"Word boundary match of '{c_clean}' in '{t_clean}'"

        return False, 0.0, f"No safe match between '{candidate_merchant}' and '{pattern_or_target}'"

