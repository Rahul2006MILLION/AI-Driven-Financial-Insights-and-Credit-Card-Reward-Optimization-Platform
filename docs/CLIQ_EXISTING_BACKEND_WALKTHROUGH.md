# CLIQ — Comprehensive Backend Architecture & Implementation Walkthrough

**Author:** Senior Backend Architect & Python/FastAPI Engineer  
**Date:** November 1, 2026  
**Project:** CLIQ — AI-Powered Financial Intelligence & Credit Card Reward Optimization Platform  
**Target Codebase:** `/Users/rahuljain/CLIQ/backend`  
**Test Suite Status:** **75 / 75 PASSED (100% Passing)**

---

## Executive Summary

CLIQ is an AI-powered financial intelligence and credit card reward optimization platform engineered specifically for the Indian fintech ecosystem. Its backend is built with Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, and SQLite / Supabase PostgreSQL.

The backend is characterized by two fundamental architectural philosophies:
1. **Deterministic Financial Computations**: All monetary calculations, cashback percentages, point valuations, monthly cap tracking, and card recommendations are executed purely through arbitrary-precision Python `Decimal` arithmetic. The platform strictly rejects probabilistic LLM arithmetic for financial decisions.
2. **Privacy-First AI Governance (Zero Data Egress by Default)**: All external AI calls pass through a centralized `PrivacyGateway`. Highly sensitive personal data (16-digit PANs, CVVs, PINs, OTPs, Aadhaar numbers, tax PANs, passwords) are scrubbed before reaching prompt construction. Furthermore, external AI requests are blocked unless the user explicitly grants granular, versioned consent; otherwise, queries are answered by an in-process deterministic multilingual engine.

This document provides an exhaustive technical audit and architectural walkthrough of the implemented backend codebase.

---

## 1. System Architecture & Request Lifecycle

```
                                  [ Client Request ]
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │    SecurityHeadersMiddleware    │
                         │ (HSTS, CSP, X-Frame, X-Content) │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │       RateLimitMiddleware       │
                         │  (Token Bucket / IP Windowing)  │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │         CORSMiddleware          │
                         │    (Origin & Method Filter)     │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │      FastAPI Router / DI        │
                         │  - HTTPBearer Authentication    │
                         │  - decode_access_token (JWT)    │
                         │  - require_admin (RBAC)         │
                         │  - get_db (AsyncSessionLocal)   │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │         Service Layer           │
                         │ ─────────────────────────────── │
                         │ • RewardOptimizationEngine      │
                         │ • PrivacyGateway / Consent      │
                         │ • OfferIngestionEngine          │
                         │ • CircularParser / DocParser    │
                         │ • FinancialHealthEngine         │
                         │ • MultilingualAssistantService  │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   Data Layer (SQLAlchemy 2.0)   │
                         │ ─────────────────────────────── │
                         │  SQLite (Local) / Postgres      │
                         │  18 Entities, Async Engine      │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                                [ Pydantic Response ]
```

### 1.1 Architectural Style & Design Principles
- **Layered Clean Architecture**: Separation of concerns across API Routers (`app/api/v1/`), Domain Services (`app/services/`), Pydantic Contracts (`app/schemas/`), Database Entities (`app/models/entities.py`), and Core Infrastructure (`app/core/`, `app/security/`).
- **Async I/O Throughout**: Uses `asyncio`, `httpx.AsyncClient`, and `SQLAlchemy` asynchronous sessions (`async_sessionmaker`, `AsyncSession`, `create_async_engine`).
- **Dependency Injection**: Relies on FastAPI's native `Depends()` for database session scopes (`get_db`), authentication (`get_current_user`), and authorization (`require_admin`).
- **Defense in Depth**: Every outbound AI payload undergoes regex sanitization and strict schema minimization; every incoming request is subject to rate limiting, CORS filtering, and security response headers.

### 1.2 Session Lifecycle & Database Connection Pool
- The database engine is instantiated in `app/core/database.py` using `create_async_engine(settings.DATABASE_URL, echo=False, future=True)`.
- For development, `sqlite+aiosqlite:///<BASE_DIR>/data/cliq.db` is used. In production, Supabase PostgreSQL with `asyncpg` is supported by changing `DATABASE_URL`.
- The session factory `AsyncSessionLocal` sets `expire_on_commit=False` and `autoflush=False` to prevent lazy loading issues across async boundaries.
- The `get_db()` generator opens a session per request, yields it to the dependency tree, and guarantees `await session.close()` in a `finally` block.

---

## 2. Module-by-Module Deep Dive

### 2.1 Core Infrastructure (`app/core/` & `app/security/`)
- **`app/core/config.py`**:
  - Encapsulates environment configuration using Pydantic Settings (`BaseSettings`).
  - Governs `DATABASE_URL`, `APP_SECRET_KEY`, `AI_PROVIDER` (default `"gemini"`), `AI_MODEL_NAME` (default `"gemini-2.5-flash"`), `GEMINI_MODEL` (configurable override), `ALLOWED_ORIGINS`, `RATE_LIMIT_PER_MINUTE` (120), and `MAX_UPLOAD_SIZE_BYTES` (10 MB).
  - Resolves `effective_ai_model` dynamically to ensure backward compatibility and prevent fallback to deprecated models.
- **`app/core/database.py`**:
  - Configures the async SQLAlchemy engine, directory creation for SQLite, and declarative Base.
- **`app/security/jwt.py` & `password.py`**:
  - Implements passlib `bcrypt` hashing for user passwords.
  - Generates HMAC-SHA256 JWT access tokens containing user ID (`sub`), role, and expiration timestamp (`exp`).
- **`app/security/middleware.py`**:
  - `SecurityHeadersMiddleware`: Injects modern browser security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, and `Content-Security-Policy: default-src 'self'`).
  - `RateLimitMiddleware`: In-memory IP window tracker enforcing per-minute request limits to guard against brute-force attacks and volumetric DoS.
