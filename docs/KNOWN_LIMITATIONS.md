# CLIQ — KNOWN LIMITATIONS & ARCHITECTURAL BOUNDARIES

**Audit Version:** 1.0.0  
**Date:** 2026-10-30  
**Auditor:** Principal Software Architect & QA Lead  

This document provides a transparent, evidence-based inventory of current technical limitations, system boundaries, and prerequisites for production deployment.

---

## 1. Database & Row-Level Security (RLS)

- **Local Development RLS Status:** `NOT VERIFIED ON LIVE POSTGRESQL`  
  In local development, CLIQ operates with `aiosqlite` (`sqlite+aiosqlite:///./data/cliq.db`) for lightweight, zero-dependency local operation. SQLite does not support native PostgreSQL Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- **Application-Level Mitigation:** Tenant isolation is strictly enforced at the application/ORM query layer (`WHERE resource.user_id == current_user.id`) and verified by automated IDOR tests.
- **Production Prerequisite:** When deploying to production on Supabase PostgreSQL, the migrations in `supabase/migrations/001_initial_schema.sql` must be applied, and live RLS verification tests must be executed with Supabase JWT claims.

---

## 2. Optical Character Recognition (OCR) for Scanned PDFs

- **Status:** `PARTIALLY IMPLEMENTED (Text PDF Extraction Only)`  
- **Current Behavior:** Document Intelligence utilizes `PyMuPDF` (`fitz`) and fallback text streams to extract text from digital PDFs (e.g. statement downloads, credit card terms downloaded from bank portals).
- **Limitation:** If a user uploads a pure raster image PDF (e.g. a smartphone photograph or flat image scan of a paper brochure without an embedded text layer), `PyMuPDF` yields empty text, resulting in a parsing fallback.
- **Planned Roadmap:** Integration of Tesseract OCR or Google Cloud Vision API to extract text from scanned bitmap documents prior to regex/LLM rule structuring.

---

## 3. Generative AI & External LLM Connectivity

- **Status:** `CONFIGURABLE ABSTRACTION (Deterministic Fallback Active)`
- **Current Behavior:** The Language Intelligence service (`MultilingualAssistantService`) includes an HTTP client abstraction for Google Gemini (`gemini-1.5-flash`). When `GEMINI_API_KEY` is not supplied in the environment, the system automatically falls back to the deterministic grounded multilingual engine.
- **Limitation:** The deterministic engine accurately grounds and answers merchant-specific queries (Swiggy, Amazon, Fuel, Dining, Lounge access, and Portfolio summaries) across English, Hindi, and Kannada. However, open-ended conversational queries outside these intents return the portfolio summary rather than dynamic conversational responses until a live `GEMINI_API_KEY` is provided.

---

## 4. Rate Limiting Across Clustered Instances

- **Status:** `SINGLE-NODE IN-MEMORY IMPLEMENTATION`
- **Current Behavior:** `RateLimitMiddleware` maintains an in-memory sliding-window dictionary mapping client IP addresses to request timestamps.
- **Limitation:** On a single server or container, this provides effective DoS protection (120 req/min). If CLIQ is scaled horizontally across multiple ASGI worker processes or Kubernetes pods without sticky sessions, each pod maintains an isolated memory counter.
- **Production Recommendation:** Transition to a Redis-backed token bucket or distributed cache (e.g. Redis sliding window or Cloudflare rate limiting).

---

## 5. Client-Side JWT Storage

- **Status:** `BROWSER LOCALSTORAGE`
- **Current Behavior:** The Next.js frontend stores the access token in browser `localStorage` and injects it into the `Authorization: Bearer` header on API calls.
- **Limitation:** `localStorage` is accessible to client-side JavaScript, leaving it theoretically susceptible if an XSS vulnerability were introduced.
- **Production Recommendation:** For enterprise financial grade deployments, auth tokens should be exchanged for `HttpOnly`, `SameSite=Strict`, `Secure` cookies managed by a Next.js API route proxy.

---

## 6. Currency & Market Ecosystem Focus

- **Current Scope:** CLIQ's default categories, seed cards, and currency formats are optimized for the Indian credit card and fintech ecosystem (INR `₹`, standard cards: HDFC Millennia, Regalia, Infinia; Axis Ace; SBI Cashback; ICICI Amazon Pay; RuPay UPI credit cards).
- **Extensibility:** The underlying database schema and `RewardOptimizationEngine` accept any currency string and ISO codes, but user interface formatting defaults to `₹`.

