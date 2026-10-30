# CLIQ — SECURITY AUDIT REPORT

**Security Audit Date:** 2026-10-30  
**Lead Auditor:** Senior Application Security Engineer  
**Scope:** Full-stack CLIQ codebase (FastAPI backend, Next.js frontend, Supabase migration policies)  
**Standard:** OWASP Top 10 (2021), ASVS Level 2 Guidelines  
**Status:** **AUDIT PASSED (Conditional on cloud infrastructure hardening)**

---

## 1. Vulnerability Findings Summary

| Vulnerability Class | OWASP Category | Implemented Controls | Verified Status |
| :--- | :--- | :--- | :---: |
| **Broken Access Control (IDOR)** | A01:2021 | Application-level tenant scoping (`WHERE user_id = current_user.id`) on all queries | **PASS** |
| **Cryptographic Failures** | A02:2021 | Bcrypt salted hashing; HS256 JWT tokens with expiry checks; no plaintext credentials | **PASS** |
| **Injection (SQLi, Prompt)** | A03:2021 | SQLAlchemy 2.0 ORM parameterized queries; LLM grounding & deterministic fallbacks | **PASS** |
| **Insecure Design** | A04:2021 | Staging pattern (`extracted_card_data`) prevents unverified AI output from entering portfolio | **PASS** |
| **Security Misconfiguration** | A05:2021 | Hardened HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | **PASS** |
| **Vulnerable Components** | A06:2021 | Modern dependency pin: FastAPI 0.111+, Pydantic v2, bcrypt 4.1+, Next.js 14.2+ | **PASS** |
| **Identification & Auth Failures** | A07:2021 | HTTPBearer token extraction, session expiration, invalid signature rejection | **PASS** |
| **Software & Data Integrity** | A08:2021 | File magic-byte checks (`%PDF-`), file size ceiling (10MB), UUID disk storage | **PASS** |
| **Security Logging & Monitoring** | A09:2021 | Dedicated `audit_logs` table tracking sensitive actions (logins, uploads, card activations) | **PASS** |
| **Server-Side Request Forgery** | A10:2021 | External HTTP requests strictly limited to hardcoded Google Gemini endpoints | **PASS** |
| **Database Row-Level Security** | Supabase RLS | Migration file `001_initial_schema.sql` written with tenant isolation policies | **NOT VERIFIED\*** |

*\* Note: RLS policies were evaluated via static SQL analysis. Live execution against a production Supabase instance is NOT VERIFIED in the local SQLite development environment.*

---

## 2. In-Depth Security Domain Evaluations

### 2.1. Authentication & Session Management
- **Password Hashing:** Utilizes native `bcrypt` (`bcrypt.hashpw` and `bcrypt.checkpw`) with automated salt generation. Passwords are truncated safely at 72 bytes to prevent DOS attacks targeting bcrypt's computational cost.
- **JWT Verification:** All access tokens generated via `python-jose` with `HS256`. Claims include `sub` (user UUID), `iat` (issued at), `exp` (expiry timestamp), and `iss: "cliq-auth"`.
- **Token Invalidation:** Missing, expired, or tampered JWTs immediately yield `401 Unauthorized`.
- **Client Storage:** Auth session tokens in the Next.js frontend are managed via `localStorage` with header injection on all API requests. Recommendation for high-security production: migrate to `HttpOnly`, `SameSite=Strict` secure cookies.

### 2.2. Authorization & Tenant Isolation (IDOR Defense)
- **Direct Object Reference Protection:** All endpoints requiring resource IDs (`/cards/{id}`, `/transactions/{id}`, `/documents/{id}`, `/documents/{id}/verify`) enforce strict composite filters:
  ```python
  stmt = select(Resource).where(Resource.id == resource_id, Resource.user_id == current_user.id)
  ```
- **Rejection Standard:** Any request attempting to access or modify a resource owned by another tenant yields `404 Not Found` with the generic detail `"Resource not found or unauthorized access."`, intentionally preventing tenant enumeration or resource existence oracle attacks.
- **Automated Verification:** Verified by `test_idor_cross_tenant_isolation` and `test_document_staging_and_verification_workflow` in `backend/tests/security/`.

