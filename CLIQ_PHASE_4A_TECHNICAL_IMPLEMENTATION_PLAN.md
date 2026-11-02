# CLIQ Phase 4A — Technical Implementation Plan

**Date:** 2026-11-02
**Scope:** Desktop-first. Mobile development deferred to a future phase.
**Baseline:** Phase 3.3 complete. Test baseline: 79/79 backend unit, 40/40 security, 42/42 frontend, 0 TypeScript errors, 23/23 Next.js static pages.
**Status:** Planning only. No source code has been modified.

---

## Executive Summary

Phase 4A resolves the seven highest-priority gaps identified in the Feature Completeness Audit before any new product features (Phase 4 Scam Shield) are started. The workstreams are ordered from highest data-protection risk to lowest, but are designed to be implemented in parallel by two engineers.

| # | Workstream | Risk Level | New Files | API Changes | DB Changes |
|:--|:---|:---|:---|:---|:---|
| WS-1 | Server-side account deletion | Critical | 0 | 1 new endpoint | 0 (use existing CASCADE) |
| WS-2 | User data export | Critical | 1 new service | 1 new endpoint | 0 |
| WS-3 | Secure password reset | High | 1 new model, 2 new endpoints | 2 new endpoints | 1 new table + migration |
| WS-4 | Admin nav & auth consistency | Low | 0 | 0 | 0 |
| WS-5 | Persistent financial preferences | Medium | 0 | 2 endpoints (extend existing) | 0 (model already complete) |
| WS-6 | Configurable category budgets | Medium | 0 | 1 endpoint (extend existing) | 0 (column already exists) |
| WS-7 | Desktop UX: notifications & alerts | Low | 2 new components | 0 | 0 |

**No new database tables are required for WS-1, 2, 4, 5, 6, 7.** Only WS-3 requires a migration.

---

## Current-State Findings

### Critical Issues (P0)

**WS-1 — Account Deletion:**
`settings/page.tsx:36–40` calls `clearSession()` then `router.push("/register")`. No HTTP request is made to the backend. All user data (profile, cards, transactions, incomes, budget, documents, learning progress) persists on the server indefinitely after the user believes they have deleted their account. This violates the right to erasure.

**WS-2 — Data Export:**
`settings/page.tsx:32` calls `alert("Exporting verified portfolio records to encrypted JSON archive...")`. No backend export endpoint exists anywhere in the codebase.

### High Issues (P1)

**WS-3 — Password Reset:**
`backend/app/api/v1/auth.py` has `register`, `login`, `get_profile`, and `update_profile` only. No forgot-password, reset-token, or change-password endpoints exist. Users who forget their password have no recovery path. `backend/app/core/config.py` has no email/SMTP configuration — email infrastructure does not exist and must be added alongside the reset flow.

**WS-4 — Admin Navigation:**
`frontend/components/Sidebar.tsx:78–88` renders the "Offer Review Desk" navigation link for every authenticated user regardless of admin status. The admin page itself correctly guards content with `isAdmin` check, but the nav link exposes the admin route URL to all users.

### Medium Issues (P2)

**WS-5 — Persistent Preferences:**
`settings/page.tsx:25–29` defines `prioritizeCashback` and `includeFeeNet` state. `handleSavePreferences` (line 25) calls `setSavedSettings(true)` only — no API call. The `UserPreference` model already has `prioritize_cashback` (BOOLEAN, DEFAULT TRUE) and `include_annual_fee_in_net` (BOOLEAN, DEFAULT FALSE) columns. The `PUT /education/path` endpoint writes to `UserPreference.financial_path`. A `GET/PUT /profile/preferences` endpoint needs to be added to expose the remaining fields.

**WS-6 — Category Budgets:**
`budget/page.tsx:163–167` hardcodes `grocery:35%, dining:15%, utility:20%, shopping:15%, other:15%` on every budget save. The `UserBudget.category_budgets_json` TEXT column and `PUT /education/budget` endpoint already support arbitrary category maps. The frontend UI needs to expose per-category editing instead of applying the fixed split.

**WS-7 — Desktop UX (Alerts):**
10+ `alert()` / `confirm()` calls across 6 page files. No reusable notification or confirmation component exists. Error states are browser modal dialogs instead of inline feedback.

---

## Database & Cascade Analysis

### Entity Ownership Map

Every entity in the database is either **user-owned** (must be deleted on account deletion), **anonymizable** (retain for compliance, null the user_id), or **system-owned** (no user relationship).

```
USER-OWNED (ON DELETE CASCADE in ORM or DB):
├── profiles                      ← root, delete last
│   ├── credit_cards              ← ON DELETE CASCADE (ORM + DB)
│   │   ├── card_reward_rules     ← ON DELETE CASCADE (ORM + DB)
│   │   └── card_benefits         ← ON DELETE CASCADE (ORM + DB)
│   ├── transactions              ← ON DELETE CASCADE (ORM + DB)
│   ├── incomes                   ← ON DELETE CASCADE (ORM + DB)
│   ├── user_budgets              ← ON DELETE CASCADE (DB)
│   ├── user_learning_progress    ← ON DELETE CASCADE (DB)
│   ├── uploaded_documents        ← ON DELETE CASCADE (ORM + DB)
│   │   └── extracted_card_data   ← ON DELETE CASCADE (ORM + DB)
│   ├── reward_analysis           ← ON DELETE CASCADE (DB)
│   ├── user_preferences          ← ON DELETE CASCADE (ORM + DB)
│   └── user_ai_consents          ← ON DELETE CASCADE (ORM + DB)

ANONYMIZABLE (preserve, SET user_id = NULL):
├── audit_logs                    ← FK ondelete="SET NULL", retain for security audit trail
└── ai_request_audit_logs         ← FK ondelete="SET NULL", retain for privacy compliance

    !! IMPORTANT: The ORM Profile.audit_logs relationship has cascade="all, delete-orphan"
    !! and Profile.ai_audit_logs has cascade="all, delete-orphan".
    !! SQLAlchemy will DELETE these if session.delete(profile) is called directly.
    !! The deletion handler MUST manually SET NULL on these tables BEFORE deleting the profile.

SYSTEM-OWNED (no user relationship, never deleted):
├── spending_categories           ← seeded reference data
├── offer_sources                 ← seeded admin data
├── admin_offer_documents         ← uploaded_by_id is VARCHAR(36), not a FK
├── card_offers                   ← system-wide
├── offer_audit_logs              ← offer-scoped, not user-scoped
└── source_failure_logs           ← system monitoring
```

