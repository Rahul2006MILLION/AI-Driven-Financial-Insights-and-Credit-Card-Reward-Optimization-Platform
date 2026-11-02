# CLIQ — Comprehensive System Architecture & Multi-Tier Design
## Universal Financial Intelligence Architecture

> **Release Target:** v0.4.0 Blueprint  
> **Applicable Stack:** Next.js 14 App Router (Frontend) · FastAPI Python 3.12 (Backend) · SQLAlchemy 2.0 Async · Supabase PostgreSQL / SQLite  
> **Core Paradigms:** Dual-Pathway User Flow · Shared Intelligence Core · Zero-Trust Multi-Tenancy · Privacy Gateway

---

## 1. High-Level Architectural Blueprint

CLIQ is architected as an asynchronous, decoupled, multi-tier platform serving both credit-card holders and no-credit-card users through a single, shared intelligence kernel.

```mermaid
flowchart TD
    subgraph PresentationTier [Layer 1: Unified Presentation Tier - Next.js 14 App Router]
        ClientApp["23+ Connected Client & Server Screens\nPath A: /cards, /optimization, /offers\nPath B: /budget, /emergency, /resilience\nShared: /dashboard, /transactions, /scam-shield, /documents, /benefits, /learn, /assistant"]
        AuthContext["AuthContext: JWT Lifecycle & LocalStorage Session Engine"]
        LangContext["LanguageContext: Multilingual Support (EN / HI / KN / TA / TE / MR / BN / GU)"]
        UIElements["Liquid Glass Aesthetic Tokens (#040707, Cyan/Purple Glow)\nFramer Motion 3D Card Stack & Recharts Interactive Visualizers"]
    end

    subgraph APITier [Layer 2: API & Gateway Tier - FastAPI Python 3.12]
        APIRouters["Modular API Routers (68+ Route-Method Operations)\n/auth · /cards · /transactions · /optimization · /documents\n/education · /privacy · /offers · /admin · /incomes · /scam-shield · /benefits"]
        SecurityMW["Security Headers Middleware · CORS Origin Filter · Slowapi Rate Limiter"]
        AuthGuard["JWT Dependency Injection (get_current_user / require_admin)"]
        Validation["Pydantic v2 Schema Encoders & Strict Type Validators"]
    end

    subgraph SharedServicesTier [Layer 3: Shared Financial Intelligence Services Kernel]
        RewardEng["Deterministic Reward Optimization Engine\n(Arbitrary-Precision Decimal Math · Caps · Exclusions)"]
        HealthEng["Financial Health & Resilience Engine\n(Savings Ratio · Debt Burden · Cadence Analysis · Rolling Median)"]
        ScamShield["Financial Scam Shield Engine\n(NLP Normalizer · Indicator Matcher · Grounded Risk Explainer)"]
        DocIntel["Financial Document Intelligence Engine\n(PDF/OCR Parser · Loan Entity Extractor · Interest Analyzer)"]
        EmergIntel["Emergency Intelligence Engine\n(Cash-Flow Shortfall Projector · Expense Adjustment Modeler)"]
        BenefitsNav["Financial Benefits Navigator\n(Verified Government Schemes · Eligibility Matcher · Freshness Monitor)"]
        PrivacyGW["Centralized Privacy Gateway\n(9-Rule PII Redaction Pipeline · Task Allowlist Gatekeeper)"]
        AssistantEng["CLIQ Financial Translator & Assistant\n(Grounded Gemini 2.5 Flash SDK · Jargon Simplifier · Fallback)"]
        ExplainEng["Universal Explainability Engine\n(CalculationStep Traces · Rejection Enums · Epistemic Tags)"]
    end

    subgraph DataTier [Layer 4: Data & Persistence Tier]
        SQLA["SQLAlchemy 2.0 Async Session Factory (async_sessionmaker)"]
        PoolMgr["asyncpg Connection Pool (pool_size=10, max_overflow=20, SSL Require)"]
        DB[(Cloud Supabase PostgreSQL / Local Test SQLite)]
        RLS["Tenant Ownership Enforcer (WHERE user_id = current_user.id)"]
    end

    ClientApp -->|HTTPS / JSON REST API| APIRouters
    APIRouters --> SecurityMW --> AuthGuard --> Validation
    Validation --> SharedServicesTier
    PrivacyGW --> AssistantEng
    AssistantEng -->|Sanitized Prompt| ExternalAI[Google Gemini 2.5 Flash API]
    SharedServicesTier --> ExplainEng
    SharedServicesTier --> SQLA --> PoolMgr --> RLS --> DB
```

---

## 2. Two-Pathway User Journeys

### 2.1 Pathway A: Credit Card User Journey

