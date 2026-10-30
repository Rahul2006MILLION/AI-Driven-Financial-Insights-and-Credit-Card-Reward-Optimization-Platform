# CLIQ — Money Made Simple. In Your Language.

> **Smarter decisions, Brighter futures. For everyone.**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)

---

## 🌟 Introduction

**CLIQ** is a modern, AI-powered financial intelligence and credit-card reward optimization platform. Inspired by the cinematic visual aesthetic of *Neon Mountain Journey*, CLIQ combines high-contrast dark visual design (#020B12 background with glowing cyan and emerald accents) with a strict deterministic reward calculation engine and native multilingual support (English, Hindi, and Kannada).

### Why CLIQ?
- **Deterministic Accuracy:** Financial calculations, reward caps, and exclusions are executed in pure Python with arbitrary-precision `Decimal` math. The LLM never calculates or guesses financial figures.
- **Multilingual Intelligence:** Access financial advice, card comparisons, and transaction optimizations in English, Hindi (`हिन्दी`), or Kannada (`ಕನ್ನಡ`).
- **Document Intelligence with Human Verification:** Upload PDF card policy documents or statements. Extracted rules are staged for user review before activation.
- **Complete Card Intelligence:** Compare cards side by side, track reward caps, identify subscription leakage, and discover optimal cards for every single purchase.

---

## 🎨 Visual Design

The user interface follows the **Neon Mountain Journey** design palette:
- **Background:** `#020B12` (Cinematic deep midnight)
- **Secondary Background:** `#071923`
- **Surface / Cards:** `#0B202A`
- **Primary Cyan:** `#00E5E5`
- **Turquoise:** `#00F5C8`
- **Emerald Green:** `#00D69B`
- **Primary Text:** `#FFFFFF`
- **Secondary Text:** `#A9BBC5`
- **Borders:** Subtle dark cyan `#133240`

---

## 🚀 15 Connected Screens

1. **Landing Page** — Cinematic hero, feature matrix, and value proposition.
2. **Sign-up & Login** — Secure authentication and session initiation.
3. **User Onboarding** — Currency, language, and initial portfolio setup.
4. **Main Dashboard** — High-level financial KPIs, portfolio summary, and quick optimizer.
5. **My Credit Cards** — Portfolio management, active multiplier rules, and benefit tags.
6. **Add Credit Card** — Add card with customizable reward categories, merchant perks, and caps.
7. **Credit Card Comparison** — Side-by-side comparative analysis of card benefits and fees.
8. **Reward Optimization** — Instant transaction calculator and best card recommender.
9. **Transaction Analysis** — Deep dive into past transactions and reward realization.
10. **Spending Analytics** — Visual charts for category breakdowns and monthly spend velocity.
11. **Financial Health Insights** — Subscription audits, fee vs. reward breakeven, and savings potential.
12. **AI Financial Assistant** — Multilingual conversational agent grounded in user's cards.
13. **Document Upload & Processing** — PDF statement processing and human-in-the-loop rule verification.
14. **User Profile** — Profile preferences, language switching (English, Hindi, Kannada).
15. **Settings & Security** — Session details, audit logs, and data privacy controls.

---

## 🏗️ Technology Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Backend:** Python, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), PyMuPDF.
- **Database:** Supabase PostgreSQL / Async SQLite for development & testing.
- **AI / LLM:** Google Gemini / Configurable Provider with grounded fallback engine.

---

## ⚡ Quick Start

### 1. Run the Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run backend unit and security tests:
```bash
cd backend
pytest -v
```

---

## 📚 Complete Documentation

Extensive documentation is maintained in the `/docs` directory:
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Reward Optimization Engine](docs/REWARD_OPTIMIZATION.md)
- [Security Architecture](docs/SECURITY.md)
- [Threat Model](docs/THREAT_MODEL.md)
- [AI Architecture](docs/AI_ARCHITECTURE.md)
- [REST API Reference](docs/API_DOCUMENTATION.md)
- [Data Flow](docs/DATA_FLOW.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Testing Guide](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
