# CLIQ REST API Documentation

> **Base URL:** `/api/v1`  
> **Protocol:** HTTPS / JSON  
> **Authentication:** Bearer JWT Token (`Authorization: Bearer <access_token>`)  
> **Global Status Endpoint:** `GET /health`  
> **Total Active Endpoints:** 68 Route-Method Operations across 11 Functional Domains

---

## 1. Global & System Endpoints

### `GET /health`
Liveness and readiness probe for containerized environments and load balancers.
- **Auth Required:** No
- **Response (200 OK):**
```json
{
  "status": "HEALTHY",
  "service": "CLIQ Intelligence Platform",
  "version": "1.0.0",
  "environment": "production",
  "database": "CONNECTED",
  "timestamp": "2026-11-02T08:30:00Z"
}
```

### `GET /api/v1/categories`
Retrieves standardized spending categories with multilingual translations and icon tokens.
- **Auth Required:** No
- **Response (200 OK):**
```json
[
  {
    "id": "dining",
    "display_name_en": "Dining & Restaurants",
    "display_name_hi": "डाइनिंग और रेस्टोरेंट",
    "display_name_kn": "ಊಟ ಮತ್ತು ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು",
    "icon_name": "Utensils"
  }
]
```

---

## 2. Authentication & Profile Endpoints (`/api/v1/auth`, `/api/v1/profile`)

### `POST /api/v1/auth/register`
Registers a new user and automatically initializes default user preferences.
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "Rahul Sharma",
  "preferred_language": "en",
  "currency": "INR"
}
```
- **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "usr_uuid",
    "email": "user@example.com",
    "full_name": "Rahul Sharma",
    "preferred_language": "en",
    "currency": "INR",
    "role": "USER",
    "is_admin": false
  }
}
```

### `POST /api/v1/auth/login`
Authenticates user credentials and issues a JWT Bearer token.
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):** Same as register response.

### `GET /api/v1/auth/me` or `GET /api/v1/profile`
Fetches the authenticated user's profile details.
- **Auth Required:** Bearer Token
- **Response (200 OK):** User profile object.

### `PUT /api/v1/profile`
Updates language preferences, display name, or currency.
- **Auth Required:** Bearer Token
- **Request Body:**
```json
{
  "full_name": "Rahul Sharma",
  "preferred_language": "hi",
  "currency": "INR"
}
```

---

## 3. Credit Card Portfolio Endpoints (`/api/v1/cards`)

### `GET /api/v1/cards`
Lists all active credit cards belonging to the authenticated user.
- **Auth Required:** Bearer Token
- **Response (200 OK):** Array of card objects with associated reward rules and benefits.

### `POST /api/v1/cards`
Adds a new credit card to the user's digital wallet.
- **Auth Required:** Bearer Token
- **Request Body:**
```json
{
  "card_name": "HDFC Regalia Gold",
  "bank_name": "HDFC Bank",
  "network": "VISA",
  "card_type": "CREDIT",
  "card_variant": "Metal",
  "last_four_digits": "4321",
  "annual_fee": 2500.00,
  "renewal_waiver_spend": 400000.00,
  "billing_cycle_day": 15
}
```

### `GET /api/v1/cards/{card_id}`
Retrieves deep configuration, rules, and benefits for a single card.
- **Auth Required:** Bearer Token (Tenant-isolated).

### `PUT /api/v1/cards/{card_id}`
Modifies credit card attributes (spend caps, nickname, fee waiver thresholds).
- **Auth Required:** Bearer Token (Tenant-isolated).

### `DELETE /api/v1/cards/{card_id}`
Deletes or deactivates a card from the portfolio.
- **Auth Required:** Bearer Token (Tenant-isolated).

---

## 4. Transaction Management & CSV Import (`/api/v1/transactions`)

### `GET /api/v1/transactions`
Retrieves paginated transactions with optional filters (`start_date`, `end_date`, `category_id`, `card_id`, `is_recurring`).
- **Auth Required:** Bearer Token

### `POST /api/v1/transactions`
Manually records a single completed transaction across credit-card or non-card payment rails.
- **Request Body:**
```json
{
  "card_id": null,
  "payment_method": "UPI",
  "category_id": "dining",
  "merchant_name": "Swiggy",
  "amount": 750.00,
  "transaction_date": "2026-11-02T12:00:00Z",
  "is_recurring": false
}
```
- **Validation & Non-Card Isolation Rules (DEF-01):**
  - `payment_method`: Allowed values: `"CREDIT_CARD"`, `"CASH"`, `"UPI"`, `"BANK_TRANSFER"`, `"DEBIT_CARD"`, `"OTHER"`. Defaults to `"CREDIT_CARD"`.
  - For non-card methods (`CASH`, `UPI`, `BANK_TRANSFER`, `DEBIT_CARD`, `OTHER`): `card_id` **must be null**. Passing a non-null `card_id` returns HTTP `400 Bad Request`.
  - Non-card transactions earn `0.00` rewards and bypass the credit-card optimization engine, preventing non-card spend from diluting card portfolio yield metrics.