```mermaid
sequenceDiagram
    autonumber
    actor User as Credit Card User
    participant Frontend as Next.js 14 Client
    participant API as FastAPI Backend
    participant Engine as Reward & Health Engines
    participant DB as Supabase PostgreSQL

    User->>Frontend: Onboards with Credit Cards
    Frontend->>API: POST /api/v1/cards (Adds HDFC Regalia, Axis Ace)
    API->>DB: Persist cards & reward rules (user_id scoped)
    User->>Frontend: Plans ₹5,000 Dining spend at Zomato
    Frontend->>API: POST /api/v1/optimization/recommend
    API->>Engine: Evaluate cards for ₹5,000 Dining
    Engine->>Engine: Deterministic multiplier & cap calculation
    Engine-->>API: Winning Card: HDFC Regalia (₹250 yield, 5x Accelerator)
    API-->>Frontend: Display recommendation + CalculationStep trace
    User->>Frontend: Uploads monthly credit card statement PDF
    Frontend->>API: POST /api/v1/documents/upload
    API->>DB: Ingest statement, stage in extracted_card_data for review
```

### 2.2 Pathway B: No-Credit-Card User Journey

```mermaid
sequenceDiagram
    autonumber
    actor User as No-Credit-Card User (e.g. Freelancer/Student)
    participant Frontend as Next.js 14 Client
    participant API as FastAPI Backend
    participant Engine as Cash-Flow & Resilience Engines
    participant DB as Supabase PostgreSQL

    User->>Frontend: Onboards: Selects "No Credit Cards / Cash & UPI"
    Frontend->>API: POST /api/v1/profile (Sets pathway = NO_CARD)
    User->>Frontend: Records monthly income (₹25,000 irregular)
    Frontend->>API: POST /api/v1/incomes (amount: 25000, source: "Freelance", frequency: "IRREGULAR")
    API->>DB: Save income record
    User->>Frontend: Imports or enters UPI/cash transactions
    Frontend->>API: POST /api/v1/transactions
    API->>DB: Store transactions (card_id = NULL)
    User->>Frontend: Checks Emergency Intelligence
    Frontend->>API: GET /api/v1/emergency/project-shortfall
    API->>Engine: Compute projected gap: Income ₹25,000 vs Bills ₹27,000
    Engine-->>API: Shortfall = ₹2,000; Suggests 2 non-essential expense adjustments
    API-->>Frontend: Display cash-flow gap & practical adjustment sliders
    User->>Frontend: Explores CLIQ Learn Credit Readiness
    Frontend->>API: GET /api/v1/education/modules/credit-readiness
```

---

## 3. End-to-End Sequence Flows for Advanced Intelligence Services

### 3.1 Financial Scam Shield Analysis Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Frontend as Scam Shield UI (/scam-shield)
    participant API as FastAPI Scam Shield Router
    participant Shield as Scam Shield Service
    participant Gateway as Centralized Privacy Gateway
    participant LLM as Google Gemini 2.5 Flash

    User->>Frontend: Pastes suspicious SMS: "Dear Customer, your loan of Rs 50,000 is approved. Pay Rs 999 fee to UPI: fastloan@upi"
    Frontend->>API: POST /api/v1/scam-shield/analyze<br/>{text: "...", source_channel: "SMS"}
    API->>Gateway: Sanitize user PII (names, phone numbers)
    Gateway-->>API: Sanitized text
    API->>Shield: analyze_message(sanitized_text)
    Shield->>Shield: Rule 1: Flag upfront processing fee demand ("Pay Rs 999 fee")
    Shield->>Shield: Rule 2: Flag unverified UPI payment instruction ("fastloan@upi")
    Shield->>Shield: Rule 3: Flag urgency/unsolicited approval ("approved immediately")
    Shield->>Shield: Compute Risk Level: HIGH_RISK (Score: 88/100)
    API->>Gateway: Prepare prompt with extracted risk indicators for plain-language explanation
    Gateway->>LLM: Dispatch grounded prompt to Gemini 2.5 Flash
    LLM-->>API: Structured explanation + verification steps
    API-->>Frontend: 200 OK: {risk_level: "HIGH_RISK", indicators: [...], evidence: [...], explanation: "..."}
    Frontend-->>User: Visual warning banner, verbatim evidence highlights, and official RBI verification advice
