# CLIQ — API Reference & OpenAPI Inventory

This document details the complete 61-endpoint OpenAPI REST interface for the CLIQ backend, organized into 12 functional domains.

---

## Domain 1: System & Metadata

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | System status, service health, timestamp, and environment. |
| `GET` | `/api/v1/categories` | None | Returns list of standard spending categories (`id`, `display_name_en`, `display_name_hi`, `display_name_kn`, `icon_name`). |

---

## Domain 2: Authentication & Profile

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | None | **Request:** `RegisterRequest` (`email`, `password`, `full_name`, `preferred_language`, `currency`, `financial_pathway`).<br>**Response:** `TokenResponse` (`access_token`, `token_type`, `user`). |
| `POST` | `/api/v1/auth/login` | None | **Request:** `LoginRequest` (`email`, `password`).<br>**Response:** `TokenResponse` (`access_token`, `token_type`, `user`, `role`, `is_admin`). |
| `GET` | `/api/v1/auth/me` | Bearer | Returns the authenticated user's `ProfileResponse`. |
| `GET` | `/api/v1/profile` | Bearer | Returns full profile details including preferences and financial pathway. |
| `PUT` | `/api/v1/profile` | Bearer | **Request:** `ProfileUpdate` (`full_name`, `preferred_language`, `currency`, `financial_pathway`). Updates active profile. |

---

## Domain 3: Credit Cards Portfolio

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cards` | Bearer | Lists all active credit cards for the current user, including loaded reward rules and benefits. |
| `POST` | `/api/v1/cards` | Bearer | **Request:** `CreditCardCreate`. Creates a new credit card record (last 4 digits only, fees, cycle day). |
| `GET` | `/api/v1/cards/{card_id}` | Bearer | Returns single card details. Enforces tenant isolation (HTTP 404 if not owned). |
| `PUT` | `/api/v1/cards/{card_id}` | Bearer | **Request:** `CreditCardUpdate`. Updates card parameters or fee waiver spend progress. |
| `DELETE` | `/api/v1/cards/{card_id}` | Bearer | Soft or hard deletes the user card record. |

---

## Domain 4: Transactions & Statement Ingestion

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/transactions` | Bearer | Lists user transactions with optional filters (`start_date`, `end_date`, `category_id`, `payment_method`). |
| `POST` | `/api/v1/transactions` | Bearer | **Request:** `TransactionCreate` (`merchant_name`, `amount`, `transaction_date`, `category_id`, `payment_method`, `card_id`).<br>**DEF-01 Business Rule:** Non-card payment methods (`CASH`, `UPI`, `DEBIT_CARD`, `BANK_TRANSFER`, `OTHER`) reject `card_id` and receive 0 rewards. |
| `GET` | `/api/v1/transactions/{transaction_id}` | Bearer | Returns single transaction details. |
| `DELETE` | `/api/v1/transactions/{transaction_id}` | Bearer | Deletes a transaction record. |
| `PUT` | `/api/v1/transactions/{transaction_id}/feedback` | Bearer | Submits feedback on categorization accuracy. |
| `GET` | `/api/v1/transactions/feedback/summary` | Bearer | Summarizes categorization accuracy metrics. |
| `POST` | `/api/v1/transactions/import/preview` | Bearer | Multipart CSV upload. Parses statement, runs deduplication hash checks, classifies payment method, and returns preview rows. |
| `POST` | `/api/v1/transactions/import/commit` | Bearer | **Request:** `ImportCommitRequest`. Commits approved preview transactions into the permanent ledger. |

---

## Domain 5: Incomes & Cash Flow (No-Credit-Card Core)

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/incomes` | Bearer | Lists all income streams for the authenticated user, ordered by `received_date DESC`. |
| `POST` | `/api/v1/incomes` | Bearer | **Request:** `IncomeCreate` (`source_name`, `amount`, `currency`, `frequency`, `is_irregular`, `received_date`, `notes`). |
| `GET` | `/api/v1/incomes/{income_id}` | Bearer | Retrieves single income entry with tenant isolation. |
| `PUT` | `/api/v1/incomes/{income_id}` | Bearer | **Request:** `IncomeUpdate`. Updates an existing income stream. |
| `DELETE` | `/api/v1/incomes/{income_id}` | Bearer | Removes an income stream. |
| `GET` | `/api/v1/incomes/summary` | Bearer | Returns cash flow summary: `monthly_total_income`, `rolling_90d_monthly_median` (DEF-03), net savings, and deficit status. |

---

## Domain 6: Reward Optimization & Advisor

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/optimization/recommend` | Bearer | **Request:** `OptimizationRequest` (`amount`, `category_id`, `merchant_name`).<br>**Response:** Evaluates user cards, returns best card, expected reward, and mathematical breakdown. |
| `POST` | `/api/v1/optimization/compare` | Bearer | **Request:** `CardComparisonRequest` (array of card IDs). Compares fees, base rates, perks, and spend waiver rules. |
| `POST` | `/api/v1/optimization/simulate` | Bearer | **Request:** `SimulationRequest`. Simulates annual rewards yield based on projected monthly spending categories. |

---

