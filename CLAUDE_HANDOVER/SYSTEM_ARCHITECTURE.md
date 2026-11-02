# CLIQ — System Architecture & Data Flow

This document details the complete end-to-end system architecture, component boundaries, execution lifecycles, and security gates of the CLIQ platform.

---

## 1. High-Level Architectural Blueprint

```mermaid
graph TB
    subgraph Client_Layer ["Client Presentation Layer (Next.js 14 App Router)"]
        UI_Pages[20 Application Screens]
        Auth_State[Auth Context & Session Manager]
        I18n_Engine[Tri-lingual Localization Dictionary]
        UI_Components[Liquid Glass UI & Lucide Icons]
    end

    subgraph Security_Gate ["API Gateway & Security Middleware"]
        CORS[CORS Policy Middleware]
        SecHeaders[Security Headers Middleware]
        RateLimiter[In-Memory Rate Limiter - 60 req/min]
        AuthMiddleware[JWT Bearer Token Validator]
    end

    subgraph Service_Tier ["FastAPI Application Services (Python 3.12)"]
        Router_Auth[Auth & Profile Router]
        Router_Cards[Credit Cards Router]
        Router_Txn[Transactions & CSV Router]
        Router_Incomes[Incomes & Cash Flow Router]
        Router_Opt[Optimization Router]
        Router_Health[Financial Health & Analytics Router]
        Router_Offers[Offers & Discovery Router]
        Router_Admin[Admin Verification Desk]
        Router_Edu[CLIQ Learn & Budget Router]
        Router_Priv[Privacy & Consent Router]
        Router_Assist[AI Assistant Router]
    end

    subgraph Business_Engines ["Deterministic Core Engines"]
        RewardEngine[Deterministic Reward Engine]
        HealthEngine[Financial Health Radar Engine]
        MerchantNorm[Merchant Normalizer & Category Classifier]
        CSVEngine[CSV Statement Parser & Deduplication]
        EduCalculators[Financial Inclusion Calculators]
    end

    subgraph Privacy_Boundary ["Privacy & AI Boundary"]
        PrivacyGateway[Regex PII Redactor & Task Gate]
        ConsentLedger[User AI Consent Ledger]
        AIAuditLog[AI Request Audit Logger]
    end

    subgraph External_AI ["External AI Provider"]
        GeminiAPI[Google Gemini 2.5 Flash API - Direct HTTPX REST]
    end

    subgraph Persistence_Tier ["Data & Persistence Layer"]
        SQLAlchemy[SQLAlchemy 2.0 Async ORM]
        Postgres[(PostgreSQL 15+ / SQLite 3 Async)]
        Alembic[Alembic Migration Engine]
    end

    %% Connections
    Client_Layer -->|HTTPS / JSON REST| Security_Gate
    Security_Gate --> Service_Tier

    Service_Tier --> Business_Engines
    Service_Tier --> Privacy_Boundary
    Privacy_Boundary --> External_AI

    Service_Tier --> SQLAlchemy
    Business_Engines --> SQLAlchemy
    SQLAlchemy --> Postgres
```

---

## 2. Component Boundaries & Responsibilities

### 2.1 Client Presentation Layer
- **Framework:** Next.js 14.2.4 using the App Router.
- **Rendering Model:** Prerendered static client layouts (`"use client"`) communicating with FastAPI over HTTPS via standard `fetch`.
- **Authentication State:** Client-side bearer token synchronization in `localStorage` backed by custom window event dispatchers (`auth-state-change`) to prevent out-of-sync session state across tabs and navigation events.
- **Styling:** Tailwind CSS with a modern design system ("Liquid Glass" aesthetic, semi-transparent frosted cards, refined dark mode contrast, zero generic UI templates).
- **Internationalization:** In-memory translation dictionary (`frontend/lib/translations.ts`) delivering instantaneous zero-network language switching across English, Hindi, and Kannada.

