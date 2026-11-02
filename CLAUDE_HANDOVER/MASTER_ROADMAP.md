# CLIQ — Master Engineering Roadmap (Phases 0 to 13)

This document presents the complete 14-phase engineering roadmap for CLIQ, marking current progress, phase dependencies, and deliverables.

---

## 1. Master Execution Timeline

```mermaid
gantt
    title CLIQ Master Engineering Roadmap
    dateFormat  YYYY-MM-DD
    section Completed Foundations
    Phase 0 - Repository Audit              :done, p0, 2026-10-25, 2026-10-26
    Phase 1 - Documentation Consolidation   :done, p1, 2026-10-27, 2026-10-28
    Phase 2 - Architecture & Use Cases      :done, p2, 2026-10-29, 2026-10-30
    Phase 3 - No-Credit-Card Mode           :done, p3, 2026-10-31, 2026-11-01
    Phase 3.1 - Verification Audit          :done, p31, 2026-11-01, 2026-11-02
    Phase 3.2 - Hardening & Remediation     :done, p32, 2026-11-02, 2026-11-02
    section Active & Planned Milestones
    Phase 4 - Financial Scam Shield         :active, p4, 2026-11-03, 2026-11-05
    Phase 5 - Financial Document Intel      :p5, 2026-11-06, 2026-11-08
    Phase 6 - Emergency & Resilience        :p6, 2026-11-09, 2026-11-11
    Phase 7 - Financial Translator & Voice  :p7, 2026-11-12, 2026-11-14
    Phase 8 - Benefits Navigator            :p8, 2026-11-15, 2026-11-17
    Phase 9 - Credit Readiness Path         :p9, 2026-11-18, 2026-11-20
    Phase 10 - Explainability Standardization:p10, 2026-11-21, 2026-11-22
    Phase 11 - Unified Frontend Integration :p11, 2026-11-23, 2026-11-25
    Phase 12 - Testing & Security Hardening :p12, 2026-11-26, 2026-11-28
    Phase 13 - Final Release Readiness      :p13, 2026-11-29, 2026-11-30
```

---

## 2. Phase-by-Phase Roadmap Details

| Phase | Milestone Name | Scope & Key Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **0** | **Repository Audit** | Source code inspection, model discovery, test suite analysis, baseline architecture report. | **COMPLETED** |
| **1** | **Documentation Consolidation** | 48 Markdown docs synthesized into 11 canonical files. Link verification. | **COMPLETED** |
| **2** | **Architecture & Use Cases** | Financial inclusion architecture, dual-pathway system design, shared core. | **COMPLETED** |
| **3** | **No-Credit-Card Mode** | Incomes entity, cash flow API, budget planner, CLIQ Learn academy, UI adaptation. | **COMPLETED** |
| **3.1**| **Verification Audit** | Adversarial inspection of Phase 3 code. Identified DEF-01 through DEF-09. | **COMPLETED** |
| **3.2**| **Remediation & Hardening** | Resolved DEF-01 to DEF-09, Alembic migrations, verified 42 frontend tests. | **COMPLETED** |
| **4** | **Financial Scam Shield** | **NEXT MILESTONE.** Deceptive merchant detection, phishing link heuristics, subscription trap alerts, scam scoring API. | **PENDING START** |
| **5** | **Document Intelligence** | Client-side OCR parsing for scanned paper receipts, statement tables, circular analysis. | Planned |
| **6** | **Emergency & Resilience** | Emergency runway calculator, essential vs discretionary segregation, resilience index. | Planned |
| **7** | **Translator & Voice** | Plain-language bank term translator widget, Web Speech API audio narration. | Planned |
| **8** | **Benefits Navigator** | Centralized government welfare scheme database, demographic eligibility matcher. | Planned |
| **9** | **Credit Readiness Path** | Step-by-step credit readiness index, secured card simulator, credit score tutor. | Planned |
| **10**| **Explainability Engine** | Standardize explainability payloads across all endpoints with provenance tags. | Planned |
| **11**| **Unified Frontend** | Responsive polish, accessibility audit (WCAG AA), dark/light theme consistency. | Planned |
| **12**| **Security & Evaluation** | Penetration testing, IDOR stress tests, automated benchmarks, load testing. | Planned |
| **13**| **Release Readiness** | Production deployment configurations, Docker manifests, user user guides. | Planned |

---

## 3. Scope & Requirements for Phase 4 (Next Active Milestone)

When the user authorizes Phase 4, Claude should execute:
1. **Scam Detection Engine (`app/services/security/scam_shield.py`):**
   - Check merchant strings against similarity distances for known banking and utility spoofing patterns.
   - Flag payment request texts containing urgent psychological lures ("electricity disconnected tonight", "KYC expired", "instant lottery prize").
   - Flag recurring transactions originating from zero-cost introductory trial subscriptions.
2. **Scam Scoring API (`/api/v1/security/scam-check`):**
   - Input: transaction text, merchant name, amount, payment method.
   - Output: threat score (0 to 100), risk tier (`LOW`, `MEDIUM`, `HIGH`), specific scam flags, and recommended safety precautions.
3. **Frontend Integration:**
   - Visual alert banner on `/dashboard` and `/transactions` for flagged transactions.
   - "Verify Merchant / Scam Check" tool in CLIQ Assistant and Learn tabs.

