# CLIQ — Offer Intelligence Architecture

## System Overview

CLIQ operates a **hybrid, source-adaptive Offer Intelligence Architecture** designed specifically for the Indian credit card and fintech ecosystem.

It combines multi-source automated collection with strict compliance boundaries, canonical data normalization, and a mandatory **Human-in-the-Loop verification gate**. Only active offers verified by an authorized administrator are permitted to influence user recommendation calculations.

---

## 1. End-to-End Architecture Diagram

```mermaid
flowchart TD
    subgraph Sources["1. Heterogeneous Upstream Sources"]
        S1["Public HTML Pages<br/>(ICICI, Axis)"]
        S2["Official PDF Circulars<br/>(HDFC, SBI Card)"]
        S3["Authorized Partner APIs<br/>(JSON / Webhooks)"]
        S4["Official Documents<br/>(Admin Upload)"]
        S5["Manual Entry<br/>(Branch / Email Terms)"]
    end

    subgraph Boundaries["2. Compliance & Anti-Bot Pre-Flight"]
        B1{"robots.txt<br/>Permitted?"}
        B2{"WAF / CDN<br/>Block?"}
        B3["Log Failure & Exponential Backoff"]
    end

    subgraph IngestionChannels["3. Ingestion Channels"]
        C1["HtmlIngestionChannel"]
        C2["PdfCircularIngestionChannel"]
        C3["PartnerFeedIngestionChannel"]
        C4["AdminDocumentIngestionChannel"]
        C5["AdminManualIngestionChannel"]
    end

    subgraph Normalization["4. Normalization Engine"]
        N1["OfferNormalizer<br/>- Exact Decimal Arithmetic<br/>- Category & Network Normalization<br/>- SHA-256 Fingerprint<br/>- Confidence Scoring"]
    end

    subgraph StagingQueue["5. Offer Ingestion Engine & Deduplication"]
        IE{"Canonical Hash<br/>Match?"}
        IE_New["Stage into PENDING_REVIEW"]
        IE_Existing{"Material<br/>Change?"}
        IE_Quarantine["Quarantine into<br/>NEEDS_REVERIFICATION"]
        IE_Unchanged["Mark UNCHANGED / Update Telemetry"]
    end

    subgraph HumanReview["6. Admin Verification Desk (Mandatory Gate)"]
        HR["Authorized Administrator<br/>- Inspect Original Source & Evidence<br/>- Edit Incorrect Extracted Terms<br/>- Approve Offer (Promote to VERIFIED)<br/>- Reject Offer with Reason"]
        Audit["Immutable OfferAuditLog<br/>- Actor ID, Name, Role<br/>- State Transitions<br/>- Snapshot Diffs"]
    end

    subgraph RecommendationEngine["7. User Recommendation Engine"]
        RE["RewardOptimizationEngine<br/>- Only status == VERIFIED considered<br/>- Card variant match<br/>- Instant discount calculation<br/>- Decimal cashback optimization"]
    end

    %% Flow Connections
    S1 --> B1
    B1 -- Yes --> B2
    B1 -- No (e.g. RuPay) --> B3
    B2 -- Clean --> C1
    B2 -- 403 / Cloudflare --> B3

    S2 --> C2
    S3 --> C3
    S4 --> C4
    S5 --> C5

    C1 --> N1
    C2 --> N1
    C3 --> N1
    C4 --> N1
    C5 --> N1

    N1 --> IE
    IE -- New Offer --> IE_New
    IE -- Existing Found --> IE_Existing
    IE_Existing -- Yes --> IE_Quarantine
    IE_Existing -- No --> IE_Unchanged

    IE_New --> HR
    IE_Quarantine --> HR
    HR --> Audit
    HR -- Approved --> RE
    IE_Quarantine -.->|EXCLUDED| RE
```

---

## 2. Ingestion Flow Lifecycle

### Step 1: Pre-Flight Safety & Source Selection
Before issuing HTTP requests, the channel validates:
- Domain `robots.txt` policy via `urllib.robotparser`.
- Rate limits per minute from `OfferSource`.
- Presence of CAPTCHA, Cloudflare, or Akamai challenges.
- In compliance with guidelines, blocked sources immediately halt and log to `source_failure_logs`.

### Step 2: Extraction & Evidence Capture
- Text from HTML DOM or PDF binary (`CircularParserService`) is searched using structured regex patterns.
- Verbatim evidence snippets (up to 280 characters) are captured and attached.
- Automated extraction confidence score ($0.00$ to $1.00$) is computed based on data completeness.

### Step 3: Canonical Normalization
- All financial numbers are mapped to deterministic `Decimal` objects.
- Categories and networks are mapped to standardized enums.
- A deterministic SHA-256 fingerprint is calculated.

### Step 4: Staging & Change Detection
- **New Offers**: Staged into `PENDING_REVIEW`.
- **Existing Offers (Unchanged)**: Telemetry and freshness timestamps refreshed.
- **Existing Offers (Material Term Shift)**: Immediately quarantined to `NEEDS_REVERIFICATION`. Previous version archived in `previous_version_json`.

### Step 5: Mandatory Human Review Gate
- Authorized admins inspect source evidence, verify terms, edit parameters if needed, and explicitly click **Approve** or **Reject**.
- Only after approval does an offer transition to `VERIFIED`.

### Step 6: Recommendation Calculation
- When a user calculates card rewards via `/api/v1/optimization/recommend` or card utilization in the wallet:
  - Offers with `status != 'VERIFIED'` are **strictly excluded**.
  - Verified instant discounts are calculated using `Decimal` arithmetic.
  - Transparent step-by-step breakdown is presented to the user with verbatim evidence links.

