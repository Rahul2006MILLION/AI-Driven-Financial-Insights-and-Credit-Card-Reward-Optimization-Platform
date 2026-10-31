# CLIQ — AI Provider Data Handling & Regulatory Assessment

## 1. Third-Party AI Provider Scope & Model Configuration

CLIQ integrates with external Large Language Model APIs solely to provide conversational financial education, explain card reward calculations, and generate multilingual natural language responses in English, Hindi, and Kannada.

### Configured Production Model
- **Active Model Identifier:** `gemini-2.5-flash` (Configurable via `AI_MODEL_NAME` or `GEMINI_MODEL` environment variables)
- **Lifecycle & Sunset Notice:** Google retired `gemini-1.5-flash` and `gemini-1.5-pro` on September 29, 2025. The CLIQ Privacy Gateway actively detects and rejects deprecated model identifiers (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-1.0-pro`), returning `DEPRECATED_MODEL_REJECTED` rather than silently failing or falling back.
- **Provider Protocol:** Google Generative Language REST API (`https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent`)
- **Integration Layer:** `backend/app/services/privacy/privacy_gateway.py` (Central choke point)

---

## 2. Technical Privacy Controls vs. Provider Terms

To ensure objective accountability, CLIQ strictly distinguishes internal technical controls from external provider contract terms:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PRIVACY GOVERNANCE SEPARATION MATRIX                            │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ Technical Controls      │ Enforced locally by CLIQ backend before any network egress   │
│ Consent Mechanisms      │ Explicit in-app user opt-in with immediate revocation        │
│ Provider Terms          │ Dependent on operator's Google Cloud billing tier            │
│ Legal Obligations       │ Requirements under Indian DPDPA 2023 and RBI guidelines      │
│ Items for Legal Review  │ Corporate legal determinations, DPA agreements, audit filings │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

### A. Technical Privacy Controls (Enforced in Code)
1. **Deterministic PII Scrubbing:** All untrusted user queries pass through `SensitiveDataRedactor` before prompt assembly. 15/16-digit card numbers, CVVs, PINs, OTPs, Aadhaar numbers, Tax PANs, bank accounts, and passwords are removed and replaced with non-reversible placeholder tokens.
2. **Context Minimization:** Only approved task-specific fields are serialized. No credit limits, transaction UUIDs, or individual purchase history rows are ever provided to the external model.
3. **Instruction Boundary Isolation:** Instructions and user queries are wrapped in strict non-overlapping XML delimiters (`<system_instructions>`, `<verified_context>`, `<untrusted_user_query>`) with tag escaping.

### B. User Consent Mechanisms (Application Layer)
1. **Default Opt-Out:** Every user profile defaults to `external_ai_enabled = False`.
2. **Granular Permissions:** Separate toggles for `allow_card_context` and `allow_spending_context` (also aliased as `allow_spending_summary_context`).
3. **Instantaneous Revocation:** Revoking consent immediately cuts off external API calls and routes queries to the local deterministic engine.

### C. Provider Contractual Terms (Google AI Studio vs. Google Cloud)
- **Free Tier (Unpaid Services):**
  - **Model Training Notice:** Google AI Studio terms state that for unpaid free-tier accounts, Google **may use prompts and generated responses to develop and improve Google products, services, and machine learning models**. Human reviewers may also inspect data.
  - **Operator Requirement:** Production deployments of CLIQ **must not** use free-tier API keys.
- **Paid Services (Linked Cloud Billing / Google Cloud Vertex AI):**
  - **No Model Training:** When backed by an active Google Cloud Billing account, Google's Terms of Service state that prompts, system instructions, and responses are **NOT** used to train foundation models.
  - **Limited Retention for Abuse:** Data is retained temporarily (typically 30–55 days) in encrypted service logs strictly for security monitoring and abuse detection, not permanent storage.

---

## 3. Regulatory Alignment & Legal Assessment Notice

### Digital Personal Data Protection Act (DPDPA 2023 - India)
1. **Notice & Consent (Section 6):**
   - CLIQ implements granular in-app opt-in toggles and a clear disclosure notice.
   - *Legal Note:* While technical consent mechanisms are provided, determining whether the wording, presentation, and data principal notice satisfy all statutory requirements of DPDPA Section 6 requires formal legal assessment by counsel.
2. **Cross-Border Transfer Restrictions (Section 16):**
   - Section 16 of the DPDPA empowers the Central Government to restrict transfer of personal data outside India to designated countries or territories.
   - When external AI processing is enabled, scrubbed prompts leave India to Google LLC data centers.
   - *Legal Note:* **User consent does not override statutory cross-border restrictions.** CLIQ's architecture minimizes data egress so that only scrubbed text crosses the border, but formal compliance with Section 16 depends on government notifications and organizational transfer assessments.

### Reserve Bank of India (RBI) Regulatory Framework
1. **Card Credential Protection (RBI Guidelines on Card-on-File & Tokenization):**
   - CLIQ **never** stores or requests full 16-digit card PANs, CVVs, or ATM PINs in its databases.
   - Only masked card nicknames, issuers, networks, and last-four digits are held for user recognition.
2. **Financial Data Localization:**
   - Primary transaction ledgers, card balances, reward rule schedules, and user identities remain exclusively within CLIQ's server databases.
   - Egressed context contains only aggregated category totals (e.g. `Dining: ₹2,500`), never core banking ledgers.

---

## 4. Items Requiring Formal Legal Review Prior to Production

The following items cannot be settled by engineering controls alone and require review by licensed legal counsel:
1. **Data Protection Agreement (DPA):** Execution of a formal enterprise DPA with Google Cloud covering international data processing.
2. **DPDPA Notice Formalities:** Legal audit of the multilingual consent notice to verify conformance with upcoming DPDPA notification rules.
3. **Cross-Border Transfer Impact Assessment:** Documentation of risk evaluations for processing financial queries on overseas cloud infrastructure.
4. **Data Retention & Pruning Schedule:** Formal corporate policy definition for purging `ai_request_audit_logs`.

---

## 5. Local Deterministic Fallback & Degraded Mode

CLIQ enforces complete independence from external AI providers through its **Local Deterministic Engine**:

### Fallback Triggers
Requests automatically execute locally without external network calls when:
1. User consent is disabled or revoked (`external_ai_enabled = False`).
2. No `GEMINI_API_KEY` is configured in the backend environment.
3. Configured model is deprecated or invalid (e.g. `gemini-1.5-flash`).
4. Provider network failure, HTTP 429 quota exhaustion, or HTTP 5xx outage occurs.
5. Unauthorized AI task type is requested.

### Engine Capabilities
- **Exact Mathematics:** Exact Python `Decimal` computations for cashback, points, caps, and tiered milestones.
- **Multilingual Intent Matching:** Grounded, verified natural language responses in English, Hindi, and Kannada.
- **Zero Cloud Exposure:** 100% of processing remains on the local server.
