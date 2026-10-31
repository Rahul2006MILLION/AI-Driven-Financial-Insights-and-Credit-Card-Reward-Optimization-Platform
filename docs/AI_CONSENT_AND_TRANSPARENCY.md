# CLIQ — User AI Consent & Privacy Transparency Framework

## 1. Consent Philosophy: Informed, Granular, Revocable

In financial applications, generic "Terms of Service" agreements that bundle third-party AI processing are inadequate. CLIQ enforces an **Explicit, Granular, Versioned, and Revocable Consent Architecture**.

### Key Consent Principles
1. **Opt-In by Default:**
   - Every new user profile is created with `external_ai_enabled = False`.
   - External AI providers receive zero bytes of data unless the user actively checks the consent toggle.
2. **Granular Context Control:**
   - Users can enable the conversational AI for general financial advice while selectively blocking access to their personal card portfolio or spending history.
3. **Instantaneous Revocation:**
   - Disabling consent takes effect immediately on the next API call. No delayed background batch jobs or lingering authorization caches.
4. **Transparent Provider & Processing Disclosure:**
   - The user interface explicitly informs the user which AI model is currently answering their questions, displays whether PII was redacted, and provides one-click access to manage consent.

---

## 2. Database Schema: UserAiConsent Entity

User consent records are stored in the database table `user_ai_consents` and linked 1-to-1 with the user's `Profile`:

```sql
CREATE TABLE user_ai_consents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    external_ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    allow_card_context BOOLEAN NOT NULL DEFAULT FALSE,
    allow_spending_context BOOLEAN NOT NULL DEFAULT FALSE,
    provider_preference VARCHAR(32) NOT NULL DEFAULT 'gemini',
    consent_version VARCHAR(16) NOT NULL DEFAULT '1.0',
    consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE NULL,
    purpose_description VARCHAR(255) NULL
);
```

### Consent Flags & Permissions

| Flag | Purpose | Default Value | When `False` |
|---|---|---|---|
| `external_ai_enabled` | Master switch for third-party AI (Gemini) | `False` | All queries route to the local deterministic engine |
| `allow_card_context` | Permits passing card names & banks to AI | `False` | AI answers in generic terms without knowledge of owned cards |
| `allow_spending_context` *(alias: `allow_spending_summary_context`)* | Permits passing aggregated monthly categories | `False` | AI has zero visibility into user spending patterns |
| `provider_preference` | AI Provider selection (`gemini`, `mock`) | `gemini` | Configures target provider when AI is enabled |

---

## 3. Privacy Management Endpoints

The backend provides authenticated REST endpoints for auditing and updating consent:

### 1. `GET /api/v1/privacy/consent`
Returns the current authenticated user's consent record. If no record exists, an initial record with default `False` values is seeded and returned.

**Response Schema:**
```json
{
  "user_id": "usr_948f2190-bdf1-4a7b-a324-118822334455",
  "external_ai_enabled": false,
  "allow_card_context": false,
  "allow_spending_summary_context": false,
  "allow_personalized_recommendations": false,
  "consent_version": "1.0.0",
  "consented_at": null,
  "revoked_at": null,
  "updated_at": "2026-10-31T12:00:00Z"
}
```

### 2. `PUT /api/v1/privacy/consent`
Updates granular consent preferences. Automatically records `consented_at` or `revoked_at` timestamps.

**Request Body:**
```json
{
  "external_ai_enabled": true,
  "allow_card_context": true,
  "allow_spending_summary_context": false,
  "allow_personalized_recommendations": true
}
```

### 3. `GET /api/v1/privacy/audit-logs`
Provides transparency to users and administrators by listing recent AI invocations, showing the exact model used, latency, and redaction counts (with zero PII or raw prompts disclosed).

---

## 4. Frontend Transparency UI in `/assistant`

The multilingual assistant page (`frontend/app/assistant/page.tsx`) features native UI components for user transparency:

1. **Active Provider Status Pill:**
   - Clearly indicates in the header whether queries are running on **Local Deterministic Engine** or **Google Gemini (1.5 Flash)**.
2. **Expandable Privacy & Consent Panel:**
   - Lets users toggle master AI processing and granular context flags directly within the chat interface.
3. **Response Badges:**
   - Every assistant response pill includes a metadata badge:
     - `🛡️ Private Local Engine` for deterministic responses.
     - `✨ Gemini 1.5 Flash (Privacy Protected)` for external AI responses.
4. **Redaction Notice:**
   - If a user inadvertently pastes a credit card number or OTP in the chat, the system displays an alert informing them:
     * *“Sensitive data was detected and removed for your protection.”*