### Physical File Storage

`UploadedDocument.file_path` (VARCHAR 512) stores a local filesystem path for uploaded PDFs. These files must be deleted from disk when the account is deleted. The deletion handler must read `file_path` for each uploaded document before deleting the row.

---

## Workstream Designs

---

### WS-1: Server-Side Account Deletion

#### Design Principles
- **Hard deletion** of all user-owned data — no soft delete or tombstone
- **Preservation** of security audit trail (`audit_logs`) and AI privacy compliance log (`ai_request_audit_logs`) with user_id anonymized to NULL
- **Reauthentication required** — the deletion endpoint requires the user to supply their current password in the request body to confirm intent
- **Confirmation workflow** — frontend shows a modal with a type-to-confirm prompt (type "DELETE") before making the API call
- **Token invalidation** — the server cannot actively invalidate existing JWTs (no blacklist). Instead, the deletion immediately sets `is_active=False` on the profile, which causes all subsequent `get_current_user` calls to fail. The existing token becomes inert within the request cycle.
- **Cross-user protection** — the deletion acts only on `current_user.id` from the JWT, never on a user_id passed in the request body

#### API Design

```
DELETE /auth/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "current_password_for_confirmation"
}

Response 200:
{
  "message": "Account permanently deleted. All your data has been removed.",
  "deleted_at": "2026-11-02T10:30:00Z"
}

Response 400: "Password confirmation is required."
Response 401: "Password is incorrect."
Response 429: (rate limited — max 3 attempts per hour per user)
```

#### Deletion Sequence (ordered)

```
1. Verify password against current_user.hashed_password (bcrypt)
2. Fetch all UploadedDocument.file_path for this user (for disk cleanup)
3. UPDATE audit_logs SET user_id = NULL WHERE user_id = current_user.id
4. UPDATE ai_request_audit_logs SET user_id = NULL WHERE user_id = current_user.id
5. await db.commit()  ← anonymization committed before deletion
6. Set current_user.is_active = False (prevents any in-flight requests from succeeding)
7. await db.commit()
8. DELETE FROM profiles WHERE id = current_user.id
   ← DB CASCADE deletes: credit_cards, card_reward_rules, card_benefits,
      transactions, incomes, user_budgets, user_learning_progress,
      uploaded_documents, extracted_card_data, reward_analysis,
      user_preferences, user_ai_consents
9. await db.commit()
10. Delete physical files from disk for each UploadedDocument.file_path collected in step 2
    (best-effort, log failures but do not abort the deletion)
11. Log: AuditLog(user_id=None, action="ACCOUNT_DELETED", details={"email_hash": sha256(email)})
12. Return 200
```

**Why this order matters:** Steps 3–5 must complete before step 8. If the ORM deletion runs first, the audit_logs FK would cascade via ORM and delete the rows, losing the audit trail.

#### Files to Change

| File | Change |
|:---|:---|
| `backend/app/api/v1/auth.py` | Add `DELETE /auth/account` handler |
| `backend/app/schemas/auth.py` | Add `AccountDeleteRequest(password: str)` schema |
| `frontend/app/settings/page.tsx` | Replace `clearSession() + redirect` with modal + API call |

#### Frontend Changes

Replace the current `handleDeleteAccount` function with a two-step flow:
1. Clicking "Delete Account" opens a confirmation modal (not `window.confirm()`), which is part of WS-7
2. Modal requires user to type `"DELETE"` in a text input and enter current password
3. On confirm: calls `DELETE /auth/account` with `{password}` body
4. On success: calls `clearSession()` then `router.push("/register")`
5. On error: shows inline error in the modal (wrong password, rate limited)

#### Security Controls
- Bcrypt password verification — no timing attack surface
- Rate limit: 3 password-check attempts per user per hour (track via in-memory rate limiter keyed on user_id, not IP)
- Response is identical for "wrong password" and "user not found" (no enumeration)
- Audit log entry created even on failed attempts (with user_id = None after deletion)

#### Acceptance Criteria
- [ ] `DELETE /auth/account` with correct password returns 200 and removes all user-owned data
- [ ] Subsequent `GET /auth/me` with the same JWT returns 401
- [ ] `audit_logs` entries with `user_id` set to NULL are preserved after deletion
- [ ] `ai_request_audit_logs` entries with `user_id` set to NULL are preserved
- [ ] Uploaded PDF files are removed from disk
- [ ] `DELETE /auth/account` with wrong password returns 401 and increments rate-limit counter
- [ ] Frontend settings page: "Delete Account" opens modal, not `window.confirm()`
- [ ] Frontend: successful deletion clears session and redirects to `/register`
- [ ] Existing unit tests pass — zero regressions

**Complexity:** Small–Medium (backend ~60 lines, frontend modal ~80 lines)

---

### WS-2: User Data Export

#### Design Principles
- **Single authenticated endpoint** returning all user-owned financial data
- **JSON format** — structured, machine-readable, re-importable
- **No sensitive credential fields** — excludes `hashed_password`, internal IDs are included (user owns their data), no auth tokens
- **Consistent monetary precision** — all Decimal values serialized as strings (not floats) to preserve exactness
- **ISO 8601 dates** throughout
- **User-level isolation** — every query is scoped by `current_user.id`
- **No file streaming** — response is JSON in the body (all user data fits in a few hundred KB at most)

#### API Design

