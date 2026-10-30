# CLIQ Local Setup & Development Guide

Follow these instructions to set up, run, and test CLIQ locally.

---

## Prerequisites
- **Node.js**: v18.18+ or v20+ (tested on Node v22)
- **Python**: 3.11, 3.12, or 3.14 (tested with uv / python3)
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
   cp ../.env.example .env
   ```
   *Note: By default, `DATABASE_URL=sqlite+aiosqlite:///./data/cliq.db` allows immediate execution without external database setups. To use Supabase, provide your `postgresql+asyncpg://` connection string.*

5. **Run the backend development server:**
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
  pytest -v
  ```

- **Run security-specific tests:**
  ```bash
  pytest tests/security/ -v
  ```

- **Run frontend tests & type checks:**
  ```bash
  cd frontend
  npm run build
  ```