- **`app/security/dependencies.py`**:
  - `get_current_user`: Decodes Bearer tokens, queries active profile, and rejects expired, forged, or unauthenticated requests with HTTP 401.
  - `require_admin`: Verifies `user.is_admin` or `user.role == "ADMIN"`, rejecting unauthorized users with HTTP 403.

---

### 2.2 Credit Card & Portfolio Management (`app/api/v1/cards.py`)
- **Responsibilities**: CRUD operations for user credit cards, reward rules, and cardholder benefits.
- **Key Capabilities**:
  - Support for card metadata: bank name, card name, network (VISA, MASTERCARD, AMEX, RUPAY, DINERS), card variant (Metal, Signature, Platinum), cardholder name, nickname, last 4 digits, joining fee, annual fee, renewal waiver spend target, renewal date, and terms source URL.
  - Automatic duplicate prevention: rejects adding identical card combinations (`user_id`, `card_name`, `bank_name`, `last_four_digits`).
  - Cascading rules and benefits: when creating or updating a card, associated `CardRewardRule` and `CardBenefit` objects are managed within a single atomic database transaction.

---

### 2.3 Deterministic Reward Optimization Engine (`app/services/reward_optimization/engine.py`)
The crown jewel of CLIQ's computational infrastructure.

```
       [ Transaction Amount: ₹5,000, Category: dining, Merchant: Swiggy ]
                                       │
                                       ▼
                     [ 1. Match Active Upfront Offers ]
                     • Query active verified offers for card/bank/network
                     • Swiggy 15% instant discount up to ₹200 (Promo: SWIGGY15)
                     • Discount applied = ₹200.00
                     • Charged Amount = ₹5,000 - ₹200 = ₹4,800.00
                                       │
                                       ▼
                     [ 2. Match Post-Transaction Rules ]
                     • Priority 1: Merchant pattern match ("Swiggy" in pattern)
                     • Priority 2: Category accelerator ("dining")
                     • Priority 3: Base card rate ("all")
                     • Matched rule: 5% Cashback on Dining & Swiggy
                                       │
                                       ▼
                     [ 3. Enforce Caps & Constraints ]
                     • Min Spend Check: ₹4,800 >= ₹500 (PASS)
                     • Raw Cashback: ₹4,800 × 5% = ₹240.00
                     • Per-Txn Cap: ₹500.00 (Unconstrained)
                     • Monthly Cap: Remaining ₹1,000 >= ₹240.00 (PASS)
                     • Final Post-Reward = ₹240.00
                                       │
                                       ▼
                     [ 4. Aggregate Net Financial Benefit ]
                     • Total Benefit = ₹200 (Instant) + ₹240 (Post-Reward) = ₹440.00
                     • Effective Return Rate = (₹440 / ₹5,000) × 100 = 8.80%
                                       │
                                       ▼
                     [ 5. Portfolio Ranking & Tie-Breaking ]
                     • Sort Key: (-Net Benefit, -Effective Rate, Annual Fee)
```

- **Arithmetic Precision**: Standard `float` types are strictly forbidden. All math is performed via `Decimal` with explicit rounding:
  - Monetary values: `.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)`.
  - Reward point accumulation: `.quantize(Decimal("1"), rounding=ROUND_FLOOR)`.
- **Exclusion Engine**: Instantly flags excluded categories (e.g., fuel transactions with no surcharge waiver, ATM cash advances, wallet loading, or tax payments) with explicit `exclusion_reason` strings and bypasses post-reward calculation while preserving any valid instant merchant discounts.
- **Full Traceability**: Every evaluation produces an array of `CalculationStep` items recording step number, rule name, rate percentage, raw reward, cap applied, final monetary value, and a human-readable explanation.

---

### 2.4 Offer Intelligence & Ingestion Infrastructure (`app/services/offers/`)
CLIQ implements an adaptive, resilient offer intelligence subsystem capable of discovering and aggregating commercial offers without violating third-party access boundaries or robot restrictions.

```
       ┌────────────────────────────────────────────────────────┐
       │                5 Ingestion Channels                    │
       │                                                        │
       │  [HTML Extraction]      [PDF Circular]     [Auth API]  │
       │  (Robots/WAF Checked)   (pypdf / Vector)  (Partner)   │
       │            [Admin Document]     [Manual Entry]         │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │              OfferNormalizer & Validation              │
       │  • Standardize categories, networks, discount types    │
       │  • Validate numeric ranges and ISO date boundaries    │
       │  • Compute canonical SHA-256 content hash             │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                 OfferIngestionEngine                   │
       │  • Deduplication against existing repository           │
       │  • Material Change Detection (dates, caps, terms)      │
       │  • Immediate Quarantine of altered active offers       │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │            Verification Desk / Audit Trail             │
       │  • Status: PENDING_REVIEW / NEEDS_REVERIFICATION       │
       │  • Admin Review (Approve / Reject / Edit)              │
       │  • Append immutable OfferAuditLog snapshot             │
       └────────────────────────────────────────────────────────┘
```

