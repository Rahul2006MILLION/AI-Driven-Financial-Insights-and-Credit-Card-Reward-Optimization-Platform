# CLIQ — OFFER SYNC & MONITORING SPECIFICATION
## Automated Harvesting, Expiry Management, and Continuous Compliance

---

## 1. Automated Sync Architecture

The background sync daemon operates via scheduled background intervals (or manual trigger from the admin desk):

```mermaid
sequenceDiagram
    autonumber
    participant S as Scheduler / Admin
    participant DP as Discovery Pipeline
    participant C as Connectors (HDFC, ICICI, etc.)
    participant DB as SQLite / PostgreSQL
    participant Q as Review Queue

    S->>DP: Trigger run_discovery_pipeline()
    loop For each connector
        DP->>C: fetch_offers()
        C-->>DP: List[DiscoveredOfferPayload]
    end
    DP->>DP: Score Extraction Confidence (0.70 - 0.98)
    DP->>DP: Calculate Canonical SHA-256 Hash
    DP->>DB: Check for matching Content Hash / Promo Key
    alt New Offer
        DP->>DB: Insert as PENDING_REVIEW + Log DISCOVERED
        DP->>Q: Enqueue for Human Review
    alt Existing Verified & Material Change
        DP->>DB: Snapshot old version to JSON + Status: NEEDS_REVERIFICATION
        DP->>Q: Enqueue for Reverification (Quarantined)
    alt Existing Unchanged
        DP->>DB: Update last_verified_timestamp
    end
    DP-->>S: Return DiscoverySyncResponse
```

---

## 2. Source Terms & Anti-Bot Compliance

All connectors conform to strict access guidelines:
- **Respect `robots.txt`**: Connectors inspect server disallow directives prior to scraping.
- **Configurable Polling Intervals**: Minimum interval between polls to a single bank domain is 60 seconds.
- **Zero Bypass of Authentication / CAPTCHA**: CLIQ never circumvents login walls, session tokens, or anti-bot Cloudflare challenges. Connectors query only publicly accessible marketing and partner deal pages.
- **Header Identification**: User-Agent string explicitly declares:
  `CLIQ-Intelligence-Bot/1.0 (+https://cliq.ai/bot; verification@cliq.ai)`

---

## 3. Expiry Management

1. **Daily Expiry Sweep:**
   - Any offer where $\text{valid\_to} < \text{now()}$ is transitioned from `VERIFIED` to `EXPIRED`.
   - Expired offers are retained in the database for historical analytics and transaction reconciliation, but are excluded from `/api/v1/offers` and recommendation queries.
2. **7-Day Expiry Warning Window:**
   - Offers expiring within 7 days are highlighted with an orange timer pill and surfaced via the `expiring_soon=true` API filter.
   - Admin review desk prompts verification staff to check if issuers plan to renew the campaign before the month-end deadline.

