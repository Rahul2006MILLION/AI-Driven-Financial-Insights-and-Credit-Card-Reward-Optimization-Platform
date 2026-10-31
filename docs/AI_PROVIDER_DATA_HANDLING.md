# CLIQ — AI Provider Data Handling & Zero-Retention Policy

## 1. Third-Party AI Provider Scope & Boundaries

CLIQ integrates with external Large Language Model APIs solely to enhance user communication, provide conversational financial education, and generate multilingual natural language responses in English, Hindi, and Kannada.

### Current Configured Provider
- **Provider:** Google Cloud / Google AI (Gemini API)
- **Model:** `gemini-1.5-flash` (with optional `gemini-1.5-pro` capability)
- **SDK:** Official `@google/genai` (Node.js) / `google-genai` (Python)
- **Integration Layer:** `backend/app/services/language_intelligence/assistant.py` (via `PrivacyGateway`)

---

## 2. Model Training & Data Retention Terms

### Non-Training Guarantee
CLIQ adheres to enterprise data privacy principles. When utilizing Gemini via paid/enterprise API keys or Google Cloud Vertex AI endpoints:
1. **No Foundation Model Training:**
   - Prompts, context documents, and generated responses submitted through the API are **NOT used to train or fine-tune** Google foundation models or improve Google products.
2. **Customer Data Ownership:**
   - The user and CLIQ retain exclusive ownership and intellectual property rights over all input context and output texts.

### Zero-Data-Retention Posture
- **Stateless API Invocations:** Every AI request sent by CLIQ is completely stateless. No session state, history, or context caching is maintained on the provider's servers between requests.
- **Ephemeral Processing:** Data transmitted to the provider exists in volatile memory only for the duration of the inference call and is not permanently stored or indexed.

---

## 3. Regulatory Alignment (India DPDPA & RBI)

CLIQ's AI data architecture is designed in strict compliance with Indian financial data privacy regulations:

### 1. Digital Personal Data Protection Act (DPDPA 2023)
- **Purpose Limitation:** User data is processed by external AI exclusively for the explicit task authorized by the user (e.g. card recommendation explanation).
- **Data Minimization:** Only the minimum viable context necessary to answer the specific question is constructed (`PrivacyContextBuilder`).
- **Verifiable Consent:** Explicit, itemized consent is collected, logged, and can be withdrawn at any second with immediate effect.
- **Right to Erasure / Revocation:** Revoking consent immediately disconnects the user account from external AI, routing all future queries to the server's local deterministic engine.

### 2. Reserve Bank of India (RBI) Cyber Security Guidelines
- **Zero Storage of Financial Secrets:** No PAN, PIN, CVV, or OTP is ever logged, transmitted, or cached.
- **Data Localization Sensitivity:** Core financial ledgers, card reward rules, transaction logs, and user identity tables remain strictly on CLIQ's secure backend infrastructure.

---

## 4. Local Deterministic Fallback & Degraded Mode

A primary architectural requirement of CLIQ is **High Availability without Vendor Lock-In**. The application is designed to operate seamlessly even when external AI providers are unavailable.

### Fallback Triggers
The system automatically routes requests to the **Local Deterministic Heuristic Engine** under the following conditions:
1. **User Consent Denied or Revoked:** The user has disabled external AI (`external_ai_enabled = False`).
2. **Missing or Invalid Credentials:** No `GEMINI_API_KEY` configured in the server environment.
3. **Provider Outage or Network Failure:** External API timeouts, 5xx server errors, or DNS failures.
4. **Rate Limiting:** HTTP 429 quota exhaustion from the external provider.
5. **Unauthorized Task Type:** A task type requested that has not been approved for AI processing.

### Capabilities of the Local Deterministic Engine
- Native responses in English, Hindi, and Kannada.
- Full card recommendation reasoning based on mathematically proven reward rates.
- Category spend summaries computed from active database records.
- Zero network latency, zero token costs, and 100% privacy preservation.
