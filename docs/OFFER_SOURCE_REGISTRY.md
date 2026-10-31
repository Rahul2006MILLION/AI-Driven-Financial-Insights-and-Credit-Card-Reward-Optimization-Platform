# CLIQ — Centralized Offer Source Registry

## Overview

The **CLIQ Offer Source Registry** is the central authority governing all upstream data sources for Indian credit card offers, bank partnerships, merchant promotions, and payment network perks.

In compliance with fintech application security guidelines and anti-bot boundaries, CLIQ uses explicit integration states. A source is **never** labeled as `IMPLEMENTED` merely because code or an adapter class exists; rather, its true boundary (WAF protection, CDN challenge, `robots.txt` policy, or partner authentication requirement) is recorded and enforced.

---

## 1. Registry Architecture & Data Model

Each registered source is tracked in the database as an `OfferSource` record with the following operational attributes:

- **Source Key & Domain**: Canonical identifier and host domain.
- **Source Type**: `BANK`, `MERCHANT`, `NETWORK`, or `PARTNER`.
- **Supported Ingestion Methods**: One or more of `HTML_EXTRACTION`, `PDF_CIRCULAR`, `PARTNER_FEED`, `ADMIN_DOCUMENT`, `MANUAL_ENTRY`.
- **Connector Status**: Explicit integration state:
  - `IMPLEMENTED`: Automated machine-readable connector fully active with end-to-end extraction.
  - `PARTIALLY_IMPLEMENTED`: Public landing page accessible; client-side dynamic DOM or partial structured data.
  - `MANUAL_ONLY`: Protected by bot management, CAPTCHA, or WAF; automated scraping disallowed. Ingestion via uploaded circular or admin entry.
  - `BLOCKED`: Upstream endpoint returns 403 Forbidden or active anti-bot challenge.
  - `ROBOTS_DISALLOWED`: Crawler forbidden by upstream `robots.txt` policy.
  - `SOURCE_UNAVAILABLE`: Upstream endpoint returns 404/5xx or is decommissioned.
  - `NOT_INTEGRATED`: Planned future source.
- **Source Health**: `HEALTHY`, `DEGRADED`, `FAILING`, `BLOCKED`, `UNKNOWN`.
- **Access Boundary & Permission Status**: Explicit legal and technical compliance statement.
- **Telemetry**: Last attempted fetch, last successful fetch, last HTTP status, latency (ms), consecutive failures, and rate limits.

---

## 2. Source-by-Source Registry Directory

| Source Key | Name & Domain | Type | Connector Status | Health | Supported Channels | Access Boundary & Compliance Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `hdfc_bank` | **HDFC Bank SmartBuy & Card Offers**<br>`hdfcbank.com` | BANK | `MANUAL_ONLY` | `HEALTHY` | `PDF_CIRCULAR`, `ADMIN_DOCUMENT`, `MANUAL_ENTRY` | Akamai CDN / anti-bot packet inspection blocks direct server scraping (403/timeout). Automated scraping prohibited; official PDF circulars and admin entries used. |
| `icici_bank` | **ICICI Bank Offers & Deals**<br>`icicibank.com` | BANK | `PARTIALLY_IMPLEMENTED` | `HEALTHY` | `HTML_EXTRACTION`, `ADMIN_DOCUMENT`, `MANUAL_ENTRY` | Public HTML shell accessible (200 OK); deal cards rendered dynamically via client-side JavaScript. Curated verified terms used for ingestion. |
| `axis_bank` | **Axis Bank GrabDeals & Dining**<br>`axisbank.com` | BANK | `PARTIALLY_IMPLEMENTED` | `HEALTHY` | `HTML_EXTRACTION`, `ADMIN_DOCUMENT`, `MANUAL_ENTRY` | Public deals catalog accessible (200 OK); offers require client-side SPA state. Ingested via HTML extract and PDF circulars. |
| `rupay_npci` | **RuPay (NPCI) Card Offers**<br>`rupay.co.in` | NETWORK | `ROBOTS_DISALLOWED` | `DEGRADED` | `ADMIN_DOCUMENT`, `MANUAL_ENTRY` | Upstream `/robots.txt` disallows automated scrapers (`User-agent: * Disallow: /`). Strict compliance: automated scraping rejected; ingested via NPCI press releases and circulars. |
| `blinkit` | **Blinkit Quick Commerce Bank Offers**<br>`blinkit.com` | MERCHANT | `MANUAL_ONLY` | `HEALTHY` | `ADMIN_DOCUMENT`, `MANUAL_ENTRY` | Cloudflare WAF bot mitigation blocks automated scrapers (HTTP 403 Forbidden). CLIQ complies with WAF boundaries; ingests via official merchant partner circulars. |
| `swiggy` | **Swiggy Dining & Instamart Partnerships**<br>`swiggy.com` | MERCHANT | `MANUAL_ONLY` | `HEALTHY` | `ADMIN_DOCUMENT`, `MANUAL_ENTRY` | Protected by CloudFront / Datadome bot mitigation. Automated HTML scraping prohibited; ingestion via verified partner agreements and manual registry. |
| `sbi_card` | **SBI Card Offers & Discounts**<br>`sbicard.com` | BANK | `PARTIALLY_IMPLEMENTED` | `HEALTHY` | `HTML_EXTRACTION`, `PDF_CIRCULAR`, `MANUAL_ENTRY` | Public portal accessible; promo campaigns published as downloadable PDF circulars. |
| `partner_feed` | **Authorized Partner API & Feeds**<br>`api.cliq.finance` | PARTNER | `IMPLEMENTED` | `HEALTHY` | `PARTNER_FEED` | Authorized B2B JSON feed authenticated via Bearer token and HMAC signature. Directly parses canonical payloads into the staging queue. |

---

## 3. Rate Limits & Exponential Backoff

To prevent excessive server load, denial of service, or IP bans:

1. **Rate Limiting**: Each source has a configured `rate_limit_per_minute` (default: 10 requests/min).
2. **Exponential Backoff**: When a source encounters transient failures (HTTP 5xx, timeouts):
   $$\text{Delay} = \min(30 \times 2^{\text{consecutive\_failures} - 1}, 3600) \text{ seconds}$$
3. **Failure Logging**: All non-200 responses, network timeouts, or WAF challenges are recorded in the `source_failure_logs` table with timestamp, attempt number, retry delay, and remediation guidance.

---

## 4. Administrative Control & Live Probing

Authorized administrators can audit and manage sources from the **Offer Intelligence Desk** (`/admin/offers` -> **Source Registry & Health**):
- **Live Single-Source Probe**: `POST /api/v1/offers/sources/{id}/probe` fetches headers, checks `robots.txt`, detects WAF signatures (Akamai, Cloudflare, CloudFront, AWS WAF), records latency, and updates health.
- **Parallel Source Probe**: `POST /api/v1/offers/sources/probe-all` probes all 8 sources concurrently with a 5.0-second safety timeout.
