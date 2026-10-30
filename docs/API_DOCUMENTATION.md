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
List all credit cards belonging to authenticated user.
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "crd_8f11a4...",
      "card_name": "HDFC Millennia",
      "bank_name": "HDFC Bank",
      "network": "VISA",
      "last_four_digits": "4892",
      "annual_fee": 1000.0,
      "rules_count": 4,
      "benefits_count": 2
    }
  ]
  ```

### `POST /api/v1/cards`
Register a new credit card with reward rules.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "card_name": "Axis Bank Ace",
    "bank_name": "Axis Bank",
    "network": "VISA",
    "last_four_digits": "1044",
    "annual_fee": 499.0,
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
    ]
  }
  ```

### `GET /api/v1/cards/{card_id}`
Retrieve card details, specific rules, and benefits.

### `DELETE /api/v1/cards/{card_id}`
Deactivate or remove card.

---

## 3. Reward Optimization & Comparison Endpoints

### `POST /api/v1/optimization/recommend`
Evaluate best card for a specific purchase amount, merchant, and category.
- **Request Body:**
  ```json
  {
    "amount": 2500.0,
    "category_id": "dining",
    "merchant_name": "Swiggy"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "recommended_card": {
      "card_id": "crd_8f11a4...",
      "card_name": "HDFC Millennia",
      "bank_name": "HDFC Bank",
      "expected_reward_monetary": 125.0,
      "effective_rate_percentage": 5.0,
      "reward_type": "CASHBACK"
    },
    "calculation_breakdown": {
      "applied_rule": "5.0% Accelerated Cashback on Dining (Swiggy)",
      "base_amount": 2500.0,
      "applied_cap": null,
      "net_value": 125.0
    },
    "alternatives": [
      {
        "card_name": "Axis Bank Ace",
        "expected_reward_monetary": 50.0,
        "effective_rate_percentage": 2.0
      }
    ],
    "explanation": "HDFC Millennia provides the highest net reward of ₹125.00 via its 5% accelerated dining partnership."
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
