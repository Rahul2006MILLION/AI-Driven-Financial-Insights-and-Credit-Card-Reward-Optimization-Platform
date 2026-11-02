# CLIQ — Product Vision & Functional Requirements

This document details the functional specifications, user journeys, data requirements, and verification criteria for each of CLIQ's 12 core product capabilities.

---

## Capability 1: Credit Card Intelligence

### Objective
Enable credit card users to maximize reward yield, avoid unnecessary annual fees, utilize milestone benefits, and make informed card choices without complex spreadsheet calculations.

### Functional Requirements
1. **Wallet Management:** Support multi-card portfolios with cardholder details, last 4 digits (zero sensitive numbers stored), joining/annual fees, billing cycle days, and renewal dates.
2. **Deterministic Reward Rules:** Calculate cashback, air miles, or reward points using tiered rules, category multipliers, and per-transaction or monthly caps.
3. **Card Recommendation Matrix:** When a transaction amount and category/merchant are queried, simulate reward yield across all user cards and rank them.
4. **Card Comparison:** Side-by-side evaluation of up to 4 credit cards across annual fees, spend waivers, base reward rates, and category perks.
5. **Fee Waiver Tracking:** Monitor cumulative annual spend towards renewal waiver thresholds.

### Verification Status: **Implemented & Verified**
- Handled via `RewardOptimizationEngine` (`backend/app/services/reward_optimization/engine.py`).
- Routes: `GET /api/v1/cards`, `POST /api/v1/cards`, `POST /api/v1/optimization/recommend`, `POST /api/v1/optimization/compare`.
- Frontend: `/cards`, `/cards/new`, `/cards/compare`, `/optimization`.

---

## Capability 2: No-Credit-Card Mode

### Objective
Provide non-cardholders, students, and debit/UPI users with an autonomous personal financial intelligence system that does not treat them as second-class citizens or force credit card adoption.

### Functional Requirements
1. **Pathway Selection:** Choose `NO_CREDIT_CARD` during onboarding or registration.
2. **Dedicated UI Mode:** Suppress credit card alerts, card stack animations, and reward optimization CTAs; promote cash flow tracking, budget planning, and CLIQ Learn.
3. **Non-Card Transactions:** Record payments via `UPI`, `CASH`, `DEBIT_CARD`, `BANK_TRANSFER`, and `OTHER` without requiring a `card_id`.
4. **Strict Isolation (DEF-01):** Non-card transactions must NEVER receive credit card reward point attribution, reward earnings, or optimal card IDs.
5. **Cash Flow Ledger:** Log single, recurring, and irregular income streams.

### Verification Status: **Implemented & Verified**
- Implemented in Phase 3 & hardened in Phase 3.2.
- Backend: `backend/app/api/v1/incomes.py`, `backend/app/api/v1/transactions.py`.
- Frontend: `/dashboard` (adaptive rendering), `/budget`.
- Tests: `test_no_card_mode.py`, `no_card_mode.test.ts`.

---

## Capability 3: Financial Scam Shield

### Objective
Protect users against fraudulent digital transactions, deceptive merchant names, recurring subscription traps, and urgent payment requests.

### Planned Functional Requirements
1. **Deceptive Merchant Detection:** Identify merchant names that mimic legitimate institutions (e.g., "HDFCC-BillPay-Alert", "SBI-Refund-Desk") using string distance heuristics.
2. **Urgent Lure Identification:** Analyze transaction descriptions and SMS/UPI request texts for phishing flags ("urgent", "electricity cut", "KYC blocked").
3. **Subscription Traps:** Flag recurring micro-transactions that initiated under promotional zero-cost trials but transitioned to ongoing recurring debits.
4. **Scam Risk Scoring:** Provide a transparent threat level (Low, Medium, High) with recommended action steps.

### Verification Status: **Planned (Phase 4 Milestone)**
- Architectural design established in Phase 2; full implementation scheduled for Phase 4.

---

## Capability 4: Financial Document Intelligence