### `POST /api/v1/transactions/import/preview`
Parses an uploaded CSV statement, normalizes merchant narrations, categorizes transactions, and identifies potential duplicates without committing to the database.
- **Content-Type:** `multipart/form-data`
- **Response (200 OK):**
```json
{
  "total_rows": 25,
  "new_transactions": 23,
  "duplicate_count": 2,
  "preview": [
    {
      "temp_id": "row_1",
      "date": "2026-10-28",
      "raw_narration": "RAZORPAY*SWIGGY BLR",
      "normalized_merchant": "Swiggy",
      "category_id": "food_delivery",
      "amount": 420.00,
      "is_duplicate": false
    }
  ]
}
```

### `POST /api/v1/transactions/import/commit`
Commits approved staged transactions into the database.
- **Request Body:** Array of approved transaction objects.
- **Response (200 OK):** `{ "imported_count": 23, "status": "SUCCESS" }`

### `PUT /api/v1/transactions/{transaction_id}/feedback`
Allows users to correct an automated category classification. Feedback is used to improve local merchant normalization.

---

## 5. Reward Optimization & Simulation (`/api/v1/optimization`)

### `POST /api/v1/optimization/recommend`
Evaluates the best credit card to use for a pending or planned purchase.
- **Request Body:**
```json
{
  "amount": 12500.00,
  "category_id": "travel",
  "merchant_name": "MakeMyTrip"
}
```
- **Response (200 OK):**
```json
{
  "winning_card": {
    "card_id": "crd_1",
    "card_name": "Axis Atlas",
    "net_reward_inr": 625.00,
    "effective_rate_pct": 5.00,
    "reward_type": "MILES"
  },
  "explanation_steps": [
    {
      "step_number": 1,
      "step_name": "Merchant Accelerator",
      "formula_applied": "amount * (5.00 / 100)",
      "intermediate_output": 625.00
    }
  ],
  "alternatives": [
    {
      "card_name": "HDFC Regalia Gold",
      "net_reward_inr": 416.66,
      "effective_rate_pct": 3.33,
      "rejection_reason": "LOWER_NET_YIELD"
    }
  ]
}
```

### `POST /api/v1/optimization/simulate`
Runs multi-bracket "What-If" purchase simulations across hypothetical spend bands (e.g. ₹5,000, ₹15,000, ₹50,000) to project milestone bonuses and fee waivers.

### `POST /api/v1/optimization/compare`
Compares 2 to 4 credit cards side-by-side on reward rates, annual fees, spend waiver targets, and lounge quotas.

---

## 6. Financial Health & Spending Analytics (`/api/v1/analytics`)

### `GET /api/v1/analytics/spending`
Returns aggregated spend distributions by category, monthly velocity, and top merchants.

### `GET /api/v1/analytics/rewards`
Returns realized reward yields, missed reward opportunities (when a sub-optimal card was swiped), and year-to-date cashback.

### `GET /api/v1/analytics/financial-health`
Computes the multi-dimensional CLIQ Financial Health Score (0–100), savings rate, credit utilization ratio, and detected recurring subscriptions.
- **Pathway Adaptive Behavior:**
  - For `CREDIT_CARD` users: Evaluates reward efficiency, credit utilization ratio, and annual fee break-even.
  - For `NO_CREDIT_CARD` users: Evaluates cash-flow resilience, 50/30/20 budget adherence, and subscription hygiene while populating `omitted_indicators` with card-dependent metrics.
- **Data Sufficiency States (DEF-05):**
  - `"COMPLETE"`: Profile has active income, budget, and transactions. Health score is fully evidenced.
  - `"PARTIAL"`: Missing either budget or transactions. Evidenced score computed only from verified pillars.
  - `"INSUFFICIENT_DATA"`: Empty profile with no income, budget, or transactions. Returns `health_score = 0` with explicit missing data alerts rather than fabricated synthetic scores.

---

## 7. Income Management & Cash Flow Tracking (`/api/v1/incomes`)

### `GET /api/v1/incomes`
Lists all registered income streams for the authenticated user.
- **Auth Required:** Bearer Token
- **Response (200 OK):** List of income objects (`id`, `source_name`, `amount`, `frequency`, `is_irregular`, `received_date`, `expected_date`, `notes`).

### `POST /api/v1/incomes`
Records a new regular or irregular income stream.
- **Request Body:**
```json
{
  "source_name": "Full-time Salary",
  "amount": 75000.00,
  "frequency": "MONTHLY",
  "is_irregular": false,
  "received_date": "2026-11-01",
  "notes": "Primary software engineering role"
}
```

