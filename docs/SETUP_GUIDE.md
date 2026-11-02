# CLIQ Local Setup & Development Guide

Follow these instructions to set up, run, and test CLIQ locally.

---

## Prerequisites
- **Node.js**: v18.18+ or v20+ (tested on Node v20/v22)
- **Python**: 3.11 or 3.12 (tested with virtualenv / python3)
- **Git**

---

## 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *To connect to central Supabase PostgreSQL, set `DATABASE_URL` in `backend/.env`:*
   ```env
   DATABASE_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```
   *The backend engine automatically translates `postgresql://` to `postgresql+asyncpg://` with SSL pre-ping enabled.*

5. **Run database migrations with Alembic:**
   ```bash
   alembic upgrade head
   ```

6. **Run the backend development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at: `http://localhost:8000`  
   Interactive API docs (Swagger): `http://localhost:8000/docs`

---

## 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env.local` if custom API URLs are needed:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. **Run the Next.js development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:3000`

---

## 3. Running Automated Tests

- **Run all backend tests:**
  ```bash
  cd backend
  PYTHONPATH=. .venv/bin/pytest -v
  ```

- **Run security-specific tests:**
  ```bash
  cd backend
  PYTHONPATH=. .venv/bin/pytest tests/security/ -v
  ```

- **Run frontend unit & integration tests:**
  ```bash
  cd frontend
  npm test
  ```

- **Run frontend production build verification:**
  ```bash
  cd frontend
  npm run build
  ```