```
GET /auth/export
Authorization: Bearer <token>

Response 200:
Content-Type: application/json
Content-Disposition: attachment; filename="cliq_export_2026-11-02.json"

{
  "export_metadata": {
    "cliq_version": "0.4.0",
    "export_format": "1.0",
    "exported_at": "2026-11-02T10:30:00Z",
    "user_id": "uuid"
  },
  "profile": {
    "email": "user@example.com",
    "full_name": "Aarav Sharma",
    "preferred_language": "en",
    "currency": "INR",
    "financial_pathway": "CREDIT_CARD",
    "created_at": "2026-01-15T09:00:00Z"
  },
  "preferences": {
    "prioritize_cashback": true,
    "prioritize_miles": false,
    "include_annual_fee_in_net": false,
    "monthly_spend_target": null,
    "budget_alert_threshold": "80.00"
  },
  "credit_cards": [
    {
      "card_name": "HDFC Regalia Gold",
      "bank_name": "HDFC Bank",
      "network": "Visa",
      "nickname": "Primary Travel",
      "annual_fee": "2500.00",
      "is_active": true,
      "reward_rules": [...],
      "benefits": [...]
    }
  ],
  "transactions": [
    {
      "merchant_name": "Swiggy",
      "amount": "450.00",
      "currency": "INR",
      "transaction_date": "2026-10-15T19:30:00Z",
      "category_id": "food_delivery",
      "payment_method": "CREDIT_CARD",
      "reward_earned_monetary": "22.50",
      "is_recurring": false
    }
  ],
  "incomes": [
    {
      "source_name": "Primary Salary",
      "amount": "85000.00",
      "frequency": "MONTHLY",
      "is_irregular": false,
      "received_date": "2026-11-01T00:00:00Z"
    }
  ],
  "budget": {
    "monthly_income": "85000.00",
    "total_budget": "60000.00",
    "category_budgets": {
      "grocery": "15000.00",
      "dining": "8000.00"
    }
  },
  "learning_progress": [
    {
      "topic_id": "cf-01-how-cards-work",
      "category_id": "credit_fundamentals",
      "is_completed": true,
      "quiz_score": 80,
      "completed_at": "2026-10-20T14:00:00Z"
    }
  ],
  "ai_consent": {
    "external_ai_enabled": true,
    "allow_card_context": true,
    "allow_spending_context": false,
    "consent_version": "1.0"
  },
  "documents": [
    {
      "filename": "hdfc_regalia_tnc.pdf",
      "mime_type": "application/pdf",
      "file_size_bytes": 204800,
      "processing_status": "VERIFIED",
      "uploaded_at": "2026-09-10T11:00:00Z"
    }
  ]
}
```

**Excluded:** `hashed_password`, `role`, `is_admin`, internal FK IDs between tables (card_id on transactions is replaced by card_name for readability), `deduplication_hash`, `import_batch_id`, `raw_description` (may contain bank reference strings, included optionally).

#### Service Architecture

Create `backend/app/services/export/data_export_service.py` — a stateless service class with one public method `DataExportService.build_user_export(user_id, db)` that runs all queries and constructs the export dict. This keeps `auth.py` thin.

#### Files to Change

| File | Change |
|:---|:---|
| `backend/app/api/v1/auth.py` | Add `GET /auth/export` handler |
| `backend/app/services/export/data_export_service.py` | New file — export assembly service |
| `backend/app/schemas/auth.py` | Add `ExportResponse` schema (or return `JSONResponse` directly with `Content-Disposition` header) |
| `frontend/app/settings/page.tsx` | Replace `alert()` with real `fetch()` call + download trigger |

#### Frontend Download Trigger