#### A. Source Registry (`app/services/offers/source_registry.py`)
Tracks 8 default Indian financial sources:
1. `hdfc_bank` (`hdfcbank.com`): Bank | `BLOCKED_WAF` / `MANUAL_ONLY` (Akamai WAF boundary respected; circular ingestion).
2. `icici_bank` (`icicibank.com`): Bank | `SPA_CLIENT_SIDE` / `PARTIALLY_IMPLEMENTED` (Static shell 200 OK; dynamic JS API).
3. `axis_bank` (`axisbank.com`): Bank | `SPA_CLIENT_SIDE` / `PARTIALLY_IMPLEMENTED` (CDN SPA; circular preferred).
4. `sbi_card` (`sbicard.com`): Bank | `BLOCKED_WAF` / `MANUAL_ONLY` (Perimeter security; circular ingestion).
5. `swiggy` (`swiggy.com`): Merchant | `SPA_CLIENT_SIDE` / `PARTIALLY_IMPLEMENTED` (Client-side GraphQL/REST; circular ingestion).
6. `zomato` (`zomato.com`): Merchant | `BLOCKED_WAF` / `MANUAL_ONLY` (Cloudflare protection; partner feed ingestion).
7. `rupay_npci` (`rupay.co.in`): Network | `ROBOTS_RESTRICTED` / `MANUAL_ONLY` (Robots.txt disallow compliance; manual only).
8. `visa_india` (`visa.co.in`): Network | `PUBLIC_PERMITTED` / `IMPLEMENTED` (Public offers portal permitted).

#### B. The 5 Ingestion Channels (`app/services/offers/channels/`)
1. **`html_channel.py`**: Probes public web endpoints. Pre-checks `robots.txt` using `urllib.robotparser` and tests HTTP response headers. If blocked or restricted, logs failure and halts rather than attempting to bypass controls.
2. **`pdf_channel.py`**: Parses vector PDF bank circulars via `pypdf`, extracting merchant names, discounts, min spends, and validity dates with verbatim text evidence snippets.
3. **`partner_channel.py`**: Ingests structured JSON partner feeds (`PartnerFeedIngestRequest`).
4. **`document_channel.py`**: Handles uploaded admin documents with SHA-256 duplicate detection.
5. **`manual_channel.py`**: Direct administrative entry desk with pre-validation.

#### C. Verification Status Lifecycle
Offers progress through strict states:
`DISCOVERED` ➔ `PENDING_REVIEW` ➔ `VERIFIED` ➔ `EXPIRED` / `REJECTED` / `NEEDS_REVERIFICATION` / `SOURCE_UNAVAILABLE`.
Only offers in `VERIFIED` status are ever exposed to end-users or evaluated by the reward optimization engine.

---

### 2.5 Privacy Gateway & Sensitive-Data Governance (`app/services/privacy/privacy_gateway.py`)
CLIQ's Privacy Gateway acts as the **single enforcement point** for all AI processing across the platform.

```
       [ Multilingual Assistant Query / Chat Request ]
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │       1. Approved AI Task Validation      │
        │ Allowlist: FINANCIAL_EDUCATION,           │
        │ CARD_RECOMMENDATION_EXPLANATION, etc.     │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │      2. Sensitive Data Redactor (PII)     │
        │ Scans query and strips:                   │
        │ - 16-Digit Card PANs   - Indian Aadhaar   │
        │ - CVV / CVC            - Indian Tax PAN   │
        │ - OTP / PIN / Passwords- Bank A/C Numbers │
        │ - Email Addresses      - Phone Numbers    │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │       3. Deprecated Model Enforcement     │
        │ Rejects shutdown models (e.g. 1.5-flash)  │
        │ Requires active production: gemini-2.5-flash│
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │        4. User AI Consent Evaluation      │
        │ - Check user_ai_consents in DB            │
        │ - Default: external_ai_enabled = FALSE    │
        │ - If FALSE / REVOKED: ROUTE TO LOCAL      │
        └─────────────────────┬─────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │ Consent GRANTED             │ Consent DENIED / REVOKED
               ▼                             ▼
   ┌───────────────────────┐     ┌────────────────────────┐
   │ 5. Data Minimization  │     │ Deterministic Local    │
   │ Context Builder       │     │ Grounded Multilingual  │
   │ (Aggregated Summaries,│     │ Assistant (En, Hi, Kn) │
   │ No Raw Financials)    │     └───────────┬────────────┘
   └───────────┬───────────┘                 │
               │                             │
               ▼                             │
   ┌───────────────────────┐                 │
   │ 6. Prompt Sanitizer   │                 │
   │ (XML Delimited Blocks,│                 │
   │ Injection Defense)    │                 │
   └───────────┬───────────┘                 │
               │                             │
               ▼                             │
   ┌───────────────────────┐                 │
   │ 7. Safe Gemini Call   │                 │
   │ (gemini-2.5-flash via │                 │
   │ httpx AsyncClient)    │                 │
   └───────────┬───────────┘                 │
               │                             │
               ▼                             ▼
        ┌───────────────────────────────────────────┐
        │   8. Privacy-Safe Audit Logging           │
        │ Writes AiRequestAuditLog without logging  │
        │ raw prompts, secrets, or financial PII.   │
        └───────────────────────────────────────────┘
```

- **Sensitive Data Redaction Benchmark**: Tested against 9 distinct regex classes, achieving zero leakage of PANs, CVVs, PINs, OTPs, Aadhaar numbers, and passwords.
- **Data Minimization Rules**:
  - `FINANCIAL_EDUCATION`: Sends zero user financial records.
  - `CARD_RECOMMENDATION_EXPLANATION`: Sends only active card names, bank names, and top reward rates. Never transmits card IDs, credit limits, or fees.
  - `SPENDING_ANALYSIS_SUMMARY`: Computes aggregate category totals on the backend. Never sends raw transactions, timestamps, or merchant lines to external LLMs.
- **Grounded Multilingual Local Engine**: Implements instant, zero-egress responses in English, Hindi, and Kannada using pre-computed card data and deterministic optimization calls.

---

### 2.6 Document Intelligence & PDF Extraction (`app/services/document_intelligence/`)
- **`parser.py`**:
  - Utilizes PyMuPDF (`fitz`) with a safe 25-page parsing ceiling to prevent DoS via decompression bombs.
  - Detects bank issuers (HDFC, ICICI, Axis, SBI, Amex) from document text headers.
  - Extracts reward rules (percentage, category, exclusions) and stages them into `extracted_card_data` with `is_verified=False`.
