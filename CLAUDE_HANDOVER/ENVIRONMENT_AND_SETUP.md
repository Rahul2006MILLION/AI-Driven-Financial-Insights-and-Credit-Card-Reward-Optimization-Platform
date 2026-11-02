# CLIQ — Environment Configuration & Local Setup Guide

This document provides step-by-step setup instructions to initialize, configure, and execute the CLIQ application stack locally.

---

## 1. Prerequisites

- **Operating System:** macOS, Linux, or Windows (WSL2 recommended)
- **Python:** Version 3.12 or higher
- **Node.js:** Version 18.17+ or 20+
- **Package Managers:** `pip` and `npm`
- **Database (Optional for local dev):** PostgreSQL 15+ (Local development defaults seamlessly to SQLite async via `aiosqlite`)

---

## 2. Backend Environment Setup

### 2.1 Virtual Environment
Navigate to the `backend/` directory:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.2 Environment Configuration File (`backend/.env`)
Copy the provided `.env.example`:
```bash
cp .env.example .env
```

**Clean Template Configuration Schema (Zero Secrets):**
```ini
# Environment Mode
ENVIRONMENT=development

# Database Connection
# SQLite Async (Default for local development & unit testing):
DATABASE_URL=sqlite+aiosqlite:///./cliq.db
# PostgreSQL Async (For Supabase / RDS / Cloud SQL production):
# DATABASE_URL=postgresql+asyncpg://<username>:<password>@<host>:<port>/<database>

# Cryptographic Keys (HS256 JWT Token Signing)
SECRET_KEY=your_development_secret_key_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# External AI Provider (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Security & Gateway Parameters
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
RATE_LIMIT_PER_MINUTE=120
```

### 2.3 Database Migrations
Apply versioned Alembic migrations:
```bash
cd backend
PYTHONPATH=. alembic upgrade head
```

---

## 3. Frontend Environment Setup

### 3.1 Node Dependencies
Navigate to the `frontend/` directory and install packages:
```bash
cd frontend
npm install
```

### 3.2 Environment Configuration File (`frontend/.env.local`)
Create `frontend/.env.local` if custom backend URL is desired:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
*(If omitted, the frontend defaults to `http://localhost:8000/api/v1`. The `/api/v1` suffix is required — omitting it causes all API calls to return 404.)*

---

## 4. Running the Development Servers

### 4.1 Start the FastAPI Backend
From the repository root:
```bash
cd backend
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Interactive ReDoc: `http://localhost:8000/redoc`
- System Health: `http://localhost:8000/health`

### 4.2 Start the Next.js Frontend
From another terminal tab:
```bash
cd frontend
npm run dev
```
- Frontend Web Interface: `http://localhost:3000`

---

## 5. Verification Commands

### 5.1 Run Frontend Test Suite
```bash
npm --prefix frontend test -- --watchAll=false
```
*Expected: 42 passed across 7 suites.*

### 5.2 Verify Next.js Production Build
```bash
npm --prefix frontend run build
```
*Expected: Successfully compiles 23/23 static pages.*

### 5.3 Run Backend Unit & Security Test Suite
```bash
cd backend
PYTHONPATH=. .venv/bin/pytest tests/unit/ tests/security/ -q
```