## Domain 7: Financial Health & Analytics

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/financial-health` | Bearer | Returns composite 0–100 health score, radar sub-scores (Savings, Expenses, Subscriptions, Utilization), and omitted indicators. |
| `GET` | `/api/v1/analytics/rewards` | Bearer | Summarizes earned rewards vs missed rewards and efficiency percentage. |
| `GET` | `/api/v1/analytics/spending` | Bearer | Aggregates spending by category, merchant, and payment method across time windows. |

---

## Domain 8: CLIQ Learn & Budgeting (Financial Inclusion)

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/education/categories` | Bearer | Returns educational categories and topic taxonomies. |
| `GET` | `/api/v1/education/modules` | Bearer | Lists all 6 educational curriculum modules. |
| `GET` | `/api/v1/education/modules/{topic_id}` | Bearer | Retrieves full lesson content, key concepts, and quiz questions for a topic. |
| `GET` | `/api/v1/education/progress` | Bearer | Returns user learning progress and quiz scores. |
| `POST` | `/api/v1/education/progress/{topic_id}` | Bearer | **Request:** `LearningProgressUpdate`. Records topic completion and quiz score. |
| `GET` | `/api/v1/education/path` | Bearer | Returns active learning track recommendations. |
| `PUT` | `/api/v1/education/path` | Bearer | Updates active learning pathway. |
| `GET` | `/api/v1/education/budget` | Bearer | Returns user budget settings and 50/30/20 envelope breakdowns. |
| `PUT` | `/api/v1/education/budget` | Bearer | Updates user budget envelopes and monthly income. |
| `POST` | `/api/v1/education/calculators/break-even` | Bearer | Computes annual spend required to offset credit card annual fees. |
| `POST` | `/api/v1/education/calculators/budget` | Bearer | Computes 50/30/20 budget envelope allocation for a given income. |
| `POST` | `/api/v1/education/calculators/interest` | Bearer | Computes compounding interest cost over time. |
| `POST` | `/api/v1/education/calculators/minimum-due` | Bearer | Computes payoff horizon and interest cost when paying only 5% minimum due. |
| `POST` | `/api/v1/education/calculators/utilization` | Bearer | Evaluates credit utilization ratio against the 30% safety limit. |

---

## Domain 9: Discovered Bank Offers (User Facing)

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/offers` | Bearer | Queries verified, live bank offers with filters (`category_id`, `bank`, `merchant`). |
| `POST` | `/api/v1/offers` | Bearer | Registers or queries offers matched to user card portfolio. |
| `GET` | `/api/v1/offers/{offer_id}` | Bearer | Retrieves full offer details, promo codes, and terms evidence. |

---

## Domain 10: Admin Offer Desk (Review & Ingestion)

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/offers/review-queue` | Admin | Retrieves offers pending admin review (`verification_status = 'PENDING_REVIEW'`). |
| `PUT` | `/api/v1/admin/offers/{offer_id}` | Admin | Modifies offer terms, discount values, or eligible cards. Increments version. |
| `POST` | `/api/v1/admin/offers/{offer_id}/approve` | Admin | Approves candidate offer into `VERIFIED` state with review audit trail. |
| `POST` | `/api/v1/admin/offers/{offer_id}/reject` | Admin | Rejects offer with documented rejection rationale. |
| `POST` | `/api/v1/admin/offers/{offer_id}/reverification`| Admin | Sends an offer to `NEEDS_REVERIFICATION` quarantine upon material change. |
| `GET` | `/api/v1/admin/offers/{offer_id}/audit-trail` | Admin | Returns the complete immutable audit trail of review decisions for an offer. |
| `POST` | `/api/v1/admin/offers/manual` | Admin | Manually registers an authorized offer directly into the registry. |
| `POST` | `/api/v1/admin/offers/partner-feed` | Admin | Ingests partner offer JSON feed. |
| `POST` | `/api/v1/admin/offers/upload-circular` | Admin | Uploads bank circular PDF for extraction and sha256 duplicate checking. |
| `GET` | `/api/v1/admin/offers/documents` | Admin | Lists uploaded administrative offer circulars. |
| `GET` | `/api/v1/admin/offers/sources` | Admin | Lists all monitored bank and aggregator sources. |
| `GET` | `/api/v1/admin/offers/sources/{source_id}` | Admin | Retrieves specific source health metrics and failure logs. |
| `POST` | `/api/v1/admin/offers/sources/{source_id}/probe`| Admin | Dispatches an on-demand probe to test connector health. |
| `POST` | `/api/v1/admin/offers/sources/probe-all` | Admin | Dispatches on-demand probes across all configured connectors. |
| `POST` | `/api/v1/admin/offers/sync-discovery` | Admin | Triggers automated discovery pipeline across all permitted sources. |
| `GET` | `/api/v1/admin/offers/failures` | Admin | Retrieves source connector failure logs and HTTP statuses. |

---

## Domain 11: Privacy & AI Consent

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/privacy/consent` | Bearer | Retrieves active user AI consent record (`external_ai_enabled`, `allow_card_context`, etc.). |
| `PUT` | `/api/v1/privacy/consent` | Bearer | **Request:** `ConsentUpdate`. Updates user AI consent permissions. |
| `GET` | `/api/v1/privacy/data-minimization-rules`| Bearer | Returns the platform's active PII redaction rules and guarantees. |
| `GET` | `/api/v1/privacy/audit-logs` | Bearer | Returns immutable AI request audit log for the current user. |

---

## Domain 12: AI Assistant & Document Uploads

| Method | Endpoint | Auth | Description & Schemas |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/assistant/chat` | Bearer | **Request:** `ChatRequest` (`message`, `language`). Passes through Privacy Gateway; returns multilingual guidance. |
| `GET` | `/api/v1/documents` | Bearer | Lists user-uploaded statement documents. |
| `POST` | `/api/v1/documents/upload` | Bearer | Uploads a user document for extraction. |
| `GET` | `/api/v1/documents/{document_id}` | Bearer | Retrieves status and extracted data for an uploaded document. |
| `POST` | `/api/v1/documents/{document_id}/verify`| Bearer | Approves extracted document parameters into user wallet. |