```typescript
const handleExportData = async () => {
  const res = await apiFetch("/auth/export", { method: "GET" }, { rawResponse: true })
  // trigger browser download via blob URL
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `cliq_export_${new Date().toISOString().split("T")[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

Note: `apiFetch` currently returns parsed JSON. A minor extension is needed to support raw response passthrough for binary/file download. Alternative: return a signed download URL (but that requires storage infrastructure). Simplest approach: return JSON with `Content-Disposition: attachment` header — browser will download.

#### Security Controls
- Requires valid JWT (`get_current_user` dependency)
- All queries scoped by `current_user.id` — identical to existing tenant isolation pattern
- No `hashed_password` or `role`/`is_admin` in output
- Rate limit: 5 export requests per user per hour (export is expensive; prevents data harvesting via compromised token)
- `Content-Disposition: attachment` prevents inline rendering

#### Acceptance Criteria
- [ ] `GET /auth/export` returns 200 with all user-owned data in JSON
- [ ] Response contains no `hashed_password` field
- [ ] All monetary values are serialized as strings (not floats)
- [ ] All dates are ISO 8601 strings
- [ ] Export for User A does not contain any data belonging to User B
- [ ] Frontend "Export Data" button triggers file download, not `alert()`
- [ ] Downloaded file is valid JSON and parseable

**Complexity:** Medium (backend ~120 lines in service, ~15 lines in route)

---

### WS-3: Secure Password Reset

#### Current State
No password reset infrastructure exists. `config.py` has no SMTP or email settings.

#### Email Infrastructure Requirement
Password reset requires a transactional email service. This is a **prerequisite external dependency** that must be resolved before this workstream can go live.

**Recommended approach:** Add [Resend](https://resend.com) or SMTP-via-SendGrid as the email provider. FastAPI-Mail (`fastapi-mail` PyPI package) provides async email dispatch compatible with the existing async architecture.

**New config fields required:**
```ini
# .env / config.py additions
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=re_xxxx
EMAIL_FROM=noreply@cliq.finance
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60
```

**If email is not available in a given environment:** The token endpoint returns the token directly in the response body for development/testing (controlled by `ENVIRONMENT=development` flag). In production this field is omitted.

#### New Database Table: `password_reset_tokens`

```python
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str]                    # VARCHAR(36), PK, UUID
    user_id: Mapped[str]               # FK → profiles.id, ON DELETE CASCADE
    token_hash: Mapped[str]            # VARCHAR(64), UNIQUE, SHA-256 of raw token
    expires_at: Mapped[datetime]       # DATETIME, NOT NULL
    is_used: Mapped[bool]              # BOOLEAN, DEFAULT FALSE
    created_at: Mapped[datetime]       # DATETIME, DEFAULT utcnow
    ip_address: Mapped[Optional[str]]  # VARCHAR(64), for audit
```

**Token design:**
- Raw token: `secrets.token_urlsafe(32)` → 43-character URL-safe string
- Stored: `hashlib.sha256(raw_token.encode()).hexdigest()` — only the hash is stored
- Expiry: 60 minutes from creation
- Single-use: `is_used` set to True on redemption, checked before applying reset
- Old unused tokens for the same user are invalidated (set is_used=True) when a new one is requested

#### Alembic Migration

New migration `d5e6f7a8b9c0_add_password_reset_tokens.py` (after HEAD `c1f3a2b4e5d6`):

```python
def upgrade():
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("is_used", sa.Boolean, nullable=False, default=False),
        sa.Column("created_at", sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column("ip_address", sa.String(64), nullable=True),
    )
    op.create_index("ix_prt_token_hash", "password_reset_tokens", ["token_hash"], unique=True)
    op.create_index("ix_prt_user_id", "password_reset_tokens", ["user_id"])
```

Also add to `main.py init_db()` DDL guard for SQLite local dev:
```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    ip_address VARCHAR(64)
);
```

#### API Design

**Endpoint 1 — Request Reset:**
```
POST /auth/forgot-password
Content-Type: application/json
No Authorization required

{
  "email": "user@example.com"
}

Response 200 (always, even if email not found — prevent enumeration):
{
  "message": "If an account with that email exists, a password reset link has been sent.",
  "dev_token": "abc123..."   // only present when ENVIRONMENT=development
}
```

**Endpoint 2 — Apply Reset:**
```
POST /auth/reset-password
Content-Type: application/json
No Authorization required

{
  "token": "raw_token_from_email_link",
  "new_password": "NewSecurePassword@123"
}

Response 200:
{
  "message": "Password successfully updated. You can now log in with your new password."
}

Response 400: "Reset token is invalid or has expired."
Response 400: "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character."
Response 429: Rate limited
```

#### Forgot-Password Handler Logic

```
1. Normalize email (lowercase, strip)
2. Look up Profile by email — DO NOT reveal if found or not
3. If found:
   a. Invalidate any existing unused tokens for this user (UPDATE is_used=True)
   b. Generate raw_token = secrets.token_urlsafe(32)
   c. token_hash = sha256(raw_token)
   d. expires_at = utcnow + 60 minutes
   e. INSERT password_reset_tokens
   f. Send email with link: https://app.cliq.finance/reset-password?token=<raw_token>
   g. Log AuditLog(action="PASSWORD_RESET_REQUESTED", user_id=user.id)
4. Return 200 with generic message (regardless of whether user was found)
```

**Rate limiting for forgot-password:** Max 3 requests per IP per 15 minutes. Prevents mass email bombing. Use existing `RateLimitMiddleware` pattern or keyed in-memory counter on IP address.

#### Reset-Password Handler Logic

```
1. Validate new_password meets policy (min 8 chars, uppercase, lowercase, digit, special char)
   → Return 400 with specific message if invalid (safe to reveal — not enumeration)
2. token_hash = sha256(raw_token from request)
3. Look up PasswordResetToken WHERE token_hash = ? AND is_used = FALSE
4. If not found → return 400 "Reset token is invalid or has expired." (generic, no detail)
5. If expires_at < utcnow → return 400 same generic message
6. Fetch profile via token.user_id (verify is_active=True)
7. UPDATE profile.hashed_password = get_password_hash(new_password)
8. UPDATE token.is_used = True
9. Log AuditLog(action="PASSWORD_RESET_COMPLETED", user_id=user.id)
10. Return 200
```

**Note on session invalidation:** Existing JWT tokens remain valid after password reset (7-day expiry). This is an accepted limitation documented in ADR-004. Full session invalidation requires a token blacklist (planned as part of the refresh token hardening phase).

#### Frontend Pages

Two new pages: `/forgot-password` and `/reset-password`.

`/forgot-password/page.tsx`:
- Simple form: email input + submit button
- Always shows generic success message after submission regardless of response
- Link from `/login` page: "Forgot your password?"

`/reset-password/page.tsx`:
- Reads `token` query param from URL (`useSearchParams()`)
- Form: new_password + confirm_password inputs
- Client-side validation: passwords match, minimum length
- Submits `POST /auth/reset-password`
- On success: redirect to `/login` with success query param
- On error: show inline error message

#### Files to Change

| File | Change |
|:---|:---|
| `backend/app/models/entities.py` | Add `PasswordResetToken` model class |
| `backend/app/main.py` | Add DDL guard for `password_reset_tokens` in `init_db()` |
| `backend/alembic/versions/d5e6f7a8b9c0_add_password_reset_tokens.py` | New migration file |
| `backend/app/api/v1/auth.py` | Add two new endpoint handlers |
| `backend/app/schemas/auth.py` | Add `ForgotPasswordRequest`, `ResetPasswordRequest` schemas |
| `backend/app/core/config.py` | Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `EMAIL_FROM`, `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES` |
| `backend/requirements.txt` | Add `fastapi-mail` (or `resend`) |
| `frontend/app/forgot-password/page.tsx` | New page |
| `frontend/app/reset-password/page.tsx` | New page |
| `frontend/app/login/page.tsx` | Add "Forgot password?" link |
| `frontend/lib/translations.ts` | Add forgotPassword, resetPassword translation keys (en/hi/kn) |

#### Security Controls
- Token stored as SHA-256 hash — raw token never persisted
- Constant-time hash comparison via database lookup (no timing leak)
- Generic response prevents account enumeration at both endpoints
- Rate limit on forgot-password (3 req/IP/15 min)
- Single-use enforcement (is_used flag)
- 60-minute expiry
- Password policy enforced at reset time
- Existing tokens invalidated on new request (prevents stale token accumulation)

#### Acceptance Criteria
- [ ] `POST /auth/forgot-password` with unknown email returns 200 (same response as known email)
- [ ] `POST /auth/forgot-password` with known email creates a token record in DB
- [ ] Token expires 60 minutes after creation
- [ ] `POST /auth/reset-password` with valid token updates hashed_password and marks token used
- [ ] `POST /auth/reset-password` with the same token a second time returns 400
- [ ] `POST /auth/reset-password` with expired token returns 400
- [ ] User can log in with new password after successful reset
- [ ] `/forgot-password` page renders correctly on desktop
- [ ] `/reset-password?token=xxx` page renders correctly on desktop
- [ ] All UI strings present in en/hi/kn translations

**Complexity:** Medium–Large (most complexity is in email infrastructure setup; logic itself is straightforward)

---

### WS-4: Admin Navigation & Authorization Consistency

#### Current State
`Sidebar.tsx:72–88` renders the "Administration" section and "Offer Review Desk" link unconditionally for all authenticated users. The admin page (`/admin/offers/page.tsx`) correctly checks `isAdmin` and shows an access-denied state for non-admins. However:
1. All users see the admin nav entry, creating confusion
2. The "STAFF" badge is hardcoded — it doesn't reflect the actual user's role

#### Fix

The `Sidebar` component receives no user data currently. It needs access to the `useAuth()` hook's `session.isAdmin` flag to conditionally render the admin section.

```typescript
// Sidebar.tsx change
const { session } = useAuth()
const isAdmin = Boolean(session?.isAdmin || session?.role === "ADMIN")

// Conditional render
{isAdmin && (
  <>
    <div className="pt-4 mt-3 border-t ...">{/* Administration header */}</div>
    <Link href="/admin/offers" ...>{/* Offer Review Desk */}</Link>
  </>
)}
```

The "STAFF" badge text should also use the actual session data:
```typescript
<span>...{session?.role === "ADMIN" ? "ADMIN" : "STAFF"}</span>
```

#### Files to Change

| File | Change |
|:---|:---|
| `frontend/components/Sidebar.tsx` | Add `useAuth()` import, conditional render admin section |

#### Security Controls
This is a UI-only change. The backend `require_admin` dependency already protects all admin API routes. This change applies defense-in-depth at the UI layer but does not change the security boundary.

#### Acceptance Criteria
- [ ] Non-admin users do not see the Administration section or Offer Review Desk link in Sidebar
- [ ] Admin users continue to see the Administration section and Offer Review Desk link
- [ ] No change to admin page access control behavior
- [ ] No regressions in existing auth tests

**Complexity:** XSmall (~10 lines)

---

### WS-5: Persistent Financial Preferences

#### Current State
The `UserPreference` model already has all required columns:
- `prioritize_cashback` (BOOLEAN, DEFAULT TRUE)
- `prioritize_miles` (BOOLEAN, DEFAULT FALSE)
- `include_annual_fee_in_net` (BOOLEAN, DEFAULT FALSE)
- `monthly_spend_target` (NUMERIC 12,2, NULLABLE)
- `budget_alert_threshold` (NUMERIC 5,2, DEFAULT 80.00)

The `PUT /education/path` endpoint already reads and writes `UserPreference` for `financial_path`. The pattern is established.

No new database columns or migration is required.

#### API Design

**Endpoint 1 — Get Preferences:**
```
GET /profile/preferences
Authorization: Bearer <token>

Response 200:
{
  "prioritize_cashback": true,
  "prioritize_miles": false,
  "include_annual_fee_in_net": false,
  "monthly_spend_target": null,
  "budget_alert_threshold": "80.00"
}
```

**Endpoint 2 — Update Preferences:**
```
PUT /profile/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "prioritize_cashback": false,
  "include_annual_fee_in_net": true,
  "budget_alert_threshold": "75.00"
}

Response 200: (same shape as GET)
```

Both endpoints use `PATCH`-style partial update — only provided fields are updated, all others are left unchanged.

#### Schema

```python
# backend/app/schemas/auth.py additions
class UserPreferencesResponse(BaseModel):
    prioritize_cashback: bool
    prioritize_miles: bool
    include_annual_fee_in_net: bool
    monthly_spend_target: Optional[Decimal]
    budget_alert_threshold: Decimal

class UserPreferencesUpdate(BaseModel):
    prioritize_cashback: Optional[bool] = None
    prioritize_miles: Optional[bool] = None
    include_annual_fee_in_net: Optional[bool] = None
    monthly_spend_target: Optional[Decimal] = None
    budget_alert_threshold: Optional[Decimal] = Field(None, ge=Decimal("0"), le=Decimal("100"))
```

#### Handler Pattern (reusing education.py pattern)

```python
# Add to auth.py (or a new profile.py router)
@router.get("/profile/preferences", response_model=UserPreferencesResponse)
async def get_preferences(current_user: Profile = Depends(get_current_user), db = Depends(get_db)):
    pref = await db.scalar(select(UserPreference).where(UserPreference.user_id == current_user.id))
    if not pref:
        pref = UserPreference(user_id=current_user.id)  # return defaults
    return pref

@router.put("/profile/preferences", response_model=UserPreferencesResponse)
async def update_preferences(data: UserPreferencesUpdate, current_user = ..., db = ...):
    pref = await db.scalar(select(UserPreference).where(UserPreference.user_id == current_user.id))
    if not pref:
        pref = UserPreference(user_id=current_user.id, id=str(uuid.uuid4()))
        db.add(pref)
    if data.prioritize_cashback is not None: pref.prioritize_cashback = data.prioritize_cashback
    if data.include_annual_fee_in_net is not None: pref.include_annual_fee_in_net = data.include_annual_fee_in_net
    if data.budget_alert_threshold is not None: pref.budget_alert_threshold = data.budget_alert_threshold
    pref.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(pref)
    return pref
```

#### Frontend Changes

`settings/page.tsx` changes:
1. On mount: `useEffect` fetches `GET /profile/preferences` and sets component state from response
2. `handleSavePreferences` calls `PUT /profile/preferences` with current state
3. Show loading state while fetching on mount
4. Show success / error feedback after save (part of WS-7 toast system)

#### Router Registration

The two new endpoints can be added to `backend/app/api/v1/auth.py` (same file as existing profile endpoints) or a new `backend/app/api/v1/profile.py` router. Adding to `auth.py` is simpler and consistent with the existing `GET /profile` / `PUT /profile` pattern.

#### Files to Change

| File | Change |
|:---|:---|
| `backend/app/api/v1/auth.py` | Add `GET /profile/preferences` and `PUT /profile/preferences` handlers |
| `backend/app/schemas/auth.py` | Add `UserPreferencesResponse`, `UserPreferencesUpdate` schemas |
| `frontend/app/settings/page.tsx` | Load preferences on mount, call API on save |

#### Regression Impact on Reward Optimization
The `prioritize_cashback` and `include_annual_fee_in_net` preferences exist in `UserPreference` but are **not currently read by the RewardOptimizationEngine**. That engine uses `reward_basis_mode` from the recommendation request. Phase 4A only persists these preferences correctly; wiring them into the engine is a Phase 4B task.

#### Acceptance Criteria
- [ ] `GET /profile/preferences` returns current stored values (defaults on first call)
- [ ] `PUT /profile/preferences` persists values to DB
- [ ] Settings page loads stored preferences on mount
- [ ] Saving preferences calls API and shows success feedback
- [ ] Refreshing the settings page shows the previously saved preferences
- [ ] Partial update (only `prioritize_cashback`) does not reset other fields

**Complexity:** Small (~40 lines backend, ~30 lines frontend)

---

### WS-6: Configurable Category Budgets

#### Current State
The `UserBudget.category_budgets_json` TEXT column and `PUT /education/budget` already support arbitrary category maps. The backend is complete.

The problem is entirely in the frontend: `budget/page.tsx:163–167` applies a hardcoded split on every save, discarding any custom per-category allocation.

The `GET /education/budget` endpoint returns `category_budgets` as a `Dict[str, Decimal]` — but the frontend never reads this map to display per-category allocation or allow editing.

The backend also returns `spending_by_category` (actual spending per category this month) which is never displayed.

#### Frontend Changes

**New UI section: "Monthly Category Budgets"**

Placed below the budget limit progress bar and above the income streams section. Shows a row per category with:
- Category name (from a predefined list matching the seeded `SpendingCategory` records)
- Budget allocation input (NumericInput, in ₹)
- Actual spending this month (from `spending_by_category` in the budget API response)
- Visual utilization bar per category

**Budget save change:**
Replace the hardcoded percentages in `handleSaveBudget` with the user's actual per-category inputs. If the user has not customized a category, the existing stored allocation is preserved.

**Category list:**
The frontend will use a static ordered list matching the seeded categories (`grocery`, `dining`, `utility`, `travel`, `shopping`, `health`, `other`) — the same 7 categories that appear in the quick expense form. This avoids an extra API call to `GET /analytics/categories` on page load.

**Data loading change:**
The `loadData()` function already fetches `GET /education/budget`. The existing response already contains `category_budgets`. Extract and display these values in the new UI section.

#### Budget API — No Changes Required

The `PUT /education/budget` schema already accepts arbitrary `category_budgets: Dict[str, Decimal]`. The existing endpoint sets `total_budget = sum(category_budgets.values())` (line 391 of `education.py`). This means the category budgets drive the total — which is correct behavior for a configurable system. The frontend should update `total_budget` display after the user finalizes their per-category allocations.

**One correction needed in frontend:** The current budget save sends `total_budget` calculated from `editBudgetLimit` and then `category_budgets` based on a percentage of that limit. The new behavior should be: user sets each category amount individually, and the total is derived from the sum. The "total budget limit" input becomes the ceiling/reference point only, not the input used to compute category splits.

#### Translation Keys Required

New keys for the category budget UI section (en/hi/kn):
```
budget.categoryBudgets: "Monthly Category Budgets"
budget.categoryActual: "Actual This Month"
budget.categoryAllocated: "Allocated"
budget.saveCategoryBudgets: "Save Category Budgets"
```

Plus display names for each category in all 3 languages (these may already be in `translations.ts` — verify before adding).

#### Files to Change

| File | Change |
|:---|:---|
| `frontend/app/budget/page.tsx` | Add per-category budget editing UI, fix save handler |
| `frontend/lib/translations.ts` | Add category budget section translation keys |

#### Backward Compatibility

If a user has an existing `category_budgets_json` saved with the old hardcoded split, the new UI will display those values as their current allocation. They can update them freely. No migration needed.

#### Acceptance Criteria
- [ ] Budget page shows per-category allocation form with current values loaded from API
- [ ] User can edit each category amount individually
- [ ] Saving updates the stored `category_budgets_json` with user-specified values
- [ ] Total budget display reflects the sum of category allocations
- [ ] Actual spending per category is shown alongside the allocation
- [ ] Refreshing the page shows the saved per-category amounts
- [ ] The old hardcoded 35/15/20/15/15 split is no longer applied on save
- [ ] `NumericInput` component used for all category amount inputs

**Complexity:** Medium (frontend only, ~120 lines of new JSX and state)

---

### WS-7: Desktop UX — Notifications, Confirmations & Inline Errors

#### Current State

**10+ `alert()` / `confirm()` calls** in production code:

| File | Line | Call | Purpose |
|:---|:---|:---|:---|
| `settings/page.tsx` | 32 | `alert()` | Export data (stub) |
| `settings/page.tsx` | 36 | `confirm()` | Delete account confirmation |
| `transactions/page.tsx` | 84 | `alert()` | Invalid amount error |
| `transactions/page.tsx` | 105 | `alert()` | Create transaction failure |
| `transactions/page.tsx` | 112 | `confirm()` | Delete transaction confirmation |
| `transactions/page.tsx` | 117 | `alert()` | Delete transaction failure |
| `transactions/page.tsx` | 181 | `alert()` | No rows selected for import |
| `transactions/page.tsx` | 212 | `alert()` | Import commit failure |
| `budget/page.tsx` | 142 | `confirm()` | Delete income confirmation |
| `cards/page.tsx` | 104 | `confirm()` | Deactivate card confirmation |
| `cards/page.tsx` | 112 | `alert()` | Delete card failure |
| `cards/page.tsx` | 140 | `alert()` | Invalid last-4 digits |
| `cards/page.tsx` | 166 | `alert()` | Update card failure |
| `cards/compare/page.tsx` | 56 | `alert()` | Comparison failure |
| `profile/page.tsx` | 65 | `alert()` | Profile save failure |

#### Design: Two Reusable Components

**Component 1: `Toast` (transient notifications)**

Used for: operation success, operation failure, informational messages. Auto-dismisses after 3–4 seconds.

```typescript
// frontend/components/Toast.tsx
interface ToastMessage {
  id: string
  type: "success" | "error" | "info" | "warning"
  message: string
  duration?: number  // ms, default 3500
}

// Usage via a context hook:
const { toast } = useToast()
toast.success("Transaction deleted successfully.")
toast.error("Failed to update card: network error.")
```

The Toast context maintains an array of active messages. The `Toast` component renders in a fixed position (bottom-right on desktop: `fixed bottom-6 right-6 z-50 space-y-2`), using the existing design tokens:
- Success: `bg-emerald-500/15 border-emerald-500/30 text-emerald-300`
- Error: `bg-rose-500/15 border-rose-500/30 text-rose-300`
- Warning: `bg-amber-500/15 border-amber-500/30 text-amber-300`
- Info: `bg-sky-500/15 border-sky-500/30 text-sky-300`

Each toast has an X button for manual dismiss. Entry/exit animation via Framer Motion `AnimatePresence`.

**Component 2: `ConfirmDialog` (destructive action confirmations)**

Used for: delete account, delete card, delete transaction, deactivate card, delete income.

```typescript
// frontend/components/ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string      // default "Confirm"
  cancelLabel?: string       // default "Cancel"
  variant?: "danger" | "warning"  // danger = red button
  requireTypedConfirmation?: string  // if set, user must type this string
  loading?: boolean
}
```

Design: centered modal overlay (`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm`). Uses the existing glass card pattern (`bg-[#050D0A]/95 border border-white/[0.12] rounded-3xl`). For danger variant, the confirm button is `bg-rose-500 hover:bg-rose-400`.

The `requireTypedConfirmation` prop is used for account deletion (user must type `"DELETE"`).

#### Toast Context Setup

Add `ToastProvider` to `frontend/app/layout.tsx` alongside existing providers:

```typescript
// layout.tsx
<LanguageProvider>
  <AuthProvider>
    <ToastProvider>
      <Navbar />
      {children}
      <Toast />   ← renders active toasts
    </ToastProvider>
  </AuthProvider>
</LanguageProvider>
```

#### Migration Pattern for Existing Calls

Every existing `alert(message)` is replaced with `toast.error(message)` (for errors) or `toast.success(message)` (for successes).

Every existing `window.confirm(message)` is replaced by opening a `ConfirmDialog` with `isOpen` controlled by component state, and calling the destructive action in `onConfirm`.

Example transformation for `budget/page.tsx:142`:

```typescript
// BEFORE:
if (!confirm(t.incomes.deleteConfirm)) return;
await apiFetch(`/incomes/${id}`, { method: "DELETE" })

// AFTER:
const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

// In render:
<ConfirmDialog
  isOpen={confirmDeleteId !== null}
  onClose={() => setConfirmDeleteId(null)}
  onConfirm={() => handleDeleteIncome(confirmDeleteId!)}
  title={t.incomes.deleteConfirm}
  message="This income stream will be permanently removed."
  confirmLabel="Delete"
  variant="danger"
/>

// Trigger:
<button onClick={() => setConfirmDeleteId(item.id)}>Delete</button>
```

#### Files to Change

| File | Change |
|:---|:---|
| `frontend/components/Toast.tsx` | New component |
| `frontend/components/ConfirmDialog.tsx` | New component |
| `frontend/lib/toast-context.tsx` | New context + `useToast` hook |
| `frontend/app/layout.tsx` | Add `ToastProvider` wrapper |
| `frontend/app/settings/page.tsx` | Replace alert/confirm |
| `frontend/app/transactions/page.tsx` | Replace 6 alert/confirm calls |
| `frontend/app/budget/page.tsx` | Replace 1 confirm call |
| `frontend/app/cards/page.tsx` | Replace 3 alert/confirm calls |
| `frontend/app/cards/compare/page.tsx` | Replace 1 alert call |
| `frontend/app/profile/page.tsx` | Replace 1 alert call |
| `frontend/lib/translations.ts` | Add toast/dialog translation keys |

Note: The `settings/page.tsx` account deletion `confirm()` is replaced by the `ConfirmDialog` with `requireTypedConfirmation="DELETE"` as part of WS-1.

#### Acceptance Criteria
- [ ] No `alert()` or `window.confirm()` calls remain in any page component
- [ ] Toast component renders success/error/info/warning messages in bottom-right corner
- [ ] Toast auto-dismisses after 3.5 seconds
- [ ] Toast can be manually dismissed via X button
- [ ] ConfirmDialog blocks interaction with page background when open
- [ ] ConfirmDialog danger variant shows red confirm button
- [ ] ConfirmDialog with `requireTypedConfirmation` disables confirm until correct text is entered
- [ ] All new component strings present in en/hi/kn translations

**Complexity:** Medium (component design is self-contained; migration is mechanical)

---

## Implementation Sequence

### Dependencies Between Workstreams

```
WS-7 (Toast + ConfirmDialog)  ←─── WS-1 depends on ConfirmDialog for account deletion modal
                              ←─── WS-3 depends on Toast for reset feedback
                              ←─── WS-5 depends on Toast for preference save feedback
                              ←─── WS-6 depends on Toast for budget save feedback

WS-3 (Password Reset)  ←─── requires email infrastructure (external dependency)
WS-5 (Preferences)    ←─── independent of all others
WS-6 (Category Budget) ←─── independent of all others
WS-4 (Admin Nav)      ←─── independent of all others
```

### Recommended Implementation Order

**Track A — Backend-first (can start immediately):**
```
Week 1:
  A1. WS-4: Admin nav guard (XSmall — 1 hour)
  A2. WS-5: GET/PUT /profile/preferences endpoints + schemas
  A3. WS-2: DataExportService + GET /auth/export endpoint
  A4. WS-1: DELETE /auth/account endpoint + account deletion sequence

Week 2:
  A5. WS-3: PasswordResetToken model + Alembic migration + init_db() DDL guard
  A6. WS-3: POST /auth/forgot-password + POST /auth/reset-password endpoints
  A7. WS-3: Email infrastructure (config + fastapi-mail integration)
```

**Track B — Frontend-first (can run in parallel with Track A):**
```
Week 1:
  B1. WS-7: Toast component + context (needed by all other frontend work)
  B2. WS-7: ConfirmDialog component
  B3. WS-7: Wire layout.tsx + replace all alert()/confirm() calls
  B4. WS-4: Sidebar admin section guard (depends on B3 wiring pattern)
  B5. WS-5: Settings page load preferences on mount, call API on save

Week 2:
  B6. WS-6: Category budget UI in budget/page.tsx
  B7. WS-2: Settings page export button → real download
  B8. WS-1: Settings page delete account → ConfirmDialog + DELETE /auth/account call
  B9. WS-3: /forgot-password and /reset-password pages + login page link
```

**Integration & Testing (Week 3):**
```
  I1. Backend unit tests for WS-1, WS-2, WS-5
  I2. Frontend tests for WS-7 Toast + ConfirmDialog components
  I3. E2E smoke: register → export → delete → register again with same email (should succeed)
  I4. E2E smoke: request reset → apply reset → login with new password
  I5. Full regression suite: pytest tests/unit/ tests/security/ && npm test && npm run build
```

---

## Security Threat Considerations

| Workstream | Threat | Mitigation |
|:---|:---|:---|
| WS-1 Account Deletion | User deletes another user's account by passing a different user_id | Endpoint uses only `current_user.id` from JWT — no user_id in request body |
| WS-1 Account Deletion | Password brute-force to trigger deletion | Max 3 password attempts per user per hour via rate limiter keyed on user_id |
| WS-2 Data Export | Token theft → exfiltrate all user financial data | Rate limit 5/hour per user; JWT required; Content-Disposition: attachment |
| WS-3 Password Reset | Account enumeration via timing difference | Always return 200; same response regardless of email existence |
| WS-3 Password Reset | Token interception → account takeover | Token is SHA-256 hashed on storage; raw token in email link only |
| WS-3 Password Reset | Mass reset email flooding | Max 3 requests per IP per 15 minutes |
| WS-3 Password Reset | Token reuse after successful reset | `is_used` flag set atomically on redemption; checked before applying |
| WS-5 Preferences | Cross-tenant preference access | All queries scoped to `current_user.id` via `get_current_user` dependency |
| WS-7 Confirm dialogs | User triggers destructive action accidentally | ConfirmDialog requires explicit confirmation; delete account requires typed "DELETE" |

---

## Testing Strategy

### New Backend Tests Required

**WS-1 Account Deletion:**
```python
# backend/tests/unit/test_account_deletion.py
test_delete_account_correct_password_removes_all_user_data
test_delete_account_wrong_password_returns_401
test_delete_account_preserves_audit_logs_with_null_user_id
test_delete_account_removes_uploaded_files
test_delete_account_token_becomes_invalid_after_deletion
test_delete_account_rate_limit_enforced
```

**WS-2 Data Export:**
```python
# backend/tests/unit/test_data_export.py
test_export_returns_all_user_owned_data
test_export_excludes_hashed_password
test_export_user_a_does_not_contain_user_b_data
test_export_monetary_values_are_strings
```

**WS-3 Password Reset:**
```python
# backend/tests/unit/test_password_reset.py
test_forgot_password_known_email_creates_token
test_forgot_password_unknown_email_returns_200
test_reset_password_valid_token_updates_password
test_reset_password_expired_token_returns_400
test_reset_password_used_token_returns_400
test_reset_password_weak_password_returns_400
```

**WS-5 Preferences:**
```python
# backend/tests/unit/test_preferences.py
test_get_preferences_returns_defaults_when_none_set
test_update_preferences_persists_to_db
test_update_preferences_partial_update_preserves_other_fields
```

### New Frontend Tests Required

**WS-7 Components:**
```typescript
// frontend/__tests__/toast.test.ts
// frontend/__tests__/confirm_dialog.test.ts
test_toast_renders_and_auto_dismisses
test_toast_manual_dismiss
test_confirm_dialog_opens_and_closes
test_confirm_dialog_typed_confirmation_gates_action
```

### Regression Test Baseline

After Phase 4A implementation, the full suite must pass at or above baseline:
- Backend: `pytest tests/unit/ tests/security/ -q` → minimum 79/79 (likely 79 + ~15 new = 94+)
- Frontend: `npm test` → minimum 42/42 (likely 42 + new component tests)
- Build: `npm run build` → 23 static pages + 2 new (forgot-password, reset-password) = 25 pages
- TypeScript: `npx tsc --noEmit` → 0 errors

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|:---|:---|:---|:---|
| Email infrastructure (SMTP/Resend) unavailable or slow to set up | Medium | Blocks WS-3 go-live | WS-3 token logic is fully testable without email (dev mode returns token in response); email integration is the last step |
| Account deletion cascade leaves orphaned data due to ORM vs DB FK inconsistency | Low | High | Explicit manual SET NULL for audit_logs before ORM delete; covered by acceptance test |
| Category budget UI breaks existing budget data | Low | Medium | Existing `category_budgets_json` is read and pre-populated in UI; backward-compatible |
| Toast context causes re-render performance issues | Low | Low | Context only holds array of messages (max 5 visible at once); no heavy computation |
| WS-1 and WS-7 frontend changes conflict (both modify `settings/page.tsx`) | Medium | Low | WS-7 should be completed first or on a separate branch; WS-1 settings changes are additive |

---

## Acceptance Criteria Summary

All seven workstreams are complete when:

1. `DELETE /auth/account` with correct password deletes all user data server-side and returns 200
2. `GET /auth/export` returns a complete, valid JSON file of all user-owned data with no credential fields
3. `POST /auth/forgot-password` and `POST /auth/reset-password` function end-to-end with email delivery
4. Admin Sidebar section is hidden from non-admin users on all desktop viewports
5. Settings preferences (cashback priority, fee-net) persist across page reloads
6. Budget page allows per-category allocation editing with values saved to and loaded from the API
7. No `alert()` or `window.confirm()` calls remain in any page component; Toast and ConfirmDialog are in use
8. Full test suite passes: `pytest tests/unit/ tests/security/ -q` and `npm test` and `npm run build`
9. `npx tsc --noEmit` returns zero errors

---

*This document is the complete planning artifact for Phase 4A. Implementation requires explicit authorization before any source file is modified.*
