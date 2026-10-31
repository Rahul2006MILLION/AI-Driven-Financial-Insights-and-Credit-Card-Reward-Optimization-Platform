# CLIQ — Multi-Channel Offer Ingestion

## Overview

CLIQ implements a **unified, multi-channel ingestion architecture** capable of aggregating credit-card offers from heterogeneous Indian banking and merchant formats into a single, strongly-typed canonical representation.

Regardless of whether an offer originates from a public web page, a bank PDF circular, an authorized partner API, an uploaded file, or an administrative form, it is normalized into the exact same schema before entering the mandatory human review queue.

---

## 1. The Shared Ingestion Interface

All ingestion channels implement the `BaseIngestionChannel` interface:

```python
class BaseIngestionChannel(ABC):
    channel_name: str

    @abstractmethod
    async def ingest(self, db: AsyncSession, raw_payload: Any) -> IngestionResult:
        """
        Takes raw source payload (bytes, JSON, HTML, form), validates boundaries,
        extracts terms, normalizes fields, and returns CanonicalOfferPayload items.
        """
        pass
```

### Ingestion Result Container
```python
@dataclass
class IngestionResult:
    success: bool
    channel_name: str
    items: List[CanonicalOfferPayload]
    errors: List[str]
    source_metadata: Dict[str, Any]
    document_id: Optional[str] = None
```

---

## 2. Ingestion Channels (A through E)

```
                       ┌────────────────────────────────────────────────────────┐
                       │               CLIQ INGESTION CHANNELS                  │
                       └────────────────────────────────────────────────────────┘
                                                    │
         ┌───────────────┬───────────────────┬──────┴─────────┬─────────────────┐
         │               │                   │                │                 │
         ▼               ▼                   ▼                ▼                 ▼
   ┌───────────┐   ┌───────────┐       ┌───────────┐    ┌───────────┐     ┌───────────┐
   │ Channel A │   │ Channel B │       │ Channel C │    │ Channel D │     │ Channel E │
   │ Public    │   │ Official  │       │ Auth      │    │ Admin     │     │ Admin     │
   │ HTML      │   │ PDF       │       │ Partner   │    │ Uploaded  │     │ Manual    │
   │ Extraction│   │ Circulars │       │ Feeds     │    │ Documents │     │ Entry     │
   └─────┬─────┘   └─────┬─────┘       └─────┬─────┘    └─────┬─────┘     └─────┬─────┘
         │               │                   │                │                 │
         └───────────────┴───────────────────┼────────────────┴─────────────────┘
                                             ▼
                             ┌───────────────────────────────┐
                             │       OfferNormalizer         │
                             │  - Strict Decimal precision   │
                             │  - Category & Network mapping │
                             │  - Confidence Scoring         │
                             │  - SHA-256 Canonical Hash     │
                             └───────────────┬───────────────┘
                                             ▼
                             ┌───────────────────────────────┐
                             │    OfferIngestionEngine       │
                             │  - Deduplication              │
                             │  - Material change detection  │
                             │  - Stage into PENDING_REVIEW  │
                             └───────────────────────────────┘
```

### Channel A: Permitted Public HTML Extraction (`HtmlIngestionChannel`)
- **Target**: Public bank offer landing pages that do not prohibit automated crawling.
- **Pre-flight Checks**:
  1. Validates domain against `robots.txt` using Python `urllib.robotparser`.
  2. Detects WAF signatures (Akamai, Cloudflare, CloudFront, AWS WAF).
  3. Aborts and logs failure if access is blocked or disallowed.
- **Extraction**: Parses structured DOM elements, microdata, or embedded JSON payloads.

### Channel B: Official Downloadable PDF Circulars (`PdfCircularIngestionChannel`)
- **Target**: Publicly downloadable PDF circulars issued by banks (e.g., SBI Card festive flyers, HDFC promotional releases).
- **Processing**: Passes PDF bytes to `CircularParserService` using `pypdf`.
- **Text & Metadata Extraction**: Extracts text, validates against non-searchable raster scans, extracts financial terms, promo codes, card names, and verbatim quotes.

### Channel C: Authorized APIs & Partner Feeds (`PartnerFeedIngestionChannel`)
- **Target**: Bank affiliate programs, merchant partnership feeds, aggregator B2B APIs.
- **Authentication**: Requires valid API credentials (HTTP Bearer token or HMAC header).
- **Format**: Structured JSON adhering to `PartnerFeedIngestRequest`.
- **Validation**: Strict schema validation with currency checks and date parsing.

### Channel D: Admin-Uploaded Official Documents (`AdminDocumentIngestionChannel`)
- **Target**: Official documents uploaded by CLIQ administrators via the admin UI (`/admin/offers`).
- **Security Validation**:
  - MIME type check: `application/pdf` only.
  - File size check: Maximum 10MB.
  - SHA-256 Deduplication: Identical PDF uploads are rejected with 409 Conflict.
- **Audit Persistence**: Stored in `admin_offer_documents` table with audit metadata.

### Channel E: Admin-Entered Offers with Evidence (`AdminManualIngestionChannel`)
- **Target**: High-value card offers discovered through in-branch materials, email statements, or private partner alerts.
- **Mandatory Fields**:
  - Source URL: Active, inspectable web address or document repository.
  - Source Evidence: Verbatim text snippet directly quoted from the bank.
- **Staging**: Enters `PENDING_REVIEW` with channel tag `MANUAL_ENTRY`.

---

## 3. Common Offer Normalization

Every channel emits items conforming to `CanonicalOfferPayload`:

```python
@dataclass
class CanonicalOfferPayload:
    merchant_name: str
    offer_title: str
    category_id: str
    discount_type: str                  # PERCENTAGE or FLAT_AMOUNT
    discount_value: Decimal             # Exact Decimal (e.g. Decimal("10.00"))
    min_transaction_value: Decimal      # Exact Decimal (e.g. Decimal("500.00"))
    max_discount_amount: Optional[Decimal] # Exact Decimal or None
    eligible_bank: Optional[str]
    eligible_network: Optional[str]     # VISA, MASTERCARD, RUPAY, AMEX, DINERS
    eligible_card_names: List[str]
    valid_from: Optional[datetime]
    valid_to: Optional[datetime]
    payment_channel: str                # ONLINE, OFFLINE, BOTH
    promo_code: Optional[str]
    activation_requirement: Optional[str]
    terms_and_conditions: Optional[str]
    source_url: Optional[str]
    source_name: Optional[str]
    source_evidence: Optional[str]
    extraction_confidence: Decimal      # 0.00 to 1.00
    ingestion_channel: str
```

### Deterministic Financial Arithmetic
To prevent floating-point inaccuracy in financial calculations:
- `discount_value`, `min_transaction_value`, and `max_discount_amount` are strictly instantiated as `Decimal`.
- Rounded using `ROUND_HALF_UP` to two decimal places (`0.01`).
- Negative values or values $> 100\%$ for percentage discounts trigger immediate extraction confidence penalties.

### Canonical SHA-256 Fingerprint
To guarantee idempotent deduplication and detect upstream term drift, a deterministic fingerprint is calculated:

$$\text{Canonical String} = \text{merchant} \mid \text{category} \mid \text{discount\_type} \mid \text{discount\_value} \mid \text{min\_spend} \mid \text{max\_cap} \mid \text{promo\_code} \mid \text{bank} \mid \text{network}$$

$$\text{Content Hash} = \text{SHA-256}(\text{Canonical String})$$

If an incoming payload shares an identical hash with an existing offer, it is recognized as unchanged. If core terms differ, the system flags a material change and quarantines the offer.

