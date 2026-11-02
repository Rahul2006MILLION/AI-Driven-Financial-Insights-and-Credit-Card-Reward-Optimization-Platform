# CLIQ — Backend Architecture & Service Catalog

This document details the internal organization, service catalog, security dependencies, and domain boundaries of the FastAPI backend.

---

## 1. Directory Structure Overview

The backend code is situated under `CLIQ/backend/` and organized into standard micro-modular layers:

```
backend/
├── alembic.ini                   # Alembic migration configuration
├── alembic/                      # Database migration scripts
│   ├── env.py
│   └── versions/                 # Versioned migration files
├── app/
│   ├── main.py                   # FastAPI entrypoint, lifespan, router mounting
│   ├── core/
│   │   ├── config.py             # Pydantic BaseSettings environment configuration
│   │   └── database.py           # SQLAlchemy async engine, sessionmaker, Base
│   ├── security/
│   │   ├── dependencies.py       # Auth dependencies (get_current_user, get_current_admin)
│   │   ├── jwt.py                # JWT creation, decoding, token validation
│   │   ├── middleware.py         # SecurityHeadersMiddleware & RateLimitMiddleware
│   │   └── password.py           # Bcrypt password hashing and verification
│   ├── models/
│   │   ├── __init__.py
│   │   └── entities.py           # 21 SQLAlchemy declarative models
│   ├── schemas/                  # Pydantic v2 validation models
│   │   ├── analytics.py
│   │   ├── assistant.py
│   │   ├── auth.py
│   │   ├── card.py
│   │   ├── document.py
│   │   ├── education.py
│   │   ├── income.py
│   │   ├── offer.py
│   │   ├── optimization.py
│   │   ├── privacy.py
│   │   └── transaction.py
│   ├── api/v1/                   # FastAPI APIRouters
│   │   ├── analytics.py
│   │   ├── assistant.py
│   │   ├── auth.py
│   │   ├── cards.py
│   │   ├── documents.py
│   │   ├── education.py
│   │   ├── incomes.py
│   │   ├── offers.py
│   │   ├── optimization.py
│   │   ├── privacy.py
│   │   └── transactions.py
│   └── services/                 # Pure domain business logic & calculators
│       ├── document_intelligence/
│       ├── education/
│       ├── financial_health/
│       ├── language_intelligence/
│       ├── offers/
│       ├── prediction/
│       ├── privacy/
│       ├── reward_optimization/
│       └── statement_parser/
├── pytest.ini                    # Pytest configuration
├── requirements.txt              # Production and testing Python dependencies
└── tests/                        # Automated backend test suites
```

---

## 2. Core Infrastructure Modules

### 2.1 Configuration (`app/core/config.py`)
- Employs Pydantic's `BaseSettings` (`Settings`) to load environment variables safely.
- **Critical Settings:**
  - `DATABASE_URL`: Async connection string (`postgresql+asyncpg://...` or `sqlite+aiosqlite://...`).
  - `SECRET_KEY`: Used for signing JWT access tokens (HS256).
  - `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiration window (default: 60 minutes).
  - `GEMINI_API_KEY`: Google Gemini API credentials.
  - `CORS_ORIGINS`: Comma-separated list of allowed origins.
  - `RATE_LIMIT_PER_MINUTE`: Request quota per IP (default: 60).
  - `ENVIRONMENT`: `development`, `testing`, or `production`.

### 2.2 Database Initialization (`app/core/database.py`)
- Provides `engine = create_async_engine(db_url, **engine_kwargs)`.
- Defines `AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)`.
- Yields sessions via FastAPI dependency `get_db()`.
- Supports SQLite pooling configurations for unit testing and connection pooling for PostgreSQL.

---

## 3. Security & Authentication Layer

### 3.1 Password Management (`app/security/password.py`)
- Uses `passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")`.
- Functions: `verify_password(plain_password, hashed_password) -> bool`, `get_password_hash(password) -> str`.

### 3.2 Token Operations (`app/security/jwt.py`)
- Standard JWT (JSON Web Token) using `python-jose` with `HS256`.
- Payloads carry `sub` (user profile ID), `email`, `role`, and `exp`.

### 3.3 Security Dependencies (`app/security/dependencies.py`)
- **`get_current_user`:**
  - Extracts Bearer token from the `Authorization` header.
  - Validates signature and expiration; raises HTTP 401 if invalid.
  - Loads the active `Profile` record from the database.
  - Verifies `profile.is_active is True`.
- **`get_current_admin`:**
  - Composes on `get_current_user`.
  - Asserts `user.role == "ADMIN"` or `user.is_admin is True`.
  - Raises HTTP 403 Forbidden if the user lacks administrative clearance.

---

## 4. API Routers Catalog