```

### 3.2 Financial Document Intelligence Loan Extraction Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Frontend as Document Inspector UI (/documents)
    participant API as FastAPI Documents Router
    participant Parser as Document Intelligence Service
    participant Calc as Deterministic Loan Calculator
    participant DB as Supabase PostgreSQL

    User->>Frontend: Uploads loan sanction letter or agreement (PDF)
    Frontend->>API: POST /api/v1/documents/upload-loan (multipart/form-data)
    API->>API: Validate file MIME type (application/pdf) & size (<10MB)
    API->>Parser: extract_loan_entities(pdf_bytes)
    Parser->>Parser: Extract text coordinates via pypdf
    Parser->>Parser: Regex & NLP extraction: Principal (₹2,00,000), Rate (18% Flat), Tenure (24 months), Processing Fee (₹4,000)
    Parser->>Calc: compute_true_apr_and_schedule(principal, flat_rate=18, tenure=24)
    Calc->>Calc: Convert Flat Rate to Effective Reducing Balance APR (18% Flat ≈ 32.8% APR!)
    Calc->>Calc: Compute total repayment: Principal ₹2,00,000 + Interest ₹72,000 + Fee ₹4,000 = ₹2,76,000
    Calc-->>Parser: Complete financial breakdown with exact formula provenance
    Parser-->>API: Extracted document terms + page evidence + true APR analysis
    API->>DB: Store record under staged document review
    API-->>Frontend: 200 OK: Side-by-side display: "Bank states 18% Flat, but true cost is 32.8% APR"
```

---

## 4. Database Implications & Data Ownership Model

CLIQ enforces strict row-level tenant isolation across all tables. No query may execute without scoping to the authenticated user's ID.

```mermaid
erDiagram
    PROFILES ||--o{ CREDIT_CARDS : owns
    PROFILES ||--o{ INCOMES : earns
    PROFILES ||--o{ TRANSACTIONS : executes
    PROFILES ||--o{ USER_BUDGETS : sets
    PROFILES ||--o{ UPLOADED_DOCUMENTS : uploads
    PROFILES ||--o{ USER_LEARNING_PROGRESS : completes
    PROFILES ||--o{ USER_AI_CONSENTS : configures
    PROFILES ||--o{ SCAM_ANALYSIS_LOGS : performs
    PROFILES ||--o{ EMERGENCY_PLANS : saves

    CREDIT_CARDS ||--o{ CARD_REWARD_RULES : defines
    CREDIT_CARDS ||--o{ CARD_BENEFITS : provides
    CREDIT_CARDS ||--o{ TRANSACTIONS : associates
    
    SPENDING_CATEGORIES ||--o{ TRANSACTIONS : classifies
    UPLOADED_DOCUMENTS ||--o| EXTRACTED_CARD_DATA : stages
    OFFER_SOURCES ||--o{ CARD_OFFERS : aggregates
```

### Schema Extensions: Implemented & Roadmap Capabilities

1. **`incomes` Table (Implemented in Phase 3):**
   - `id` (VARCHAR(36), PK): UUID v4 identifier.
   - `user_id` (VARCHAR(36), FK -> `profiles.id`, Indexed, Cascade Delete): Tenant owner.
   - `source_name` (VARCHAR(128), Not Null): e.g. "Monthly Salary", "Freelance Design", "Rental".
   - `amount` (NUMERIC(12, 2), Not Null): Cycle earnings in INR.
   - `currency` (VARCHAR(3), Default 'INR', Not Null).
   - `frequency` (VARCHAR(32), Default 'MONTHLY', Not Null): 'MONTHLY', 'BI_WEEKLY', 'WEEKLY', 'IRREGULAR', 'ONE_TIME'.
   - `is_irregular` (BOOLEAN, Default False, Not Null): Identifies variable contractor income.
   - `received_date` (DATE, Not Null, Indexed `ix_incomes_received_date`): Exact receipt date for monthly aggregation.
   - `expected_date` (DATE, Nullable): Future expected cash flow.
   - `notes` (VARCHAR(255), Nullable): Optional metadata.
   - `created_at` / `updated_at` (TIMESTAMP).

2. **`scam_analysis_logs` Table (Roadmap Phase 4):**
   - `id` (VARCHAR(36), PK)
   - `user_id` (VARCHAR(36), FK -> `profiles.id`, Indexed, Cascade Delete)
   - `source_channel` (VARCHAR(32), Not Null): 'SMS', 'WHATSAPP', 'ADVERTISEMENT', 'LOAN_OFFER'
   - `risk_level` (VARCHAR(32), Not Null): 'HIGH_RISK', 'SUSPICIOUS', 'NEEDS_VERIFICATION', 'NO_OBVIOUS_INDICATORS'
   - `risk_score` (INTEGER, Not Null): 0–100
   - `detected_indicators_json` (TEXT, Not Null): Serialized indicator array
   - `sanitized_snippet` (VARCHAR(255), Not Null): Non-PII snippet for audit
   - `timestamp` (TIMESTAMP, Default UTC Now, Not Null)