- **`circular_parser.py`**:
  - Parses vector-encoded official bank circulars using `pypdf`.
  - Verifies PDF magic bytes (`%PDF-`) and enforces a 10 MB file ceiling.
  - Rejects password-encrypted documents.
  - **OCR Notice**: Scanned bitmap PDFs are explicitly rejected with an explanatory notice: *"OCR for scanned/bitmap documents is currently unsupported. Text extraction requires vector-encoded PDF circulars."* This prevents low-confidence hallucinations on unreadable scans.

---

### 2.7 Financial Health & Predictive Analytics (`app/services/financial_health/` & `prediction/`)
- **Recurring Subscription Detector**: Groups transactions by merchant name and identifies subscriptions via recurring keywords (`netflix`, `spotify`, `prime`, `hotstar`, `airtel`, `jio`, `gym`) or repeat frequencies ($\ge 2$ occurrences). Computes average monthly cost and annualized spend.
- **Annual Fee Breakeven Calculator**: Compares total annual card fees across the user's portfolio against earned rewards to verify whether card benefits justify ongoing maintenance costs.
- **Reward Efficiency & Opportunity Gap**: Computes historical reward yield vs. potential optimal reward if the user had used the best recommended card for each transaction.
- **Predictive Velocity Forecasting (`prediction_engine.py`)**: Computes 30-day projected spending and reward potential based on daily velocity vectors, clearly flagging results with disclaimers that projections are mathematical estimates and not guaranteed limits.

---

## 3. Concrete Data Flow Traces

### Trace A: User Adds a Credit Card
1. **Frontend Request**: User submits card details via `POST /api/v1/cards` with a Bearer JWT.
2. **Authentication**: `get_current_user` decodes token and loads `user_id`.
3. **Duplicate Check**: Query checks `credit_cards` for existing `(user_id, card_name, bank_name, last_four_digits)`. If found, returns HTTP 400.
4. **Entity Creation**: Instantiates `CreditCard` entity with metadata (`joining_fee`, `annual_fee`, `card_variant`, etc.).
5. **Reward Rules & Benefits**: Iterates through `reward_rules` and `benefits` lists in the request schema, instantiating `CardRewardRule` and `CardBenefit` linked via foreign key `card_id`.
6. **Persistence**: `db.add(card)` and `await db.commit()` write all rows atomically.
7. **Serialization**: Eagerly loads relationships and serializes to `CreditCardResponse`.

### Trace B: Optimization of ₹5,000 Dining Spend at Swiggy
1. **Frontend Request**: `POST /api/v1/optimization/recommend` with payload:
   `{"amount": 5000.00, "category_id": "dining", "merchant_name": "Swiggy", "payment_channel": "ONLINE", "language": "en"}`.
2. **Fetch User Portfolio**: Loads all active `CreditCard` records for the user including their `CardRewardRule` children.
3. **Match Active Offers**: `OfferService.get_active_offers_for_cards()` retrieves verified, non-expired offers matching "Swiggy" or "dining" for the user's banks and networks.
4. **Evaluation Loop**: `RewardOptimizationEngine.evaluate_card_for_transaction()` runs on each card:
   - Matches instant discount: Swiggy 15% offer applied (₹200 cap). Charged amount becomes ₹4,800.
   - Matches reward rule: Finds merchant rule for "Swiggy" (e.g. 5% cashback).
   - Checks min spend: ₹4,800 $\ge$ ₹500 (met).
   - Computes cashback: ₹4,800 $\times$ 5% = ₹240.00.
   - Checks caps: Per-transaction and monthly caps verified.
   - Computes total net benefit: ₹200 + ₹240 = ₹440.00 (Effective return: 8.80%).
5. **Ranking**: Cards sorted by `(-net_financial_benefit, -effective_rate_percentage, annual_fee)`.
6. **Explanation**: Grounded explanation generated explaining the instant discount, cashback calculation, and next-best alternative.
7. **Response**: Emitted as `RecommendResponse`.

### Trace C: Multilingual Assistant Query
1. **Frontend Request**: `POST /api/v1/assistant/chat` with `{"query": "Swiggy ke liye best card kaunsa hai?", "language": "hi"}`.
2. **Context Assembly**: `MultilingualAssistantService` fetches the user's cards and recent transactions.
3. **Gateway Dispatch**: Calls `PrivacyGateway.execute_request()`:
   - Task classified as `CARD_RECOMMENDATION_EXPLANATION` (`SENSITIVE`).
   - Query scrubbed by `SensitiveDataRedactor`.
   - Consent verified: checks `user_ai_consents`.
   - If consent is `False`: gateway routes immediately to local grounded engine.
   - Local engine runs `RewardOptimizationEngine` for ₹1,500 on Swiggy and returns grounded Hindi text: *"स्विगी या डाइनिंग के लिए आपका सर्वोत्तम कार्ड HDFC Millennia..."*
   - Audit log recorded in `ai_request_audit_logs` with status `LOCAL_PROCESSING`.
4. **Response**: Delivered to client with `privacy_status="LOCAL_PROCESSING_PROTECTED"` and `is_external_ai_used=False`.

### Trace D: Ingestion and Verification of a Bank Circular
1. **Upload**: Admin uploads an official HDFC PDF circular via `POST /api/v1/admin/offers/upload-circular`.
2. **Validation**: `CircularParserService.validate_pdf_bytes()` checks file size ($\le 10$ MB) and `%PDF` magic bytes. Computes SHA-256 hash.
3. **Document Staging**: Creates `AdminOfferDocument` in database.
4. **Text & Rule Extraction**: `CircularParserService` extracts text and extracts structured offer drafts with source evidence sentences.
5. **Normalization & Deduplication**: `OfferIngestionEngine` normalizes fields and computes canonical SHA-256 content hash.
6. **Staging Queue**: Inserts offer into `card_offers` with `verification_status="PENDING_REVIEW"` and `ingestion_channel="PDF_CIRCULAR"`.
7. **Audit Log**: Emits `OfferAuditLog` with action `EXTRACTED`.
8. **Admin Approval**: Admin reviews extracted evidence at `POST /api/v1/admin/offers/{offer_id}/approve`. Status transitions to `VERIFIED`. Offer is now active in user recommendations.