| Router Module | Route Prefix | Primary Purpose | Auth Scope |
| :--- | :--- | :--- | :--- |
| `api.v1.auth` | `/api/v1/auth` & `/api/v1/profile` | User registration, login, profile retrieval, profile updates. | Public / Authenticated |
| `api.v1.cards` | `/api/v1/cards` | Credit card CRUD, benefit association, rule inspection. | Authenticated (Tenant-isolated) |
| `api.v1.transactions` | `/api/v1/transactions` | Transaction CRUD, CSV preview, CSV commit, feedback. | Authenticated (Tenant-isolated) |
| `api.v1.incomes` | `/api/v1/incomes` | Income streams CRUD, 90-day rolling median summary. | Authenticated (Tenant-isolated) |
| `api.v1.optimization` | `/api/v1/optimization` | Real-time card recommendation, multi-card comparison, spend simulation. | Authenticated |
| `api.v1.analytics` | `/api/v1/analytics` | Financial health score, rewards yield, spending breakdowns. | Authenticated (Tenant-isolated) |
| `api.v1.assistant` | `/api/v1/assistant` | Multilingual financial guidance and advisory chat. | Authenticated (Privacy-gated) |
| `api.v1.offers` | `/api/v1/offers` & `/api/v1/admin/offers` | Discovered bank offers for users; review queue, manual entry, PDF upload for admins. | Authenticated / Admin Only |
| `api.v1.documents` | `/api/v1/documents` | Statement/circular document uploads and verification. | Authenticated (Tenant-isolated) |
| `api.v1.privacy` | `/api/v1/privacy` | AI consent toggles, data minimization rules, audit logs. | Authenticated (Tenant-isolated) |
| `api.v1.education` | `/api/v1/education` | CLIQ Learn modules, 5 calculators, learning progress. | Authenticated |

---

## 5. Domain Business Services

### 5.1 Reward Optimization Engine (`app/services/reward_optimization/engine.py`)
- **Responsibility:** Deterministic reward calculation across cards, merchant categories, and promotional rules.
- **Key Method:** `RewardOptimizationEngine.recommend_best_card(db, user_id, amount, category_id, merchant_name)`.
- **Arithmetic:** Pure `Decimal` precision. Handles:
  - Base reward rate vs category multiplier.
  - Merchant regex matching (e.g., Swiggy, Amazon, Uber).
  - Transaction-level reward caps.
  - Monthly category spending caps.
  - Point-to-monetary conversion factors.

### 5.2 Financial Health Engine (`app/services/financial_health/health_engine.py`)
- **Responsibility:** Comprehensive 0–100 financial health radar score.
- **Key Method:** `FinancialHealthEngine.compute_health_score(db, user_id)`.
- **Component Breakdown:**
  - *Savings Rate Score (0–30 pts):* Evaluates net monthly savings vs total income.
  - *Expense Ratio Score (0–25 pts):* Penalizes expense-to-income ratios above 70%.
  - *Subscription Health (0–20 pts):* Flags recurring subscriptions exceeding 15% of income.
  - *Credit Utilization (0–25 pts):* Evaluates whether credit utilization exceeds the 30% safety mark.
- **DEF-05 Hardening:** Empty user profiles or users with zero transactions/incomes are not given synthetic scores (e.g. 75/100). Instead, an honest `INSUFFICIENT_DATA` status is emitted with a baseline score of 0.

### 5.3 Statement Parser & Deduplication (`app/services/statement_parser/`)
- **`csv_parser.py`:** Detects header signatures for HDFC, SBI, ICICI, Axis, and generic CSV statements. Extracts Date, Merchant/Description, Amount, and Transaction Type.
- **`deduplication.py`:** Generates canonical hash:
  $$\text{Hash} = \text{SHA256}(\text{date} + \text{round(amount, 2)} + \text{clean\_merchant} + \text{ref\_no})$$
  Identifies duplicates against existing user transactions before database commit.

### 5.4 Financial Inclusion Calculators (`app/services/education/calculators.py`)
- **`calculate_card_break_even`:** Computes spend required across card categories to offset the annual fee:
  $$\text{Required Spend} = \frac{\text{Annual Fee}}{\text{Effective Blended Reward Rate}}$$
- **`calculate_50_30_20_budget`:** Divides monthly income into Needs (50%), Wants (30%), and Savings (20%).
- **`calculate_compounding_interest`:** Computes compounding monthly credit card interest over a chosen tenure.
- **`calculate_minimum_payment_trap`:** Calculates the catastrophic payoff horizon and interest cost when paying only the minimum monthly due (5% or ₹500).
- **`calculate_credit_utilization`:** Measures current credit balance against total available limit, warning if utilization exceeds 30%.

### 5.5 Privacy Gateway (`app/services/privacy/privacy_gateway.py`)
- Intercepts all AI assistant requests.
- Applies regex sanitization for Indian PII:
  - Indian Aadhaar (12 digits, spaced or contiguous).
  - Indian PAN (Permanent Account Number - 5 letters, 4 digits, 1 letter).
  - Credit Card / Debit Card 16-digit numbers.
  - Indian Phone numbers (+91 or 10 digits).
  - Email addresses and UPI IDs (`user@okhdfcbank`, `user@paytm`, etc.).
- Verifies task allowlisting (`FINANCIAL_ADVICE`, `EXPLAINABILITY`, `TRANSLATION`).
- Emits structured entries into `ai_request_audit_logs`.

---

## 6. Error Handling & Standards

- All API errors are returned using FastAPI's standard `HTTPException(status_code, detail)`.
- Financial computations never fail silently; invalid inputs raise HTTP 400 or HTTP 422 with descriptive validation details.
- Tenant isolation errors raise HTTP 404 (or HTTP 403 where appropriate) to prevent IDOR scanning.

