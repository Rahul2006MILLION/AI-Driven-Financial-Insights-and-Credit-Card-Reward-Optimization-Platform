# CLIQ — Personal Financial Intelligence Platform

> **"Understand Your Money. Make Better Financial Decisions."**  
> *AI-Powered Financial Intelligence, Credit Card Reward Optimization & Financial Inclusion Suite.*

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Frontend: Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![AI: Gemini 2.5 Flash](https://img.shields.io/badge/AI-Google%20Gemini%202.5-4285F4.svg)](https://deepmind.google/technologies/gemini/)

---

## 🌟 Executive Overview

**CLIQ** is a privacy-first personal financial intelligence platform tailored for the modern Indian financial ecosystem. CLIQ helps users demystify credit card reward programs, avoid predatory revolving interest traps, track spending velocity, discover promotional bank discounts, and build sustainable financial literacy in their native language.

### Core Architecture Highlights
- **Deterministic Mathematical Core:** Financial optimization, compound interest schedules, and credit utilization calculations are executed in pure Python using arbitrary-precision `Decimal` math. Generative models never calculate numbers.
- **Centralized Privacy Gateway:** 9-rule regex PII scrubbing pipeline that sanitizes Aadhaar, PAN, card numbers, phone numbers, email addresses, and UPI IDs before any external AI communication.
- **CLIQ Learn & Inclusion Suite:** Complete financial education curriculum across 9 modules and 5 interactive simulation calculators (Minimum Due Trap, Debt Payoff, Utilization, Compound Interest, Break-Even).
- **Interactive Liquid Glass UI:** High-contrast aesthetic (`#040707` canvas, `#00F5FF` cyan, `#A78BFA` purple) featuring Framer Motion spring physics and a 3D diagonal card stack.
- **Multilingual Support:** First-class support for Indian vernacular languages (English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Gujarati) with zero-loss fallback.

---

## 🚀 19 Connected Screens

| Path | Screen Name | Description & Capabilities |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Interactive hero, value proposition, trust pillars, and live calculators. |
| `/login` | **Authentication** | Secure JWT Bearer login with automated session restoration. |
| `/register` | **Registration** | New account creation with default portfolio preference initialization. |
| `/onboarding` | **Onboarding Wizard** | Step-by-step currency, language, and initial credit card portfolio setup. |
| `/dashboard` | **Main Dashboard** | Executive summary: Financial health score, active cards, recent spends, and quick optimizer. |
| `/cards` | **Digital Wallet** | Interactive 3D credit card stack, spend caps, and cardholder benefit tags. |
| `/cards/[id]` | **Card Detail View** | Deep configuration: reward rules, exclusion policies, and annual fee waiver targets. |
| `/transactions` | **Transactions Explorer** | Searchable transaction ledger with category filters, merchant tags, and recurring markers. |
| `/transactions/import` | **CSV Statement Import** | Two-phase statement parser with merchant normalization and deduplication commit. |
| `/spending` | **Spending Analytics** | Visual category allocations, spend velocity trends, and merchant concentration. |
| `/health` | **Financial Health** | Multi-pillar health scoring, debt burden analysis, and 25–35 day subscription detection. |
| `/optimization` | **Reward Optimizer** | Instant best-card recommendation engine matching transactions to highest net yield. |
| `/simulate` | **What-If Simulator** | Multi-bracket purchase scenario modeling testing spend caps and milestone bonuses. |
| `/compare` | **Card Comparison** | Head-to-head comparison matrix for up to 4 credit cards simultaneously. |
| `/offers` | **Offers & Deals** | Live curated and scraped promotional merchant discounts and bank cashbacks. |
| `/offers/review` | **Offer Review** | User contribution and community verification view for promotional deals. |
| `/admin/offers` | **Admin Verification Desk** | Administrative queue for human-in-the-loop validation of scraped bank circulars. |
| `/assistant` | **AI Financial Assistant** | Multilingual natural language assistant backed by Gemini 2.5 Flash and Privacy Gateway. |
| `/learn` | **CLIQ Learn** | 9-module financial literacy academy with 27 lessons, quizzes, and 5 calculators. |
| `/budget` | **Income & Budget Command** | Cash flow tracking, regular & irregular earnings, and disciplined 50/30/20 budgeting. |

---

## 🏗️ Technology Stack

- **Frontend:** Next.js 14.2+ (App Router), React 18, TypeScript 5, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend:** FastAPI (Python 3.12), Pydantic v2, SQLAlchemy 2.0 Async, Slowapi Rate Limiter.
- **Database:** Supabase PostgreSQL (`postgresql+asyncpg://` with connection recycling and SSL require) + SQLite test isolation.
- **AI & Document Intelligence:** Google GenAI SDK (`gemini-2.5-flash`), `pypdf` document extraction, Centralized Privacy Gateway.
- **Testing:** Pytest (72 backend unit/integration tests), Jest & React Testing Library (36 frontend tests).

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL (or Supabase project)

### 2. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Client application will be accessible at `http://localhost:3000`.

### 4. Running Verification Test Suites
```bash
# Run backend tests
cd backend
PYTHONPATH=. .venv/bin/pytest -v

# Run frontend tests
cd frontend
npm test
```

---

## 📚 Technical Documentation Suite

Complete architectural, security, and algorithmic specifications are maintained in the `/docs` directory:

| Document | Primary Focus & Domain |
| :--- | :--- |
| **[Project Specification](docs/PROJECT_SPECIFICATION.md)** | Product identity, problem statement, user personas, and functional requirements. |
| **[System Architecture](docs/SYSTEM_ARCHITECTURE.md)** | Multi-tier architectural design, Next.js 14 App Router, FastAPI, and dataflow diagrams. |
| **[AI & ML Architecture](docs/AI_ML_ARCHITECTURE.md)** | Deterministic vs probabilistic boundary, Gemini 2.5 Flash, merchant normalization, and roadmap models. |
| **[Explainability (XAI)](docs/EXPLAINABILITY.md)** | Mathematical provenance, `CalculationStep` traces, rejection reason taxonomy, and 6 core questions. |
| **[Database Design](docs/DATABASE_DESIGN.md)** | Complete 20-entity relational schema, Supabase PostgreSQL configuration, ER diagrams, and Alembic migrations. |
| **[REST API Reference](docs/API_DOCUMENTATION.md)** | Exhaustive reference for all 68 route-method operations across 11 functional domains. |
| **[Security & Privacy](docs/SECURITY_AND_PRIVACY.md)** | STRIDE threat model, Centralized Privacy Gateway (9 PII rules), zero-trust tenant isolation, and RBAC. |
| **[Datasets & Evaluation](docs/DATASETS_AND_EVALUATION.md)** | Seed catalogs (merchants, categories, curriculum), ground truth benchmarks, and test harness. |
| **[Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)** | Milestone history (v0.1.0 to v0.3.0), implemented capabilities matrix, and Sprints 1–6 future roadmap. |
| **[Setup Guide](docs/SETUP_GUIDE.md)** | Detailed developer onboarding and local environment configuration guide. |
| **[Deployment Guide](docs/DEPLOYMENT.md)** | Production containerization and cloud hosting procedures. |
