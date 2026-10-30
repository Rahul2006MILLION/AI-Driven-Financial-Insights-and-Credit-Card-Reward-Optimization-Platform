# CLIQ Deployment Guide

## 1. Production Architecture Overview

- **Frontend:** Hosted on Vercel or containerized with Next.js standalone output.
- **Backend:** Containerized FastAPI app deployed to Google Cloud Run, AWS ECS, or Render.
- **Database:** Supabase Managed PostgreSQL with Row-Level Security enabled.
- **Storage:** Supabase Storage private bucket for uploaded card policy PDFs.

---

## 2. Docker Deployment

CLIQ includes a production-ready `docker-compose.yml` that orchestrates frontend and backend containers:

```bash
# Build and run containers in detached mode
docker-compose up --build -d

# Verify health status
curl http://localhost:8000/health
```

---

## 3. Environment Variables for Production

Ensure the following production environment variables are configured in your secret manager:

| Variable | Description |
|---|---|
| `ENVIRONMENT` | Must be set to `production` |
| `DATABASE_URL` | Supabase connection string (`postgresql+asyncpg://...`) |
| `APP_SECRET_KEY` | 64-character random hex string |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_JWT_SECRET` | Supabase project JWT secret for token verification |
| `ALLOWED_ORIGINS` | Comma-separated list of approved domains (e.g. `https://cliq.finance`) |
| `AI_PROVIDER` | `gemini` or `openai` |
| `GEMINI_API_KEY` | Production API key |