3. **`government_schemes` Table:**
   - `id` (VARCHAR(64), PK): e.g. "pmjdy", "pmsby", "pmjjby", "mudra_shishu"
   - `scheme_name_en` / `scheme_name_hi` / `scheme_name_kn` (VARCHAR(255), Not Null)
   - `category` (VARCHAR(64), Not Null): 'INSURANCE', 'BANKING', 'PENSION', 'BUSINESS_LOAN'
   - `eligibility_criteria_json` (TEXT, Not Null): Age limits, income ceiling, occupation
   - `required_documents_json` (TEXT, Not Null): List of required documents
   - `benefit_description` (TEXT, Not Null)
   - `official_portal_url` (VARCHAR(512), Not Null)
   - `last_verified_at` (TIMESTAMP, Not Null)

4. **`emergency_plans` Table:**
   - `id` (VARCHAR(36), PK)
   - `user_id` (VARCHAR(36), FK -> `profiles.id`, Unique, Cascade Delete)
   - `target_emergency_months` (INTEGER, Default 3, Not Null)
   - `monthly_essential_expense` (NUMERIC(12, 2), Not Null)
   - `current_emergency_savings` (NUMERIC(12, 2), Default 0.00, Not Null)
   - `recommended_reserve_target` (NUMERIC(12, 2), Not Null)
   - `created_at` / `updated_at` (TIMESTAMP)

---

## 5. Reconciled API Endpoint Boundaries

CLIQ's API currently hosts **68 route-method operations** across 11 functional domains. The architectural expansion organizes new capabilities into clean, dedicated routers under `/api/v1/`:

| Router Domain | Current Status | Endpoints Count | Key Operations |
| :--- | :---: | :---: | :--- |
| **Auth & Profile (`/auth`, `/profile`)** | Implemented | 5 | Register, Login, Me, Profile GET/PUT |
| **Credit Cards (`/cards`)** | Implemented | 5 | List, Create, Get, Update, Delete |
| **Transactions (`/transactions`)** | Implemented | 8 | CRUD, CSV Preview, CSV Commit, Feedback |
| **Optimization (`/optimization`)** | Implemented | 3 | Recommend Card, Simulate, Compare |
| **Analytics (`/analytics`)** | Implemented | 3 | Spending, Rewards, Financial Health |
| **Assistant (`/assistant`)** | Implemented | 1 | Chat (Gemini 2.5 Flash + Privacy GW) |
| **Privacy (`/privacy`)** | Implemented | 4 | Consent GET/PUT, Audit Logs, Data Rules |
| **Documents (`/documents`)** | Implemented | 4 | Upload, List, Get, Verify |
| **Offers (`/offers`)** | Implemented | 3 | Public Deals, Create, Get |
| **Admin Offers (`/admin/offers`)** | Implemented | 16 | Review Queue, Approve, Reject, Sources, Probes |
| **Education & Learn (`/education`)** | Implemented | 14 | Modules, Lessons, Quizzes, Calculators (5), Budgets |
| **System (`/health`, `/categories`)** | Implemented | 2 | Health check, Category catalog |
| **Incomes & Cash Flow (`/incomes`)** | *Phase 3 Architecture* | 4 | Incomes CRUD, Irregular Income Forecast |
| **Scam Shield (`/scam-shield`)** | *Phase 4 Architecture* | 3 | Analyze Text, Risk Criteria, Report Sample |
| **Emergency & Resilience (`/emergency`)**| *Phase 6 Architecture* | 3 | Project Shortfall, Resilience Profile, Scenarios |
| **Benefits Navigator (`/benefits`)** | *Phase 8 Architecture* | 3 | List Schemes, Check Eligibility, Scheme Detail |

---

## 6. Security, Privacy & Audio Processing Boundaries

1. **Audio & Voice Processing Boundary (CLIQ Financial Translator):**
   - Speech recognition utilizes client-side Web Speech API wherever supported by the browser, ensuring audio never leaves the user's device.
   - For server-side speech recognition fallbacks, ephemeral in-memory processing is enforced: audio buffers are decoded, transcribed to text, scrubbed through the Privacy Gateway, and immediately purged from RAM without persisting to disk.
   - Voice assistance requires explicit, revocable user permission (`allow_voice_input`).
2. **Scam Shield Text Privacy:**
   - The user must explicitly paste message text into the Scam Shield input field. CLIQ **never** runs background daemons that silently read device SMS or WhatsApp databases.
   - Raw pasted messages are scrubbed of personal phone numbers, receiver names, and personal UPI handles before being logged or explained.
3. **Document Access Isolation:**
   - Uploaded PDF statements and loan sanction letters are stored in private directories or private Supabase storage buckets with restricted read permissions strictly verifying `document.user_id == current_user.id`.