---

## 4. Complete Database Architecture & Inventory

The CLIQ backend defines **18 SQLAlchemy Entities** in `app/models/entities.py`.

| # | Entity / Model | Database Table Name | Primary Key | Key Relationships / Foreign Keys | Description |
|---|----------------|---------------------|-------------|----------------------------------|-------------|
| 1 | `Profile` | `profiles` | `id` (UUIDv4) | 1:M `credit_cards`, `transactions`, `documents`, `audit_logs`; 1:1 `preferences`, `ai_consent` | User account, password hash, language, role (`USER`/`ADMIN`), and active state. |
| 2 | `CreditCard` | `credit_cards` | `id` (UUIDv4) | FK `user_id` ➔ `profiles.id`; 1:M `reward_rules`, `benefits`, `transactions` | Credit card portfolio entity with fees, variants, and terms URL. |
| 3 | `CardRewardRule` | `card_reward_rules` | `id` (UUIDv4) | FK `card_id` ➔ `credit_cards.id` (CASCADE) | Reward rates, point values, categories, merchant patterns, caps, and exclusions. |
| 4 | `CardBenefit` | `card_benefits` | `id` (UUIDv4) | FK `card_id` ➔ `credit_cards.id` (CASCADE) | Lounge access, golf, insurance, annual value estimates, and terms. |
| 5 | `OfferSource` | `offer_sources` | `id` (UUIDv4) | 1:M `card_offers`, `source_failure_logs`, `admin_offer_documents` | Central registry tracking domains, permissions, health, and connector status. |
| 6 | `AdminOfferDocument` | `admin_offer_documents` | `id` (UUIDv4) | FK `source_id` ➔ `offer_sources.id`; 1:M `card_offers` | Uploaded vector PDF circulars and staging metadata. |
| 7 | `SourceFailureLog` | `source_failure_logs` | `id` (UUIDv4) | FK `source_id` ➔ `offer_sources.id` (CASCADE) | Structured error tracking for WAF blocks, robots restrictions, and timeouts. |
| 8 | `CardOffer` | `card_offers` | `id` (UUIDv4) | FK `source_id`, FK `source_document_id`; 1:M `offer_audit_logs` | Promotional merchant/bank offers with verification status and change history. |
| 9 | `OfferAuditLog` | `offer_audit_logs` | `id` (UUIDv4) | FK `offer_id` ➔ `card_offers.id` (CASCADE) | Immutable lifecycle trail for approvals, rejections, edits, and quarantines. |
| 10 | `SpendingCategory`| `spending_categories` | `id` (String) | Primary key is category string (`dining`, `grocery`, `travel`, etc.) | Localized display names (English, Hindi, Kannada) and UI icons. |
| 11 | `Transaction` | `transactions` | `id` (UUIDv4) | FK `user_id` ➔ `profiles.id`; FK `card_id` ➔ `credit_cards.id` | User spending records with actual rewards vs potential optimal rewards. |
| 12 | `UploadedDocument`| `uploaded_documents`| `id` (UUIDv4) | FK `user_id` ➔ `profiles.id`; 1:1 `extracted_card_data` | User-uploaded card application or statement documents. |
| 13 | `ExtractedCardData`| `extracted_card_data`| `id` (UUIDv4)| FK `document_id` ➔ `uploaded_documents.id`; FK `user_id` | Staged card features and reward rules pending user verification. |
| 14 | `RewardAnalysis` | `reward_analysis` | `id` (UUIDv4) | FK `user_id` ➔ `profiles.id` | Persistent log of recommendation calculations and alternative yields. |
| 15 | `UserPreference` | `user_preferences` | `id` (UUIDv4) | FK `user_id` ➔ `profiles.id` (Unique, 1:1) | User reward priority (cashback vs miles) and fee inclusion settings. |
| 16 | `AuditLog` | `audit_logs` | `id` (UUIDv4) | FK `user_id` ➔ `profiles.id` | General system audit logs for logins, card creations, and security events. |
| 17 | `UserAiConsent` | `user_ai_consents` | `id` (UUIDv4) | FK `user_id` ➔ `profiles.id` (Unique, 1:1) | Granular AI consent: external AI toggle, card context toggle, spending toggle. |
| 18 | `AiRequestAuditLog`| `ai_request_audit_logs`| `id` (UUIDv4)| FK `user_id` ➔ `profiles.id` | Privacy audit log recording task type, redactions, provider, latency, and status. |

### Initialization & Seeding (`app/main.py:init_db`)
On application startup, `lifespan` runs `init_db()`:
1. `Base.metadata.create_all`: Automatically creates missing tables.
2. Lightweight column migrations: Checks existing tables (e.g. SQLite PRAGMA table_info) and safely adds newly introduced columns without destructive re-creation.
3. Default Admin Seeding: Creates `admin@cliq.ai` (`AdminPass@123`) with `is_admin=True` and `role="ADMIN"` if not present.
4. Default Categories Seeding: Inserts 11 standard spending categories with trilingual labels (English, Hindi, Kannada).
5. Initial Offer Seeding: Populates baseline verified commercial offers via `OfferService.seed_initial_offers_if_empty()`.
6. Source Registry Seeding: Seeds the 8 standard banking and merchant sources via `SourceRegistryService.seed_default_sources()`.

---

## 5. Complete API Inventory