### 2.3. Row-Level Security (RLS) Analysis
- **PostgreSQL Migrations:** `supabase/migrations/001_initial_schema.sql` defines explicit PostgreSQL RLS policies for each table:
  ```sql
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can only view their own profile"
      ON profiles FOR SELECT USING (auth.uid() = id);
  ```
- **Audit Clarification:** The development environment executes on SQLite (`sqlite+aiosqlite:///./data/cliq.db`) for lightweight local iteration. Application-layer isolation is verified; Supabase cloud RLS must be re-verified upon deployment to a live Supabase project.

### 2.4. File Upload & Processing Security
- **MIME & Extension Whitelisting:** Strictly enforces `.pdf` extension and `application/pdf` MIME type.
- **Magic Byte Header Inspection:** Requires file buffer to begin with `b"%PDF-"`. Files with `.pdf` extension containing non-PDF binary or shell payloads are rejected with `400 Bad Request`.
- **Upload Size Ceiling:** Hard ceiling of 10MB (`MAX_UPLOAD_SIZE_BYTES = 10485760`).
- **Storage Isolation:** Uploaded files are stored with random UUID filenames (`{uuid.uuid4().hex}.pdf`) in an isolated directory (`backend/uploads`), preventing path traversal (`../`) attacks.
- **Denial of Service Prevention:** PDF extraction limits parsing to a maximum of 25 pages per document.

### 2.5. HTTP Security Headers & Middleware
Enforced on every incoming request via `SecurityHeadersMiddleware`:
- `Content-Security-Policy`: Restricts scripts, objects, and framing.
- `Strict-Transport-Security`: `max-age=31536000; includeSubDomains`.
- `X-Frame-Options`: `DENY` (prevents clickjacking attacks).
- `X-Content-Type-Options`: `nosniff` (prevents MIME-sniffing exploits).
- `X-XSS-Protection`: `1; mode=block`.
- `Referrer-Policy`: `strict-origin-when-cross-origin`.

### 2.6. Rate Limiting Defense
- **Middleware:** `RateLimitMiddleware` enforces an in-memory sliding window of 120 requests per minute per IP address.
- **Header Feedback:** When exceeded, returns HTTP `429 Too Many Requests` with a `Retry-After: 60` header.

### 2.7. Secret Management & Information Exposure
- **Source Code Sanitization:** Zero secret keys, API tokens, database passwords, or private certificates are hardcoded in the repository.
- **Environment Template:** `.env.example` provides placeholder schemas without real keys.
- **Audit Reports:** Audit documentation contains zero redacted or unredacted secrets.

---

## 3. Remediation Completed During Technical Audit

1. **Document Extraction Serialization Bug (FIXED):**
   - *Issue:* `ExtractedCardData` was attempting to serialize `Decimal` fields in `ExtractedRuleDraft` with standard `json.dumps()`, triggering `TypeError` on valid PDF uploads.
   - *Fix:* Added `default=str` to `json.dumps()` in `app/api/v1/documents.py`.
2. **Reward Engine Division by Zero Guard (FIXED):**
   - *Issue:* Calling `evaluate_card_for_transaction` with ₹0.00 spend caused `decimal.DivisionByZero` when calculating the effective percentage rate.
   - *Fix:* Added spend check in `engine.py:268` returning `Decimal("0.00")` for non-positive amounts.
3. **Pydantic Validation Defaults (FIXED):**
   - *Issue:* `ExtractedBenefitDraft` schema required `description` without a default value, triggering 422 during custom card verification requests with sparse benefit entries.
   - *Fix:* Set `description: Optional[str] = ""` in `app/schemas/document.py`.

---

## 4. Recommendations for Production Deployment

1. **HttpOnly Cookie Migration:** Transition JWT tokens from browser `localStorage` to `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
2. **Distributed Rate Limiting:** Replace in-memory sliding window with a Redis-backed token-bucket limiter (e.g. `redis-py` or Upstash) when horizontal scaling across multiple ASGI worker nodes.
3. **Live Supabase RLS Verification:** Execute end-to-end multi-tenant integration tests directly against the live Supabase PostgreSQL endpoint using the `service_role` and `anon` keys.

---

*Signed,*  
**Senior Application Security Engineer**  
CLIQ Security Audit Group

