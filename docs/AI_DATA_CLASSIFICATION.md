# CLIQ — AI Data Classification & Sensitive Data Handling Matrix

## 1. Overview & Classification Schema

To prevent accidental data exposure across external AI and logging interfaces, CLIQ implements a four-tier classification policy based on sensitivity, regulatory risk (RBI, DPDPA 2023, PCI-DSS), and operational necessity.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA CLASSIFICATION TIERS                       │
├─────────────────┬──────────────────────────────────────────────────────┤
│ 1. PUBLIC       │ Freely sharable; public bank terms, general knowledge│
│ 2. INTERNAL     │ System config, rules schemas, confidence scores      │
│ 3. SENSITIVE    │ User metadata, card nicknames, aggregated spends     │
│ 4. HIGHLY_SENSITIVE│ PAN, CVV, PIN, OTP, Aadhaar, PAN Card, Passwords  │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 2. Four-Tier Classification Definition

### Tier 1: PUBLIC
- **Definition:** Information that is in the public domain and poses zero privacy risk to individuals.
- **AI Processing Policy:** Permitted to enter external AI prompts without restriction or anonymization.
- **Examples:**
  - Standard credit card marketing brochures and public reward terms.
  - General financial terminology definitions (APR, compounding interest, billing cycle).
  - RBI Master Directions and circular guidelines.
  - Approved public merchant discounts (e.g. "10% off at Zomato with HDFC Bank").

### Tier 2: INTERNAL
- **Definition:** System configurations, internal processing metadata, and architectural parameters.
- **AI Processing Policy:** Permitted in external AI prompts only when strictly required for task completion; never contains personal identity.
- **Examples:**
  - System task types (`CARD_RECOMMENDATION`, `SPENDING_SUMMARY`).
  - Extracted rule schema versions and confidence scoring weights.
  - Source connector identifiers and ingestion channel names.

### Tier 3: SENSITIVE
- **Definition:** User-specific financial data, transaction categories, and card portfolio details that identify financial habits or holdings.
- **AI Processing Policy:**
  - **Requires explicit, unrevoked user consent** (`allow_card_context`, `allow_spending_summary_context`).
  - **Must be strictly minimized and aggregated.**
  - Individual transaction records (merchant names, dates, amounts) are **never** shared; only month-level category totals are provided.
- **Examples:**
  - User credit card issuer, variant name, and network (e.g., "ICICI Amazon Pay Visa").
  - Masked card number last 4 digits (`•••• 4242`).
  - Monthly spending aggregates (`Dining: ₹4,500`, `Travel: ₹12,000`).
  - Preferred language (`hi`, `kn`, `en`).

### Tier 4: HIGHLY_SENSITIVE
- **Definition:** Authentication credentials, government identifiers, primary account numbers, and secrets whose exposure causes financial loss or identity theft.
- **AI Processing Policy:**
  - **ABSOLUTE BAN:** Must NEVER enter external AI provider prompts, prompts logs, system logs, or error traces under any condition.
  - If detected in incoming user queries, it is immediately stripped and replaced with deterministic redaction tokens prior to any further processing.
- **Examples:**
  - Full 15-digit or 16-digit Primary Account Number (PAN).
  - Card Verification Values (CVV / CVC / CVV2).
  - Card PINs, UPI PINs, and Net Banking passwords.
  - One-Time Passwords (OTPs) and multi-factor authorization codes.
  - Indian Aadhaar numbers (12 digits).
  - Indian Income Tax PAN numbers (10 alphanumeric characters).
  - Bank account numbers and IFSC credential pairs.
  - API keys, session tokens, and Bearer JWTs.

---

## 3. Field-by-Field Classification Matrix

The table below catalogs every data field across CLIQ database entities, showing its classification and external AI transmission policy:

| Entity | Field Name | Data Classification | Can Enter External AI? | Sanitization / Minimization Required |
|---|---|---|---|---|
| **Profile** | `id` (UUID) | INTERNAL | No | Excluded from prompts |
| **Profile** | `email` | SENSITIVE | No | Excluded; sanitized if typed in query |
| **Profile** | `full_name` | SENSITIVE | No | Excluded; sanitized if typed in query |
| **Profile** | `preferred_language` | PUBLIC | Yes | Used to format output language |
| **CreditCard** | `card_name` / `nickname` | SENSITIVE | Yes (with Consent) | Included only if user consented to card context |
| **CreditCard** | `bank_name` | PUBLIC | Yes (with Consent) | Included only if user consented to card context |
| **CreditCard** | `card_network` | PUBLIC | Yes (with Consent) | Visa/Mastercard/Amex/RuPay |
| **CreditCard** | `card_variant` | PUBLIC | Yes (with Consent) | Standard public variant name |
| **CreditCard** | `last_four` | SENSITIVE | Yes (with Consent) | Masked format `•••• 1234` only |
| **CreditCard** | `full_card_pan` | **HIGHLY_SENSITIVE** | **NEVER** | Redacted via `SensitiveDataRedactor` |
| **CreditCard** | `cvv` / `pin` | **HIGHLY_SENSITIVE** | **NEVER** | Not stored; redacted if in query |
| **CreditCard** | `credit_limit` | SENSITIVE | No | Excluded from AI context |
| **CreditCard** | `billing_cycle_day` | SENSITIVE | No | Excluded from AI context |
| **Transaction** | `merchant_name` | SENSITIVE | No | Excluded from individual transaction feeds |
| **Transaction** | `amount` | SENSITIVE | No | Aggregated into category sums only |
| **Transaction** | `category` | PUBLIC | Yes (with Consent) | Used in aggregated spending summaries |
| **Transaction** | `transaction_date` | SENSITIVE | No | Grouped by month; raw dates excluded |
| **Offer** | `merchant_name` | PUBLIC | Yes | Public merchant discount info |
| **Offer** | `discount_type` / `value` | PUBLIC | Yes | Public verified terms |
| **Offer** | `terms_and_conditions` | PUBLIC | Yes | Public verified terms |
| **UserAiConsent** | `external_ai_enabled` | INTERNAL | No | Evaluated server-side by `ConsentService` |
| **UserAiConsent** | `consent_version` | INTERNAL | No | Used for compliance auditing |
| **AiRequestAuditLog** | `prompt_token_count` | INTERNAL | No | Audit metric only |
| **AiRequestAuditLog** | `redaction_count` | INTERNAL | No | Security metric only |

---

## 4. Redaction & Tokenization Specifications

When sensitive or highly sensitive fields are encountered in untrusted user queries, they are converted into explicit non-reversible placeholder tokens by `SensitiveDataRedactor`:

```python
# Transformation Rules Applied by SensitiveDataRedactor
"Card 4111222233334444"        --> "Card [REDACTED_CARD_PAN]"
"Amex 3782-822463-10005"       --> "Amex [REDACTED_CARD_PAN]"
"CVV is 942"                   --> "[REDACTED_CVV]"
"OTP is 482910"                --> "[REDACTED_OTP_PIN]"
"Aadhaar: 2345 6789 0123"      --> "Aadhaar: [REDACTED_AADHAAR]"
"PAN: ABCDE1234F"              --> "PAN: [REDACTED_TAX_PAN]"
"A/c no 123456789012"          --> "[REDACTED_BANK_ACCOUNT]"
"Bearer eyJhbGciOi..."         --> "[REDACTED_AUTH_TOKEN]"
```

These tokens provide semantic context to the AI model (allowing it to inform the user that credentials were detected and safely removed) without disclosing any secret values.