The CLIQ backend exposes **35 distinct REST endpoints** mounted under `/api/v1` (plus system endpoints).

| Method | Path | Tag | Description | Auth / RBAC | Request Schema | Response Schema |
|--------|------|-----|-------------|-------------|----------------|-----------------|
| `GET` | `/health` | System | Service health & DB connection check | Public | None | JSON status object |
| `GET` | `/api/v1/categories` | System | List localized spending categories | Public | None | `List[SpendingCategory]` |
| `POST` | `/api/v1/auth/register` | Authentication | Register new user account | Public | `RegisterRequest` | `TokenResponse` (200) |
| `POST` | `/api/v1/auth/login` | Authentication | Authenticate user & issue JWT | Public | `LoginRequest` | `TokenResponse` (200) |
| `GET` | `/api/v1/profile` | Authentication | Fetch authenticated user profile | Bearer JWT | None | `ProfileResponse` (200) |
| `PUT` | `/api/v1/profile` | Authentication | Update user profile information | Bearer JWT | `ProfileUpdate` | `ProfileResponse` (200) |
| `GET` | `/api/v1/cards` | Credit Cards | List all user cards with rules & benefits | Bearer JWT | Query params (`network`, `bank`) | `List[CreditCardResponse]` (200) |
| `POST` | `/api/v1/cards` | Credit Cards | Add a new credit card to portfolio | Bearer JWT | `CreditCardCreate` | `CreditCardResponse` (201) |
| `GET` | `/api/v1/cards/{id}` | Credit Cards | Retrieve a specific credit card by ID | Bearer JWT | Path `card_id` | `CreditCardResponse` (200) |
| `PUT` | `/api/v1/cards/{id}` | Credit Cards | Update credit card details, rules, benefits | Bearer JWT | `CreditCardUpdate` | `CreditCardResponse` (200) |
| `DELETE` | `/api/v1/cards/{id}` | Credit Cards | Remove a credit card from portfolio | Bearer JWT | Path `card_id` | Status 204 No Content |
| `GET` | `/api/v1/transactions` | Transactions | List user transactions with filters | Bearer JWT | Query params (`limit`, `category_id`) | `List[TransactionResponse]` (200) |
| `POST` | `/api/v1/transactions` | Transactions | Record a new financial transaction | Bearer JWT | `TransactionCreate` | `TransactionResponse` (201) |
| `DELETE` | `/api/v1/transactions/{id}` | Transactions | Delete a transaction record | Bearer JWT | Path `transaction_id` | Status 204 No Content |
| `POST` | `/api/v1/optimization/recommend` | Optimization | Compute optimal card for a transaction | Bearer JWT | `RecommendRequest` | `RecommendResponse` (200) |
| `POST` | `/api/v1/optimization/compare` | Optimization | Multi-card category yield comparison | Bearer JWT | `CompareRequest` | `CompareResponse` (200) |
| `POST` | `/api/v1/documents/upload` | Documents | Upload user card statement or circular PDF | Bearer JWT | Form Data (`UploadFile`) | `DocumentResponse` (201) |
| `GET` | `/api/v1/documents` | Documents | List uploaded user documents | Bearer JWT | None | `List[DocumentResponse]` (200) |
| `GET` | `/api/v1/documents/{id}` | Documents | Retrieve document processing status | Bearer JWT | Path `document_id` | `DocumentResponse` (200) |
| `POST` | `/api/v1/documents/{id}/verify` | Documents | Confirm staged rules & activate card | Bearer JWT | `VerifyDocumentRequest` | Status 200 OK |
| `GET` | `/api/v1/offers` | Offers | Discover verified commercial card offers | Bearer JWT | Query params (`category`, `bank`, etc.) | `List[CardOfferResponse]` (200) |
| `GET` | `/api/v1/offers/{id}` | Offers | Get offer details by ID | Bearer JWT | Path `offer_id` | `CardOfferResponse` (200) |
| `POST` | `/api/v1/offers` | Offers | User/community submission of an offer | Bearer JWT | `CardOfferCreate` | `CardOfferResponse` (201) |
| `GET` | `/api/v1/admin/offers/review-queue` | Admin Desk | List pending review / quarantined offers | Admin Only | Query param (`status_filter`) | `List[CardOfferResponse]` (200) |
| `POST` | `/api/v1/admin/offers/{id}/approve` | Admin Desk | Approve offer & publish to recommendations | Admin Only | `AdminOfferApproveRequest` | `CardOfferResponse` (200) |
| `POST` | `/api/v1/admin/offers/{id}/reject` | Admin Desk | Reject offer with documented reason | Admin Only | `AdminOfferRejectRequest` | `CardOfferResponse` (200) |
| `PUT` | `/api/v1/admin/offers/{id}` | Admin Desk | Edit offer parameters before approval | Admin Only | `AdminOfferEditRequest` | `CardOfferResponse` (200) |
| `POST` | `/api/v1/admin/offers/{id}/reverification`| Admin Desk | Trigger re-verification on suspicious offer | Admin Only | `AdminReverificationRequest` | `CardOfferResponse` (200) |
| `GET` | `/api/v1/admin/offers/{id}/audit-trail` | Admin Desk | Retrieve complete audit log history | Admin Only | Path `offer_id` | `List[OfferAuditLogResponse]` (200) |
| `POST` | `/api/v1/admin/offers/sync-discovery` | Admin Desk | Run discovery pipeline across channels | Admin Only | None | `DiscoverySyncResponse` (200) |
| `GET` | `/api/v1/admin/offers/sources` | Admin Desk | List all registered offer sources | Admin Only | None | `List[OfferSourceResponse]` (200) |
| `GET` | `/api/v1/admin/offers/sources/{id}` | Admin Desk | Get source health details & failure history | Admin Only | Path `source_id` | `OfferSourceResponse` (200) |
| `POST` | `/api/v1/admin/offers/sources/{id}/probe` | Admin Desk | Execute live resilience probe on source | Admin Only | Path `source_id` | `SourceHealthProbeResponse` (200) |
| `POST` | `/api/v1/admin/offers/sources/probe-all` | Admin Desk | Probe all sources and update health | Admin Only | None | `List[SourceHealthProbeResponse]` (200) |
| `GET` | `/api/v1/admin/offers/failures` | Admin Desk | List structured source failure logs | Admin Only | Query param (`source_id`) | `List[SourceFailureLogResponse]` (200) |
| `POST` | `/api/v1/admin/offers/upload-circular` | Admin Desk | Upload and extract bank PDF circular | Admin Only | Form Data (`UploadFile`) | `AdminOfferDocumentResponse` (201) |
| `GET` | `/api/v1/admin/offers/documents` | Admin Desk | List uploaded bank circulars | Admin Only | None | `List[AdminOfferDocumentResponse]` (200) |
| `POST` | `/api/v1/admin/offers/partner-feed` | Admin Desk | Ingest structured partner JSON feed | Admin Only | `PartnerFeedIngestRequest` | `DiscoverySyncResponse` (200) |
| `POST` | `/api/v1/admin/offers/manual` | Admin Desk | Directly register offer with audit logging | Admin Only | `ManualOfferCreateRequest` | `CardOfferResponse` (201) |
| `GET` | `/api/v1/analytics/spending` | Analytics | Category & monthly spending breakdown | Bearer JWT | Query params (`start_date`, `end_date`) | `SpendingAnalyticsResponse` (200) |
| `GET` | `/api/v1/analytics/rewards` | Analytics | Reward earnings & optimization efficiency | Bearer JWT | None | `RewardAnalyticsResponse` (200) |
| `GET` | `/api/v1/analytics/financial-health` | Analytics | Subscriptions, fee breakeven, health | Bearer JWT | None | `FinancialHealthResponse` (200) |
| `POST` | `/api/v1/assistant/chat` | AI Assistant | Privacy-governed multilingual chat query | Bearer JWT | `ChatQueryRequest` | `ChatQueryResponse` (200) |
| `GET` | `/api/v1/privacy/consent` | Privacy | Retrieve active user AI consent record | Bearer JWT | None | `AiConsentResponse` (200) |
| `PUT` | `/api/v1/privacy/consent` | Privacy | Update or revoke external AI consent | Bearer JWT | `AiConsentUpdateRequest` | `AiConsentResponse` (200) |
| `GET` | `/api/v1/privacy/audit-logs` | Privacy | Retrieve user AI request audit logs | Bearer JWT | None | `List[AiAuditLogResponse]` (200) |
| `GET` | `/api/v1/privacy/data-minimization-rules` | Privacy | List platform data classification rules | Bearer JWT | None | `List[DataMinimizationAuditItem]` (200) |

