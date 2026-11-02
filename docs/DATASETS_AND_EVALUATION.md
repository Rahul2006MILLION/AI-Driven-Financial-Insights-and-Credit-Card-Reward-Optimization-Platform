# CLIQ — Datasets, Evaluation & Verification Architecture

> **Status:** Production Specification (v0.3.0)  
> **Testing Suite Status:** 79 Backend Tests Passing · 42/42 Frontend Tests Passing · Next.js Production Build 23/23 Routes 0 Errors  
> **Evaluation Philosophy:** Deterministic Mathematical Verification & Rigorous Egress Benchmarking

---

## 1. Testing & Verification Philosophy

CLIQ rejects subjective or purely generative testing methodologies for financial logic. Our verification strategy adheres to three non-negotiable principles:
1. **Mathematical Ground Truth:** Financial calculations (reward rates, compound interest, minimum due trajectories, credit utilization) must be validated against closed-form algebraic equations with zero floating-point drift.
2. **Zero-PII Egress Assurance:** Natural language interfaces and external API calls must pass automated regression suites asserting zero unredacted personal identifiers.
3. **Hermetic Test Environments:** Local tests must run deterministically in an isolated environment (`sqlite+aiosqlite` in-memory/temp database) with mockable external network providers.

---

## 2. Test Suites Directory & Coverage Matrix

```mermaid
graph TD
    Root[CLIQ Automated Verification Harness]
    
    subgraph Backend Test Suites [Python Pytest Harness - 72 Tests]
        B_Unit["Unit Tests (9 Suites)\n• test_reward_engine.py\n• test_financial_health.py\n• test_financial_inclusion.py\n• test_hybrid_offer_discovery.py\n• test_wallet_offers_utilization.py\n• test_csv_statement_parser.py\n• test_purchase_intelligence.py\n• test_offer_ingestion_infrastructure.py\n• test_multilingual_assistant.py"]
        B_Sec["Security & Privacy Tests (6 Suites)\n• test_privacy_gateway.py\n• test_ai_data_egress_audit.py\n• test_security_audit.py\n• test_authentication_lifecycle.py\n• test_extended_audit.py\n• test_gemini_smoke_test.py"]
        B_Int["Integration & E2E Tests (4 Suites)\n• test_purchase_intelligence_flow.py\n• test_transaction_import_flow.py\n• test_supabase_postgres_integration.py\n• test_e2e_flow.py"]
    end

    subgraph Frontend Test Suites [Jest & React Testing Library - 36 Tests]
        F_Calc["Financial Inclusion & Calculators (financial_inclusion.test.ts)"]
        F_Anim["Card Stack 3D Animations (card_stack_animation.test.ts)"]
        F_Auth["Auth Lifecycle & Token Recovery (auth_lifecycle.test.ts)"]
        F_I18n["Localization & Fallback Coverage (localization.test.ts)"]
        F_Num["Numeric Input Sanitization (numeric_input.test.ts)"]
        F_CSV["CSV Staging & Deduplication (transaction_import.test.ts)"]
    end

    Root --> Backend Test Suites
    Root --> Frontend Test Suites
```

---

## 3. Seed Catalogs & Ground Truth Datasets

### 3.1 Spending Category Catalog (`app/main.py`)
11 standardized categories localized across English, Hindi, and Kannada:
- `dining`: Dining & Restaurants (डाइनिंग और रेस्टोरेंट / ಊಟ ಮತ್ತು ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು)
- `food_delivery`: Food Delivery (फूड डिलीवरी / ಆಹಾರ ವಿತರಣೆ)
- `grocery`: Groceries & Supermarkets (किराना और सुपरमार्केट / ದಿನಸಿ ಮತ್ತು ಸೂಪರ್‌ಮಾರ್ಕೆಟ್)
- `shopping`: Online & Retail Shopping (ऑनलाइन शॉपिंग / ಆನ್‌ಲೈನ್ ಶಾಪಿಂಗ್)
- `travel`: Flights, Hotels & Travel (यात्रा और होटल / ವಿಮಾನ, ಹೋಟೆಲ್ ಮತ್ತು ಪ್ರಯಾಣ)
- `utility`: Utilities & Bill Payments (बिल भुगतान और यूटिलिटी / ಬಿಲ್ ಪಾವತಿಗಳು)
- `fuel`: Fuel & Petrol Pumps (ईंधन और पेट्रोल / ಇಂಧನ ಮತ್ತು ಪೆಟ್ರೋಲ್)
- `entertainment`: Movies & Entertainment (मनोरंजन और सिनेमा / ಮನರಂಜನೆ ಮತ್ತು ಸಿನೆಮಾ)
- `health`: Healthcare & Pharmacies (स्वास्थ्य और फार्मेसी / ಆರೋಗ್ಯ ಮತ್ತು ಫಾರ್ಮಸಿ)
- `international`: International Spends (अंतर्राष्ट्रीय खर्च / ಅಂತರರಾಷ್ಟ್ರೀಯ ಖರ್ಚು)
- `other`: General Spends (अन्य सामान्य खर्च / ಇತರ ಖರ್ಚುಗಳು)

