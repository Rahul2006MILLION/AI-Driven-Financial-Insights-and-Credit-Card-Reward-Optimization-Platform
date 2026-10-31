# CLIQ — Offer Source Health, Monitoring & Freshness

## Overview

Upstream bank and merchant offer websites are volatile: promotional terms expire, campaigns are refreshed, partner endpoints return 404s, and CDNs introduce bot protections.

CLIQ maintains continuous reliability through **active health probing**, **structured failure logging with exponential backoff**, **offer freshness state tracking**, and **zero-tolerance material change quarantine**.

---

## 1. Source Health Lifecycle

Every source in the registry transitions through explicit health states based on live probe telemetry:

```
                  ┌──────────────────────┐
                  │       UNKNOWN        │ (Initial unprobed state)
                  └──────────┬───────────┘
                             │ First Probe
                             ▼
                  ┌──────────────────────┐
           ┌─────►│       HEALTHY        │◄─────┐
           │      │   HTTP 200 OK        │      │ Successful recovery
           │      └──────────┬───────────┘      │
Consecutive│                 │                  │
Successes  │                 │ 1-2 Failures     │
           │                 ▼                  │
           │      ┌──────────────────────┐      │
           ├──────┤       DEGRADED       │──────┘
           │      │ Timeouts / Slow (>3s)│
           │      └──────────┬───────────┘
           │                 │
           │                 │ 3+ Consecutive Failures
           │                 ▼
           │      ┌──────────────────────┐
           ├──────┤       FAILING        │
           │      │ 5xx / Repeated Drops │
           │      └──────────┬───────────┘
           │                 │
           │                 │ WAF Block / 403 / CAPTCHA
           │                 ▼
           │      ┌──────────────────────┐
           └──────┤       BLOCKED        │
                  │ Cloudflare / Akamai  │
                  └──────────────────────┘
```

---

## 2. Structured Failure Logging & Exponential Backoff

When an ingestion attempt or health probe fails, it writes an immutable event to `source_failure_logs`:

```python
class SourceFailureLog(Base):
    id: str                         # UUID
    source_id: str                  # Foreign key to offer_sources
    http_status: Optional[int]      # 403, 404, 500, 503, etc.
    error_type: str                 # WAF_BOT_DETECTED, ROBOTS_DISALLOWED, CONNECT_TIMEOUT, HTTP_ERROR
    error_message: str              # Diagnostic message
    attempt_number: int             # 1, 2, 3...
    retry_after_seconds: int        # Backoff wait duration
    context_json: str               # Request URL, headers, WAF signatures
    timestamp: datetime             # UTC timestamp
```

### Exponential Backoff Schedule
To protect third-party banking servers from hammering:

| Attempt # | Delay Before Next Probe | Operational Impact |
| :--- | :--- | :--- |
| **Attempt 1** | 30 seconds | Immediate retry scheduled |
| **Attempt 2** | 60 seconds | Status becomes `DEGRADED` |
| **Attempt 3** | 120 seconds | Status becomes `FAILING` |
| **Attempt 4** | 240 seconds | Notification raised on admin dashboard |
| **Attempt 5+** | Capped at 3,600s (1 hour) | Administrator investigation required |

---

## 3. Offer Freshness State Tracking

In addition to static validity timestamps (`valid_from`, `valid_to`), each offer is assigned a dynamic `freshness_state`:

1. **`FRESH`**: Active, verified offer within its validity window ($> 7$ days until expiry).
2. **`EXPIRING_SOON`**: Active offer with $\le 7$ days remaining before `valid_to`. Highlighted in the UI to encourage utilization.
3. **`STALE`**: No source probe or verification recorded within the last 30 days. Triggers automated verification prompt.
4. **`EXPIRED`**: Current UTC time $> \text{valid\_to}$. Automatically decommissioned and excluded from all recommendations.
5. **`QUARANTINED`**: Quarantined into `NEEDS_REVERIFICATION` due to detected material term changes at source.
6. **`UNAVAILABLE`**: The primary source URL returned HTTP 404/410, or the merchant discontinued the partner page.

---

## 4. Zero-Tolerance Material Change Quarantine

When a recurring ingestion job detects an existing offer at source:

```python
material_changed, change_reasons = DiscoveryPipeline.is_material_change(existing, new_payload)
```

The system checks **8 material dimensions**:
1. Discount percentage or flat amount changed.
2. Maximum discount cap changed.
3. Minimum spend requirement changed.
4. Promo / coupon code changed.
5. Expiry date shifted by any calendar day.
6. Eligible card variants list changed.
7. Eligible bank or payment network changed.
8. Channel (Online / Offline) or category changed.

### Quarantine Action
If **any** material change is detected:
- The previous approved version is archived into `previous_version_json`.
- The offer status is **immediately transitioned to `NEEDS_REVERIFICATION`**.
- The offer is **immediately excluded from user recommendations** (`applicable_offers` filtering excludes any non-`VERIFIED` status).
- An audit entry `REVERIFICATION_TRIGGERED` is logged with exact reasons.
- The offer appears in the admin review queue with a visual side-by-side diff.