---

## 6. Testing & Quality Verification

### 6.1 Test Suite Structure
The backend test suite is organized into three distinct verification tiers under `backend/tests/`:
1. **`tests/unit/` (36 tests)**:
   - `test_reward_engine.py`: Arbitrary-precision Decimal arithmetic, merchant regex pattern matching, category accelerators, fuel surcharge exclusions, per-transaction and monthly caps, inactive card filtering, and tie-breaking algorithms.
   - `test_wallet_offers_utilization.py`: Portfolio card creation, metadata updates, benefit linkage, duplicate card prevention, and channel filtering.
   - `test_financial_health.py`: Recurring subscription detection heuristics, fee-versus-reward breakeven, and reward efficiency calculations.
   - `test_hybrid_offer_discovery.py`: Quarantining, material change detection, admin approval/rejection workflows, and live probe resilience.
   - `test_offer_ingestion_infrastructure.py`: Source registry seeding, WAF boundary handling, vector PDF parsing, duplicate prevention, and partner feeds.
   - `test_multilingual_assistant.py`: Grounded multilingual generation across English, Hindi, and Kannada.
2. **`tests/security/` (38 tests)**:
   - `test_privacy_gateway.py`: Sensitive data redactor benchmark across PAN, CVV, OTP, PIN, Aadhaar, and Tax PAN; context minimization across all four task types; consent grant/revocation cycles; and prompt injection neutralization.
   - `test_ai_data_egress_audit.py`: Synthetic payload inspection, zero-egress default verification, cross-tenant isolation, and audit log PII absence.
   - `test_security_audit.py`: Unauthenticated request rejection (401), invalid/expired JWT handling, IDOR cross-tenant data isolation, and malicious file upload validation.
   - `test_gemini_smoke_test.py`: Live endpoint smoke tests, deprecation rejection (blocking silent calls to retired `gemini-1.5-flash`), and graceful fallback during network disconnects.
   - `test_extended_audit.py`: Browser security response headers, CORS preflight options, negative monetary amount validations, and prompt injection defenses.
3. **`tests/api/` (1 test)**:
   - `test_e2e_flow.py`: Full end-to-end integration journey covering registration, card addition, transaction entry, reward recommendation, offer discovery, and analytics retrieval.

### 6.2 Test Execution Command & Verification Results
```bash
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/ -v
```
**Result**:
```
============================= 75 passed in 14.80s ==============================
```
**Pass Rate**: **100.0% (75/75 Passing, 0 Failures, 0 Warnings)**.

---

## 7. Implementation Status & Feature Matrix