### Objective
Allow users and administrators to upload bank statements and circulars to extract structured financial data without manual entry.

### Functional Requirements
1. **Bank Statement CSV Parser:** Support major Indian bank CSV statement layouts (HDFC, SBI, ICICI, Axis).
2. **Deduplication Engine:** Compute SHA-256 deduplication hashes using `(date, amount, merchant_name, reference_number)` to prevent double-counting.
3. **Batch Commit Flow:** Preview parsed rows before permanent insertion into the transaction ledger.
4. **Admin Offer Document OCR:** Upload bank PDF circulars, compute file hashes, parse discount terms, and extract candidate offers for the review queue.

### Verification Status: **Partially Implemented**
- Implemented: CSV statement parsing, deduplication hashing, batch commit (`backend/app/services/statement_parser/csv_parser.py`, `deduplication.py`). Admin PDF circular ingestion (`backend/app/services/offers/channels/pdf_channel.py`).
- Planned: Client-side OCR parsing for paper receipts and scanned PDF statements.

---

## Capability 5: Financial Emergency Intelligence

### Objective
Empower households to measure and fortify their liquid financial buffers against unforeseen shocks (medical emergencies, job transitions, economic downturns).

### Planned Functional Requirements
1. **Runway Computation:** Compare liquid savings against non-discretionary baseline monthly expenses to compute runway in months:
   $$\text{Emergency Runway (Months)} = \frac{\text{Liquid Savings}}{\text{Monthly Essential Expenses}}$$
2. **Essential vs. Discretionary Segregation:** Categorize spending into survival essentials (Rent, Groceries, Utilities, Healthcare) vs discretionary wants (Dining, Entertainment, Shopping).
3. **Emergency Target Recommendations:** Guide users towards building a tiered buffer (3 months for salaried, 6 months for irregular earners).

### Verification Status: **Planned (Phase 6 Milestone)**

---

## Capability 6: Financial Resilience Profile

### Objective
Provide a unified, multi-dimensional score evaluating an individual's financial stability and vulnerability.

### Planned Functional Requirements
1. **Composite Scoring:** Aggregate income volatility, debt-to-income ratio, savings rate, and emergency buffer into a transparent 100-point index.
2. **Provisional State Handling:** Gracefully communicate insufficient data without generating fake scores.
3. **Actionable Resilience Goals:** Deliver clear, prioritized steps to improve resilience.

### Verification Status: **Planned (Phase 6 Milestone)**

---

## Capability 7: CLIQ Financial Translator & Voice Accessibility

### Objective
Demystify complex legal and banking terminology into accessible language across English, Hindi, and Kannada, with audio readouts.

### Functional Requirements
1. **Term Simplification:** Map opaque bank jargon (APR, Foreclosure charges, Revolving interest, Amortization) to clear conceptual definitions.
2. **Multilingual Plain-Language Explanations:** Real-time generation of simplified summaries in Hindi, Kannada, and English.
3. **Voice Playback:** Support Web Speech API audio narration for visually impaired or low-literacy users.

### Verification Status: **Partially Implemented**
- Implemented: Plain-language glossary and interactive concept explanations inside CLIQ Learn modules across EN, HI, and KN.
- Planned: Voice synthesis narration and dynamic document term translator widget.

---

## Capability 8: Financial Benefits Navigator

### Objective
Connect users to government welfare programs, subsidies, and bank-specific social benefits based on demographic and income profiles.

### Planned Functional Requirements
1. **Scheme Registry:** Maintain verified repository of Indian welfare initiatives (e.g., PMJDY life/accident cover, Atal Pension Yojana, Sukanya Samriddhi).
2. **Eligibility Filtering:** Non-invasive matching based on user profile (age bracket, income frequency, pathway) without leaking identifying data.
3. **Application Checklists:** Step-by-step guidance on required documentation and application portals.

### Verification Status: **Planned (Phase 8 Milestone)**

---

## Capability 9: Credit Literacy & Readiness

### Objective
Prepare non-cardholders to enter the formal credit system responsibly without falling victim to high-interest debt or aggressive marketing.