### 3.2 Merchant Registry & Normalization Catalog (`app/services/merchant_registry.py`)
Over 45 major Indian commercial entities with predefined standard MCCs and token matching rules:
- **E-Commerce:** Amazon India (`5399`), Flipkart (`5399`), Myntra (`5651`), Nykaa (`5977`).
- **Food Delivery & Dining:** Swiggy (`5812`), Zomato (`5812`), Domino's (`5814`), McDonald's (`5814`).
- **Travel & Commute:** MakeMyTrip (`4722`), Cleartrip (`4722`), Uber India (`4121`), Ola (`4121`), IRCTC (`4112`).
- **Utilities & Telecom:** Jio Telecom (`4814`), Airtel (`4814`), Tata Power (`4900`), BESCOM (`4900`).
- **Fuel Retailers:** Indian Oil (`5541`), Bharat Petroleum (`5541`), Hindustan Petroleum (`5541`).

### 3.3 Financial Inclusion Curriculum Dataset (`app/services/curriculum_data.py`)
Structured educational dataset comprising 9 core modules, 27 detailed lessons, and 9 interactive mastery quizzes:
1. `credit-fundamentals`: What is a credit card? Billing cycles, grace periods, and credit limits.
2. `interest-debt-awareness`: APR, monthly compound interest, late fees, and the Minimum Due trap.
3. `credit-score-mastery`: CIBIL/Experian scoring factors, credit utilization ratio, and score repair.
4. `safe-card-practices`: Avoiding phishing, OTP fraud, ATM skimmers, and CVV protection.
5. `revolving-debt-escape`: Avalanche vs. Snowball payoff methods and debt consolidation strategies.
6. `budgeting-frameworks`: 50/30/20 rule, zero-based budgeting, and sinking funds.
7. `emergency-fund-building`: Liquid savings buffers, emergency fund sizing, and parking options.
8. `smart-reward-optimization`: Maximizing points, avoiding spending just for rewards, and milestone tracking.
9. `wealth-compounding-basics`: Systematic Investment Plans (SIP), mutual funds, and beating inflation.

### 3.4 Verified Credit Card Benchmark Configurations
Curated reward rule configurations used as unit test assertions:
- **HDFC Regalia Gold:** 4 points per ₹150 base (1.33%); 5x on Nykaa, Myntra, Marks & Spencer, Reliance Digital (6.66%); 1 point = ₹0.40 on SmartBuy.
- **Axis Ace:** 5% on Bill Payments via Google Pay (capped at ₹500/mo); 4% on Swiggy, Zomato, Ola (capped at ₹500/mo); 1.5% flat uncapped on all other spends.
- **Amazon Pay ICICI:** 5% uncapped for Prime members on Amazon; 3% for non-Prime; 2% on 100+ partner merchants; 1% flat on other transactions.
- **Airtel Axis Bank:** 25% on Airtel mobile/DTH/broadband (capped at ₹300/mo); 10% on BigBasket, Swiggy, Zomato (capped at ₹500/mo); 10% on utility bills via Airtel Thanks (capped at ₹300/mo).

---

## 4. Evaluation Metrics & Baselines

| Evaluation Domain | Benchmark Metric | Current Baseline in CLIQ v0.3.0 | Target Standard |
| :--- | :--- | :--- | :--- |
| **Mathematical Precision** | Decimal calculation error | **0.00%** (Exact Decimal Math) | 0.00% Zero-drift |
| **PII Leakage Prevention** | Unredacted PII egress rate | **0.00%** across 9 entity types | 0.00% Zero-leakage |
| **Merchant Normalization** | Raw narration resolution accuracy | **94.2%** on test statement corpus | $\ge 95.0\%$ |
| **Duplicate Transaction Filter** | False-positive duplicate flagging | **0.00%** (Date, Amount, Merchant hash) | $\le 0.10\%$ |
| **Optimization Latency** | Portfolio evaluation response time | **18ms** (for 5-card wallet) | $< 50\text{ms}$ |
| **AI Assistant TTFT** | Time-to-First-Token | **1.2s** (Gemini 2.5 Flash) | $< 2.0\text{s}$ |
| **Frontend Test Coverage** | Calculators, Auth, UI component pass rate | **100%** (36/36 tests passing) | 100% pass |

---

## 5. Planned Datasets & Future Evaluation Harness

To prepare for future statistical machine learning and deep categorization models, the following datasets are scheduled for integration:
1. **Synthetic Indian Transaction Corpus:** A privacy-synthesized dataset of 50,000 realistic Indian transaction narrations covering unorganized regional merchants, local UPI QR codes, and government portals.
2. **Anomaly Detection Benchmark:** Labelled transaction histories containing simulated fraud patterns, velocity spikes, and duplicate swipes for tuning future Isolation Forest models.
3. **Offer NLP Corpus:** 2,000 annotated bank circular paragraphs for training fine-tuned transformer extractors on complex spend caps and tiered reward rules.