| Subsystem / Capability | Implementation Status | Implementation Details | Test Coverage |
|------------------------|-----------------------|------------------------|---------------|
| **Authentication & Profile Management** | **COMPLETE** | Passlib bcrypt password hashing, JWT HMAC-SHA256 tokens, profile updates, language and currency preferences. | Verified in E2E & security suites |
| **Role-Based Access Control (RBAC)** | **COMPLETE** | `require_admin` dependency enforcing `is_admin` or `role == 'ADMIN'` across all `/admin/offers/*` endpoints. | Fully covered in unit & security tests |
| **Credit Card Wallet & Portfolio** | **COMPLETE** | Full CRUD for cards, reward rules, and benefits. Auto duplicate detection and cascading foreign keys. | Verified in `test_wallet_offers_utilization.py` |
| **Deterministic Reward Optimization Engine** | **COMPLETE** | 100% pure Python `Decimal` arithmetic. `ROUND_HALF_UP` / `ROUND_FLOOR`. Instant discounts + post-rewards, exclusions, min spends, monthly caps, and tie-breaking. | Exhaustively tested in `test_reward_engine.py` |
| **Source Registry & Access Boundary Enforcement** | **COMPLETE** | Central registry of 8 banking & merchant sources with explicit status (`BLOCKED_WAF`, `SPA_CLIENT_SIDE`, `ROBOTS_RESTRICTED`, `PUBLIC_PERMITTED`). Honors robots.txt. | Verified in `test_offer_ingestion_infrastructure.py` |
| **Adaptive Offer Ingestion (5 Channels)** | **COMPLETE** | HTML extraction, PDF circular, authorized API, admin document, and manual entry. Canonical normalization, SHA-256 deduplication, and immediate quarantine. | Verified in `test_hybrid_offer_discovery.py` |
| **Admin Offer Verification Desk** | **COMPLETE** | Review queue, approve, reject, edit, reverification trigger, and immutable snapshot audit logs. | Verified in `test_hybrid_offer_discovery.py` |
| **Privacy Gateway & Data Redactor** | **COMPLETE** | Zero-egress by default. Regex redactor for 9 PII types, task allowlist, prompt sanitization with XML tags, consent lifecycle, and audit logs. | Exhaustively tested in `test_privacy_gateway.py` |
| **Google Gemini Integration** | **COMPLETE** | Configured with modern `gemini-2.5-flash`. Blocks deprecated models (`gemini-1.5-flash`). Gracefully falls back to local engine. | Verified in `test_gemini_smoke_test.py` |
| **Multilingual Local Assistant** | **COMPLETE** | Grounded in-process responses in English, Hindi, and Kannada. Executes without external API calls or network access. | Verified in `test_multilingual_assistant.py` |
| **Vector PDF Bank Circular Parser** | **COMPLETE** | Uses `pypdf` with magic bytes and size verification. Scanned image PDFs explicitly rejected with OCR unsupported notice. | Verified in `test_offer_ingestion_infrastructure.py` |
| **Document Intelligence (Statements)** | **PARTIAL** | Basic PyMuPDF (`fitz`) text extraction and heuristic bank detection. Staged in `extracted_card_data` pending user review. Advanced multi-statement OCR not integrated. | Unit tests verify staging |
| **Financial Health & Predictive Analytics** | **COMPLETE** | Subscription detection heuristics, annual fee breakeven, reward efficiency, and velocity-based 30-day mathematical forecasting. | Verified in `test_financial_health.py` |
| **Direct Web Scraping of Protected Portals** | **INTENTIONALLY BLOCKED** | Direct headless scraping of Akamai/Cloudflare protected bank portals (HDFC, SBI, Zomato) is blocked by design to respect terms of service and security boundaries. Circular ingestion and admin manual entry used instead. | Verified in source registry probes |

---

## 8. Architectural Observations, Strengths & Insights

### 8.1 Key Architectural Strengths
1. **Mathematical Integrity Over Probabilistic Hallucination**:
   By restricting the Gemini LLM to linguistic summarization and conversational explanation while leaving all calculations to the `RewardOptimizationEngine`, CLIQ guarantees that users never receive fabricated cashback numbers or fictional financial figures.
2. **Defensive AI Engineering**:
   The `PrivacyGateway` is not merely a utility; it is a strict structural gateway. Even if an engineer attempts to pass a prompt with an embedded credit card number, the redactor intercepts and scrubs the 16 digits before the HTTP payload is ever dispatched to Google's servers.
3. **Respect for Web Boundaries & Compliance**:
   Rather than using brittle headless browser workarounds or proxy rotators to scrape banking portals protected by WAFs or disallowed by `robots.txt`, CLIQ explicitly categorizes sources as `BLOCKED_WAF` or `ROBOTS_RESTRICTED` and leverages structured official circulars and partner feeds.
4. **Resilient Local Fallback**:
   The assistant continues to function seamlessly in three languages (English, Hindi, Kannada) even if Google's Gemini API is unreachable, unconfigured, or if the user denies external AI consent.
5. **Auditability**:
   Every state transition in an offer's lifecycle is captured in `OfferAuditLog` with before/after JSON snapshots, ensuring full transparency in financial recommendations.

### 8.2 Pragmatic Engineering Decisions
- **Unified SQLite / PostgreSQL Compatibility**: Using SQLAlchemy 2.0 with standard ANSI types (`Numeric`, `String`, `DateTime`, `Boolean`) and handling SQLite alter table semantics in `init_db()` provides a frictionless local development experience while allowing instantaneous deployment to Supabase PostgreSQL without code alterations.
- **JSON Column Storage for Dynamic Metadata**: Storing `eligible_card_names_json`, `change_history_json`, and `redacted_types_json` as validated JSON strings enables rich schema agility while retaining relational foreign key constraints on core entities.
- **Explicit Deprecation Traps**: Coding runtime assertions that actively block retired models (e.g. `gemini-1.5-flash`) ensures the production codebase does not silently degrade to broken endpoints.

---

## 9. Conclusion

The CLIQ backend is a robust, production-grade fintech system. Its 75 passing automated tests confirm that its deterministic reward engine, privacy gateway, offer intelligence pipelines, and security controls are thoroughly verified, structurally sound, and ready for high-performance operation.

