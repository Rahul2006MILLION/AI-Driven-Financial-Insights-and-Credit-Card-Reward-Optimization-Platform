# CLIQ REST API Documentation

All API endpoints are versioned under `/api/v1`. Standard response envelopes and HTTP status codes are enforced across all operations.

---

## 1. Authentication & Profile Endpoints

### `GET /api/v1/profile`
Retrieve authenticated user profile and language preferences.
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "id": "usr_94b29c1e-...",
    "email": "user@example.com",
    "full_name": "Aarav Sharma",
    "preferred_language": "en",
    "currency": "INR",
    "is_active": true
  }
  ```

### `PUT /api/v1/profile`
Update user language preferences and display name.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "full_name": "Aarav Sharma",
    "preferred_language": "hi",
    "currency": "INR"
  }
  ```

---

## 2. Credit Card Endpoints

### `GET /api/v1/cards`
List all credit cards belonging to authenticated user with optional search & filtering.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `query` (optional string): Search term matching bank name, card name, or variant.
  - `bank` (optional string): Filter by bank name (e.g., `HDFC Bank`).
  - `network` (optional string): Filter by network (`VISA`, `MASTERCARD`, `RUPAY`, `AMEX`).
  - `is_active` (optional bool): Filter by active status (defaults to true).
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "crd_8f11a4...",
      "card_name": "HDFC Millennia",
      "bank_name": "HDFC Bank",
      "network": "VISA",
      "card_variant": "Millennia Cashback",
      "last_four_digits": "4892",
      "joining_fee": 1000.0,
      "annual_fee": 1000.0,
      "fee_waiver_spend_threshold": 100000.0,
      "fee_waiver_condition_details": "Waived on spends of ₹1,00,000 in a calendar year",
      "terms_source_url": "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-cards",
      "rules_count": 4,
      "benefits_count": 2
    }
  ]
  ```

### `POST /api/v1/cards`
Register a new credit card with reward rules, variant, fees, waiver conditions, and structured benefits.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "card_name": "Axis Bank Ace",
    "bank_name": "Axis Bank",
    "network": "VISA",
    "card_variant": "Ace Contactless",
    "last_four_digits": "1044",
    "joining_fee": 499.0,
    "annual_fee": 499.0,
    "fee_waiver_spend_threshold": 200000.0,
    "fee_waiver_condition_details": "Annual fee reversed on spending ₹2,00,000 in the previous year",
    "terms_source_url": "https://www.axisbank.com/retail/cards/credit-card/ace-credit-card",
    "rules": [
      {
        "category_id": "utility",
        "reward_type": "CASHBACK",
        "reward_rate_percentage": 5.0,
        "monthly_cap_amount": 500.0
      },
      {
        "category_id": "all",
        "reward_type": "CASHBACK",
        "reward_rate_percentage": 2.0
      }
    ],
    "benefits": [
      {
        "benefit_type": "PERMANENT_BENEFIT",
        "applicable_category": "utility",
        "title": "5% Google Pay Bill Pay",
        "description": "5% cashback on utility bill payments and mobile recharges on Google Pay",
        "reward_percentage_or_points": 5.0,
        "reward_basis": "PERCENTAGE",
        "cap_amount": 500.0,
        "cap_period": "MONTHLY"
      }
    ]
  }
  ```

### `PUT /api/v1/cards/{card_id}`
Update card details, annual fees, waiver terms, and replace or update nested rules and benefits.

### `GET /api/v1/cards/{card_id}`
Retrieve card details, specific rules, and benefits.

### `DELETE /api/v1/cards/{card_id}`
Deactivate or remove card from portfolio.

---

## 3. Offers Discovery Endpoints

