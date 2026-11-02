# CLIQ — Claude Development Handover Package

Welcome to the **CLIQ Engineering Handover Package**. This directory contains the complete architectural, operational, domain, and historical knowledge base necessary for Claude (or any primary AI coding assistant) to take over engineering development on CLIQ without rebuilding existing features, duplicating services, or introducing regressions.

---

## 1. Executive Summary & Purpose

- **Project:** CLIQ — AI-Powered Personal Financial Intelligence Platform
- **Tagline:** *Money Made Simple. In Your Language.*
- **Repository Location:** `~/CLIQ`
- **GitHub:** [https://github.com/Rahul2006MILLION/AI-Driven-Financial-Insights-and-Credit-Card-Reward-Optimization-Platform](https://github.com/Rahul2006MILLION/AI-Driven-Financial-Insights-and-Credit-Card-Reward-Optimization-Platform)
- **Primary Tech Stack:**
  - **Backend:** FastAPI (Python 3.12+), SQLAlchemy 2.0 (Asyncio), Pydantic v2, PostgreSQL / SQLite (via asyncpg / aiosqlite), Alembic, Pytest
  - **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, Node test runner
  - **AI / Intelligence:** Google Gemini API (`gemini-1.5-flash`), Local Regex-based Privacy Gateway (PII redaction), Deterministic Financial & Reward Calculators
  - **Internationalization:** In-memory tri-lingual dictionary engine (`en`: English, `hi`: Hindi, `kn`: Kannada) across 20 core screens

This package is a **knowledge transfer**, not a code rewrite. The CLIQ codebase has reached **v0.4.0** with **Phases 0, 1, 2, 3, 3.1, and 3.2 completed and verified**. All code, database schemas, API routers, frontend interfaces, and test suites are active in the working tree.

---

## 2. Handover Package Navigation

Every file in `CLAUDE_HANDOVER/` is self-contained and focused on a specific engineering dimension:

| Document | Description | Key Focus Areas |
| :--- | :--- | :--- |
| [`CLAUDE_MASTER_PROMPT.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/CLAUDE_MASTER_PROMPT.md) | **Start Here**. Protocol for Claude when entering the project. | Operating rules, first-turn checklist, workflow protocol. |
| [`MASTER_PROJECT_CONTEXT.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/MASTER_PROJECT_CONTEXT.md) | High-level identity, product vision, and target users. | Financial inclusion, pathways, differentiators, positioning. |
| [`PRODUCT_VISION_AND_REQUIREMENTS.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/PRODUCT_VISION_AND_REQUIREMENTS.md) | Comprehensive functional requirements for all 12 capabilities. | Implemented vs planned features, core user journeys. |
| [`SYSTEM_ARCHITECTURE.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/SYSTEM_ARCHITECTURE.md) | End-to-end system architecture and data flows. | Client-server boundary, middleware, async database, Mermaid diagrams. |
| [`BACKEND_ARCHITECTURE.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/BACKEND_ARCHITECTURE.md) | FastAPI services, routers, and module-level responsibilities. | API versioning, dependency injection, auth lifecycle, service layer. |
| [`FRONTEND_ARCHITECTURE.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/FRONTEND_ARCHITECTURE.md) | Next.js App Router architecture and 20-route page inventory. | Component architecture, auth sync, localization, numeric input design. |
| [`DATABASE_AND_DATA_MODEL.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/DATABASE_AND_DATA_MODEL.md) | Comprehensive 21-table schema, foreign keys, and indexes. | ER diagrams, tenant isolation, Alembic migrations history. |
| [`API_REFERENCE.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/API_REFERENCE.md) | Complete 61-endpoint OpenAPI reference across 11 domains. | HTTP methods, schemas, authentication, query params, business rules. |
| [`AI_ML_AND_FINANCIAL_LOGIC.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/AI_ML_AND_FINANCIAL_LOGIC.md) | Mathematical formulas, financial logic, and ML/AI classification. | Deterministic algorithms, Decimal arithmetic, Privacy Gateway, LLMs. |
| [`SECURITY_AND_PRIVACY.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/SECURITY_AND_PRIVACY.md) | Security defenses, RBAC, IDOR protection, and PII redaction. | Bcrypt, JWT, Indian PII regex patterns, consent ledger, audit logs. |
| [`EXPLAINABILITY_AND_PROVENANCE.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/EXPLAINABILITY_AND_PROVENANCE.md) | Transparent calculation breakdowns and decision trees. | Reward math proofs, offer eligibility traces, confidence scoring. |
| [`IMPLEMENTATION_STATUS.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/IMPLEMENTATION_STATUS.md) | Honest, rigorous capability-by-capability implementation matrix. | Implemented vs Partial vs Planned vs Deferred tracking. |
| [`DEVELOPMENT_HISTORY.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/DEVELOPMENT_HISTORY.md) | Chronological development audit trail from Phase 0 to Phase 3.2. | Phase milestones, scope expansions, defect remediations. |
| [`KNOWN_ISSUES_AND_PENDING_FIXES.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/KNOWN_ISSUES_AND_PENDING_FIXES.md) | Audit findings DEF-01 to DEF-09 and technical debts. | Verified remediations, regression safeguards, known constraints. |
| [`MASTER_ROADMAP.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/MASTER_ROADMAP.md) | Complete 14-phase engineering roadmap (Phases 0 to 13). | Next immediate milestones: Phase 4 (Scam Shield) and beyond. |
| [`DEVELOPMENT_RULES.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/DEVELOPMENT_RULES.md) | Non-negotiable coding conventions and safety restrictions. | Git boundaries, Decimal arithmetic, architectural invariants. |
| [`TESTING_AND_VERIFICATION.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/TESTING_AND_VERIFICATION.md) | Backend & frontend testing suites and verification commands. | Pytest test catalog, Node test runner (42 tests, 7 suites). |
| [`ENVIRONMENT_AND_SETUP.md`](file:///Users/rahuljain/CLIQ/CLAUDE_HANDOVER/ENVIRONMENT_AND_SETUP.md) | Environment configuration, dependencies, and execution guide. | Zero-secret template, database setup, dual-stack startup commands. |

---

## 3. How Claude Should Consume This Package

When starting a new conversation or taking over development:

1. **Read `CLAUDE_MASTER_PROMPT.md` First:** Follow the prescribed protocol.
2. **Review Current Implementation Status:** Consult `IMPLEMENTATION_STATUS.md` and `KNOWN_ISSUES_AND_PENDING_FIXES.md` before assuming what code exists.
3. **Verify the Codebase Directly:** The source code in `backend/` and `frontend/` is the ultimate ground truth. If documentation and source code ever diverge, document the difference and confirm with the user.
4. **Preserve Existing Work:** Never run destructive git commands (`git reset`, `git clean`, `git checkout`, `git stash`). All uncommitted modifications in the working tree are intentional and must be preserved.
5. **Work Within Approved Phase Scope:** Progress strictly along the roadmap in `MASTER_ROADMAP.md`. Do not start subsequent phases without user authorization.

---

## 4. Relationship With Repository Documentation

The repository maintains 14 canonical documents (3 in root, 11 in `docs/`):
- `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`
- `docs/PROJECT_SPECIFICATION.md`
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/AI_ML_ARCHITECTURE.md`
- `docs/DATABASE_DESIGN.md`
- `docs/API_DOCUMENTATION.md`
- `docs/SECURITY_AND_PRIVACY.md`
- `docs/EXPLAINABILITY.md`
- `docs/DATASETS_AND_EVALUATION.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/SETUP_GUIDE.md`
- `docs/DEPLOYMENT.md`

The files in `CLAUDE_HANDOVER/` synthesize, deepen, and translate these canonical documents specifically for an autonomous AI engineering assistant, providing exact line references, defect histories, regression test cases, and onboarding instructions.

