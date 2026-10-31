# CLIQ Security Architecture & Controls

Security is a primary non-negotiable architectural pillar in CLIQ. The platform adheres to defense-in-depth principles across all tiers.

---

## 1. Authentication & Session Security

- **Supabase Auth / JWT Validation:**
  - Standard JSON Web Tokens (RS256 / HS256) signed with cryptographically secure secrets.
  - Backend verifies token signature, issuer (`iss`), audience (`aud`), and expiration (`exp`).
  - Strict extraction of user identity (`sub`) directly from the verified token payload.
  - Zero trust for any client-provided user identifier (e.g., query params, request body `user_id` are disregarded in favor of authenticated context).

---

## 2. Authorization & Tenant Isolation (IDOR Prevention)

- **Owner-Bound Resources:**
  - Every protected database query explicitly includes `WHERE user_id = :current_user_id`.
  - Attempts to access, edit, or delete another user's card, transaction, or document will return a clean `404 Not Found` or `403 Forbidden` error without leaking metadata.
- **Supabase Row-Level Security (RLS):**
  - RLS policies configured on PostgreSQL tables ensure database-level enforcement:
    ```sql
    CREATE POLICY "Users can only view their own credit cards"
    ON credit_cards FOR SELECT
    USING (auth.uid() = user_id);
    ```

---

## 3. Financial Data Privacy & PCI-DSS Minimization

- **Zero Sensitive Data Storage:**
  - CLIQ **NEVER** collects, transmits, or stores Card Verification Values (CVVs), PINs, passwords, or full 16-digit Primary Account Numbers (PANs).
  - Only card nicknames, issuers, card networks (Visa/Mastercard/Amex/RuPay), and optional masked last 4 digits (`•••• 1234`) are retained for user identification.
- **Safe Document Storage:**
  - Uploaded card policy and statement PDFs are stored in private isolated buckets.
  - Temporary access is granted solely via short-lived signed URLs (15-minute maximum TTL).

---

## 4. API & Network Protection

- **Input Validation:**
  - 100% of API inputs are validated and sanitized via Pydantic v2 schemas.
  - Automatic rejection of unexpected fields, excessive string lengths, negative amounts, or malformed characters.
- **Rate Limiting:**
  - In-memory token bucket limiter enforcing limits (default: 120 requests/minute per client IP) on sensitive endpoints (auth, document upload, AI chat).
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Content-Security-Policy: default-src 'self' ...`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **CORS:**
  - Explicit allowlist of trusted origins (`http://localhost:3000` for development, verified production domain). Wildcard `*` origins are strictly prohibited.

---

## 5. AI & LLM Security Safeguards

- **Centralized Privacy Gateway:**
  - All AI requests pass through `PrivacyGateway.execute_request` (`backend/app/services/privacy/privacy_gateway.py`). Direct calls from application endpoints or background jobs to third-party AI APIs are strictly forbidden.
- **Untrusted Input Treatment & Redaction:**
  - All user queries are processed by `SensitiveDataRedactor` prior to prompt assembly. Full card PANs (15/16 digits), CVVs, OTPs, PINs, Aadhaar, Income Tax PAN, bank account numbers, and passwords are automatically scrubbed and replaced with deterministic redaction tokens.
- **Prompt Injection Defense & Boundary Delimitation:**
  - Instructions and user queries are wrapped in strict XML boundary tags (`<system_instructions>`, `<verified_context>`, `<untrusted_user_query>`). Boundary tags inside user input are neutralized to prevent instruction breakout.
- **No LLM Decision Authority:**
  - The LLM does NOT calculate rewards, does NOT mutate database records directly, and does NOT approve financial transactions. All monetary math is handled deterministically via Python `Decimal`.
- **Data Minimization & Aggregation:**
  - Raw transaction line-items are never transmitted to external AI; only monthly category aggregates are provided. If consent is absent, card and spending context is completely withheld.

---

## 6. AI Consent, Transparency & Audit Trails

- **Explicit Opt-in Consent:**
  - New user profiles default to `external_ai_enabled = False`. Unless opted in, queries are resolved by the server's local deterministic engine with zero network egress.
- **Granular Permissions:**
  - Users independently configure `allow_card_context`, `allow_spending_summary_context`, and `allow_personalized_recommendations` via `/api/v1/privacy/consent`.
- **Immediate Revocation:**
  - Consent revocation is immediate and synchronously terminates external provider dispatch.
- **Privacy-Safe Audit Logging:**
  - `AiRequestAuditLog` tracks provider names, model IDs, token counts, latency, and redaction counts for compliance. Raw user queries, prompts, and PII are strictly excluded from logs.