### 2.2 Security Gateway & Middleware
Every inbound HTTP request to the FastAPI backend traverses a pipeline of three middlewares defined in `backend/app/security/middleware.py`:
1. **`SecurityHeadersMiddleware`:**
   - Injects `X-Content-Type-Options: nosniff`.
   - Injects `X-Frame-Options: DENY`.
   - Injects `X-XSS-Protection: 1; mode=block`.
   - Injects `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
   - Injects strict `Content-Security-Policy`.
   - Injects `Referrer-Policy: strict-origin-when-cross-origin`.
2. **`RateLimitMiddleware`:**
   - Enforces a sliding-window rate limit configured via `RATE_LIMIT_PER_MINUTE` (config.py default: **600 req/min**; `.env.example` local override: **120 req/min**).
   - Returns HTTP 429 Too Many Requests upon limit exhaustion.
3. **`CORSMiddleware`:**
   - Restricts cross-origin resource sharing to trusted origins configured in `settings.cors_origins`.

### 2.3 Service Layer & Domain Isolation
The business logic is partitioned cleanly into dedicated domain services:
- **`app.services.reward_optimization.engine`:** Pure deterministic mathematical calculation of credit card rewards. Never delegates calculation to an external API.
- **`app.services.financial_health.health_engine`:** Multi-factor financial health score (0 to 100) combining savings rate, expense-to-income ratio, recurring subscription burden, and credit utilization.
- **`app.services.statement_parser.csv_parser`:** Bank-specific CSV dialect parser with canonical schema normalization.
- **`app.services.statement_parser.deduplication`:** SHA-256 fingerprinting for transaction deduplication.
- **`app.services.education.calculators`:** Mathematical engines powering the 5 CLIQ Learn financial inclusion calculators.
- **`app.services.offers.discovery_pipeline`:** Multi-source offer ingestion pipeline supporting HTML scraping, partner API feeds, and manual administrative uploads.

---

## 3. Request Execution Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser (Next.js)
    participant Sec as Security Middleware
    participant Auth as Auth Dependency (get_current_user)
    participant Router as API Router (FastAPI)
    participant Engine as Deterministic Engine
    participant DB as Database (SQLAlchemy Async)

    User->>Sec: POST /api/v1/transactions (Bearer JWT + Payload)
    Sec->>Sec: Verify Rate Limit & Inject Security Headers
    Sec->>Auth: Decode JWT & Validate Expiration
    Auth->>DB: Fetch Profile by user_id
    DB-->>Auth: Profile Record (Active, Validated)
    Auth-->>Router: Inject current_user
    Router->>Engine: Resolve Merchant & Normalize Category
    Engine-->>Router: Canonical Merchant & Category Hint
    Router->>Router: DEF-01 Payment Method & Card Isolation
    Router->>DB: Insert Transaction Record
    DB-->>Router: Transaction Persisted
    Router-->>User: HTTP 201 Created (TransactionResponse JSON)
```

---

## 4. Privacy Gateway & AI External Boundary

When a user interacts with the AI Assistant (`POST /api/v1/assistant/chat`), the request never goes directly to Google Gemini:

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Assistant as Assistant Router
    participant Consent as Consent Ledger
    participant Gateway as Privacy Gateway
    participant Gemini as Google Gemini 1.5 Flash
    participant Audit as AI Audit Log

    User->>Assistant: "Why did my electricity bill increase?"
    Assistant->>Consent: Check user_ai_consents (external_ai_enabled)
    alt Consent Denied
        Consent-->>Assistant: External AI Disabled
        Assistant-->>User: Return Local Template Response
    else Consent Granted
        Assistant->>Gateway: Sanitize & Classify Payload
        Gateway->>Gateway: Regex PII Redaction (Aadhaar, PAN, Cards, Phone, Email, UPI)
        Gateway->>Gateway: Check Task Allowlist (FINANCIAL_ADVICE, EXPLAINABILITY)
        Gateway->>Audit: Record Request Metadata (Tokens, Redaction Count, Latency)
        Gateway->>Gemini: Send Sanitized Context Prompt
        Gemini-->>Gateway: Plain-Language Financial Guidance
        Gateway-->>Assistant: Assistant Response
        Assistant-->>User: HTTP 200 OK (Multilingual Guidance)
    end
```

---

## 5. Persistence & Database Tier

- **ORM:** SQLAlchemy 2.0 using the `AsyncSession` pattern (`async with AsyncSessionLocal() as session:`).
- **Driver Abstraction:**
  - Production: `postgresql+asyncpg://...` (Supabase, AWS RDS, GCP Cloud SQL).
  - Local Development / Test: `sqlite+aiosqlite:///...` with seamless async compatibility.
- **Schema Migrations:** Managed exclusively through Alembic version scripts in `backend/alembic/versions/`. Runtime table manipulation is strictly prohibited.
- **Tenant Isolation:** Enforced via `WHERE user_id = current_user.id` on every query across transactions, incomes, credit cards, documents, budgets, and learning progress.

