# CLIQ Threat Model

This document outlines the threat modeling assessment conducted for the CLIQ platform following the STRIDE methodology.

---

## 1. Assets Inventory

| Asset ID | Asset Name | Description | Sensitivity |
|---|---|---|---|
| **A-1** | User Profile & Auth Tokens | User email, JWT tokens, account credentials | High |
| **A-2** | Credit Card Portfolio | User registered card list, limits, billing dates | Medium |
| **A-3** | Transaction Records | Spending history, amounts, merchant names, categories | High |
| **A-4** | Uploaded Documents | Credit card statement PDFs, terms & conditions files | High |
| **A-5** | Reward Calculation Engine | Proprietary rule evaluation logic & card multipliers | Medium |
| **A-6** | Database & Storage Keys | Supabase service-role keys, DB connection strings | Critical |

---

## 2. Threat Actors & Capabilities

1. **Unauthenticated External Attacker:** Public internet adversary attempting credential stuffing, API endpoint scanning, brute force, DDoS, or injection.
2. **Authenticated Malicious Tenant:** Registered user attempting horizontal privilege escalation (IDOR) to view or tamper with other users' transactions and uploaded documents.
3. **Malicious File Uploader:** Attacker uploading weaponized PDFs (e.g. polyglot PDFs, ZIP bombs, buffer overflow vectors) into document intelligence.
4. **Prompt Injector:** Attacker crafting conversational inputs attempting to jailbreak the AI assistant or leak proprietary rule prompts.

---

## 3. STRIDE Threat Analysis & Mitigations

| Threat Category | Potential Attack Vector | Impact | Mitigation Strategy in CLIQ | Residual Risk |
|---|---|---|---|---|
| **Spoofing** | Forged JWT token or fake session cookie | Unauthorized user impersonation | Backend validates RS256/HS256 signature, issuer, audience, and expiration on every request. | Low |
| **Tampering** | Modifying transaction amounts or reward rates via API | Distorted financial analytics or illicit benefits | Strict Pydantic schema validation, DB transaction boundaries, RLS checks. | Very Low |
| **Repudiation** | Denying an uploaded document or card creation action | Lack of accountability | Structured audit log records timestamps, user IDs, and client IPs for state-changing operations. | Low |
| **Information Disclosure** | IDOR via `/api/v1/cards/{id}` or `/api/v1/documents/{id}` | Leak of other users' financial data | Strict query scoping by `WHERE user_id = current_user.id`. Global 404 response on foreign IDs. | Low |
| **Denial of Service** | Uploading massive 500MB PDF files or spamming AI queries | Server memory exhaustion, LLM API quota drain | 10MB file size limit, PyMuPDF page limit (max 20 pages), per-client IP rate limiting. | Low |
| **Elevation of Privilege** | Normal user calling administrative endpoints | Unauthorized platform reconfiguration | Role-Based Access Control (`role == 'admin'`), zero admin endpoints accessible to general users. | Very Low |

---

## 4. File Upload & Document Pipeline Controls

- **Magic Byte Validation:** Files must pass MIME type and header inspection (verifying `%PDF` magic bytes).
- **Safe Storage Location:** Uploads are written to isolated directories with randomized UUID filenames; original client filenames are never used for disk paths.
- **Processing Timeouts:** Document parsing tasks enforce a hard 15-second execution timeout.
- **Untrusted Staging:** Extracted rules are held in `extracted_card_data` with `is_verified = False` and can only be promoted to active rules after explicit user review.