### `GET /api/v1/offers`
List curated and active merchant offers.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `category` (optional string): Filter by category (`shopping`, `dining`, `food_delivery`, `travel`, `entertainment`, `grocery`, `utility`, `all`).
  - `expiring_soon` (optional bool): Return only offers expiring within 7 days.
  - `user_cards_only` (optional bool): Filter offers applicable specifically to the user's registered cards.
  - `query` (optional string): Search by merchant name or offer title.
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "off_swiggy_hdfc",
      "merchant_name": "Swiggy",
      "offer_title": "₹150 Instant Off on Food Delivery",
      "discount_type": "PERCENTAGE",
      "discount_percentage": 15.0,
      "minimum_transaction_value": 800.0,
      "maximum_discount": 150.0,
      "eligible_banks": ["HDFC Bank"],
      "eligible_card_names": ["HDFC Millennia", "HDFC Regalia"],
      "valid_from": "2025-01-01T00:00:00Z",
      "expiry_date": "2026-12-31T23:59:59Z",
      "applicable_payment_channel": "ONLINE",
      "promo_code": "HDFCSWIGGY150",
      "activation_requirement": "Apply coupon at checkout",
      "verification_status": "VERIFIED",
      "terms_and_conditions": "Valid once per user per week on food orders above ₹800."
    }
  ]
  ```

### `GET /api/v1/offers/{offer_id}`
Retrieve detailed offer specifications, terms, and source references.

### `POST /api/v1/offers`
Register or submit a new card offer (admin or verified source).

---

## 4. Reward Optimization & Comparison Endpoints

### `POST /api/v1/optimization/recommend`
Evaluate best card for a specific purchase amount, merchant, category, and payment channel. Combines upfront instant discounts with post-transaction rewards to maximize net financial benefit.
- **Request Body:**
  ```json
  {
    "amount": 2000.0,
    "category_id": "dining",
    "merchant_name": "Swiggy",
    "payment_channel": "ONLINE"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "recommended_card": {
      "card_id": "crd_8f11a4...",
      "card_name": "HDFC Millennia",
      "bank_name": "HDFC Bank",
      "instant_discount_monetary": 150.0,
      "post_reward_monetary": 92.5,
      "net_financial_benefit": 242.5,
      "expected_reward_monetary": 242.5,
      "effective_rate_percentage": 12.125,
      "reward_type": "CASHBACK",
      "applicable_offers": [
        {
          "offer_id": "off_swiggy_hdfc",
          "merchant_name": "Swiggy",
          "offer_title": "₹150 Instant Off on Food Delivery",
          "promo_code": "HDFCSWIGGY150",
          "instant_discount_amount": 150.0
        }
      ]
    },
    "calculation_breakdown": {
      "applied_rule": "5.0% Accelerated Cashback on Dining (Swiggy)",
      "base_amount": 2000.0,
      "instant_discount_applied": 150.0,
      "net_charge_amount": 1850.0,
      "post_reward_monetary": 92.5,
      "total_net_benefit": 242.5
    },
    "alternatives": [
      {
        "card_name": "Axis Bank Ace",
        "instant_discount_monetary": 0.0,
        "post_reward_monetary": 40.0,
        "net_financial_benefit": 40.0,
        "effective_rate_percentage": 2.0
      }
    ],
    "explanation": "HDFC Millennia delivers maximum net benefit of ₹242.50: ₹150.00 upfront instant discount with coupon HDFCSWIGGY150, plus ₹92.50 in post-transaction cashback (5.0%) on the net charged ₹1,850.00."
  }
  ```

### `POST /api/v1/optimization/compare`
Side-by-side comparison of 2 or more credit cards across categories.

---

## 4. Document Intelligence Endpoints

### `POST /api/v1/documents/upload`
Upload a credit card policy or statement PDF (multipart/form-data).
- **File constraints:** Max 10MB, PDF only.

### `GET /api/v1/documents`
List user uploaded documents and extraction statuses.

### `POST /api/v1/documents/{document_id}/verify`
Confirm, adjust, and activate staged card rules into production portfolio.

---

## 5. Analytics & Financial Health Endpoints

### `GET /api/v1/analytics/spending`
Categorical and monthly spending metrics.

### `GET /api/v1/analytics/rewards`
Total earned rewards vs. missed reward opportunities.

### `GET /api/v1/analytics/financial-health`
Recurring subscriptions, annual fee breakeven analysis, and optimization efficiency score.

---

## 6. Multilingual AI Assistant Endpoint

### `POST /api/v1/assistant/chat`
Conversational financial guidance grounded in user's cards.
- **Request Body:**
  ```json
  {
    "query": "स्विगी पर कौन सा कार्ड इस्तेमाल करूँ?",
    "language": "hi"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "response": "स्विगी पर आपके एचडीएफसी मिलेनिया कार्ड का उपयोग करें। इस पर आपको 5% कैशबैक (अधिकतम ₹1,000 प्रति माह) मिलेगा, जबकि आपके अन्य कार्ड्स पर केवल 2% मिलेगा।",
    "language": "hi",
    "grounded_card_ids": ["crd_8f11a4..."],
    "citations": ["HDFC Millennia Dining Policy"]
  }
  ```