### `GET /api/v1/incomes/summary`
Calculates consolidated monthly cash-flow analytics, separating regular and irregular income.
- **Response (200 OK):**
```json
{
  "total_monthly_income": 85000.00,
  "regular_income": 75000.00,
  "irregular_income": 10000.00,
  "rolling_90d_median_monthly_income": 82000.00,
  "income_sources_count": 2,
  "sources": [
    {
      "source_name": "Full-time Salary",
      "amount": 75000.00,
      "frequency": "MONTHLY",
      "monthly_equivalent": 75000.00,
      "percentage_of_total": 88.2
    }
  ],
  "has_income_data": true,
  "data_sufficiency_explanation": "Calculated across 2 recorded income streams."
}
```
- **Calculation Rules (DEF-03 & DEF-04):**
  - Grouping: Incomes within the past 90 days are aggregated by calendar month `(year, month)` before computing the median.
  - Expiry: One-time incomes received `>90 days` ago or future-dated are excluded from ongoing monthly cash-flow totals.

### `GET /api/v1/incomes/{income_id}`
Retrieves a specific income stream with strict IDOR tenant isolation.

### `PUT /api/v1/incomes/{income_id}`
Updates an income stream's amount, frequency, regularity, or notes.

### `DELETE /api/v1/incomes/{income_id}`
Deletes an income stream from the user's cash-flow telemetry.

---

## 8. AI Assistant & Privacy Gateway (`/api/v1/assistant`, `/api/v1/privacy`)

### `POST /api/v1/assistant/chat`
Dispatches a natural language query through the CLIQ Privacy Gateway to Gemini 2.5 Flash with factual grounding.
- **Request Body:**
```json
{
  "message": "Which card gave me the most cashback on dining last month?"
}
```
- **Response (200 OK):**
```json
{
  "response": "Last month, your Axis Ace card earned you ₹340 in cashback on dining across 4 transactions, yielding an effective 4.0% return.",
  "grounded": true,
  "redacted_tokens_detected": 0
}
```

### `GET /api/v1/privacy/consent`
Retrieves the user's granular AI privacy settings.

### `PUT /api/v1/privacy/consent`
Updates user AI consent toggles (`external_ai_enabled`, `allow_card_context`, `allow_spending_context`).

### `GET /api/v1/privacy/audit-logs`
Returns the user's immutable AI egress audit trail with timestamps, task classifications, and non-PII token counts.

---

## 9. CLIQ Learn: Financial Inclusion & Calculators (`/api/v1/education`)

### `GET /api/v1/education/budget`
Retrieves the user's category-wise 50/30/20 spending budget and monthly income target.

### `PUT /api/v1/education/budget`
Updates or creates the user's monthly budget envelope (`monthly_income`, `total_budget`, `category_budgets`).

### `GET /api/v1/education/modules`
Returns all 9 financial literacy curriculum modules with lesson counts and completion statuses.

### `GET /api/v1/education/modules/{topic_id}`
Returns the full text, examples, and interactive quiz for a specific topic (e.g., `apr-interest-compounding`).

### `POST /api/v1/education/progress/{topic_id}`
Submits quiz answers and records lesson completion.

### `POST /api/v1/education/calculators/minimum-due`
Calculates the true cost and timeline of paying only the Minimum Amount Due.
- **Request Body:**
```json
{
  "card_balance": 50000.00,
  "monthly_interest_rate_pct": 3.5,
  "minimum_due_percentage": 5.0,
  "fixed_minimum_floor": 500.00
}
```
- **Response (200 OK):**
```json
{
  "total_months_to_payoff": 84,
  "total_interest_paid": 47250.00,
  "total_amount_paid": 97250.00,
  "monthly_schedule_preview": []
}
```

### `POST /api/v1/education/calculators/utilization`
Calculates current credit utilization ratio and shows simulated impact of paying down specific balances on credit scoring tiers.

### `POST /api/v1/education/calculators/break-even`
Calculates required annual spend on a premium card to offset its annual membership fee.

---

## 10. Offers & Deal Discovery (`/api/v1/offers`)

### `GET /api/v1/offers`
Lists verified promotional card offers and merchant discounts, filterable by bank, merchant, or category.

### `POST /api/v1/offers`
Submits a user-discovered promotional offer for community verification.

---

## 11. Admin Offer Desk & Scraper Telemetry (`/api/v1/admin/offers`)

### `GET /api/v1/admin/offers/review-queue`
Admin endpoint listing staged scraped or uploaded promotional circulars awaiting verification.

### `POST /api/v1/admin/offers/{offer_id}/approve`
Approves a staged promotional deal, transitioning its status to `APPROVED` and publishing it to active user recommendations.

### `POST /api/v1/admin/offers/{offer_id}/reject`
Rejects a staged offer with mandatory rejection reason logging.

### `GET /api/v1/admin/offers/sources`
Lists all monitored bank and merchant sources, health status, and scraper failure rates.

### `POST /api/v1/admin/offers/sources/{source_id}/probe`
Performs an on-demand HTTP liveness and bot-protection probe on an external offer source.