### Planned Functional Requirements
1. **Credit Readiness Assessment:** Evaluate income regularity, budget surplus stability, and savings discipline before recommending credit application.
2. **Card Recommendation for First-Time Users:** Recommend secured credit cards (FD-backed) or entry-level no-annual-fee cards over high-interest credit lines.
3. **Card Ownership Simulation:** Simulate how billing cycles, grace periods, and interest charges function before opening a real account.

### Verification Status: **Planned (Phase 9 Milestone)**

---

## Capability 10: Irregular Income Management

### Objective
Solve the budgeting dilemma for gig workers, freelancers, and commission earners whose monthly income fluctuates unpredictably.

### Functional Requirements
1. **Income Volatility Classification:** Identify irregular income entries marked with `is_irregular: True`.
2. **90-Day Rolling Median Normalization (DEF-03):** Calculate an annualized, sustainable monthly baseline from 90 days of cash flow data rather than a distorted mean:
   $$\text{Monthly Baseline} = \text{Median}(\text{Monthly Aggregated Incomes in Last 90 Days})$$
3. **One-Time Windfall Amortization (DEF-04):** Ensure lump-sum or one-time income events expire after 90 days and do not project perpetual monthly cash flow.
4. **Surplus Quarantine:** Automatically suggest parking surplus income during high-earning months into a volatility buffer to fund deficit months.

### Verification Status: **Implemented & Verified**
- Handled in `backend/app/api/v1/incomes.py` and `incomes/summary`.
- Tests: `tests/unit/test_no_card_mode.py`.

---

## Capability 11: CLIQ Learn

### Objective
Deliver accessible, interactive, modular financial education with practical calculators directly connected to personal financial scenarios.

### Functional Requirements
1. **Modular Curriculum:** 6 core financial literacy modules across 3 difficulty tiers (Foundations, Credit Literacy, Wealth & Protection).
2. **5 Interactive Calculators:**
   - *Break-Even Calculator:* Evaluates whether credit card perks justify annual fees.
   - *50/30/20 Budget Calculator:* Splits monthly income into Needs (50%), Wants (30%), and Savings (20%).
   - *Interest Compounding Calculator:* Demonstrates total interest paid over time at standard credit card APRs (36% to 42%).
   - *Minimum Due Trap Calculator:* Shows how paying only the minimum 5% can turn a modest balance into multi-year debt.
   - *Credit Utilization Calculator:* Highlights the danger of exceeding the 30% credit limit threshold.
3. **Progress Tracking:** Persist module completion status and quiz scores in `user_learning_progress`.
4. **Full Tri-lingual Support:** Complete curriculum and quiz content translated into English, Hindi, and Kannada.

### Verification Status: **Implemented & Verified**
- Backend: `backend/app/api/v1/education.py`, `backend/app/services/education/`.
- Frontend: `/learn`, `/budget`.
- Tests: `test_financial_inclusion.py`, `financial_inclusion.test.ts`.

---

## Capability 12: Explainability Engine

### Objective
Ensure zero "black box" decisions. Every recommendation, financial health score, reward calculation, and offer match must provide mathematical proof and clear reasoning.

### Functional Requirements
1. **Calculation Breakdown:** Every reward recommendation returns an exact `calculation_breakdown_json` showing base rate, category multiplier, cap deductions, and net yield.
2. **Alternative Options:** Show second-best and worst card options to demonstrate *why* the recommended card won.
3. **Health Score Metric Traces:** Deconstruct the 0–100 health score into individual component scores (Savings, Budget Adherence, Utilization, Debt Ratio) with plain-language recommendations.
4. **Source Attribution:** Discovered offers display extraction confidence, terms URL, source evidence excerpt, and verification status.

### Verification Status: **Implemented & Verified**
- Embedded in `RewardOptimizationEngine`, `FinancialHealthEngine`, and `OfferService`.
- Documented in `docs/EXPLAINABILITY.md` and `docs/SYSTEM_ARCHITECTURE.md`.

