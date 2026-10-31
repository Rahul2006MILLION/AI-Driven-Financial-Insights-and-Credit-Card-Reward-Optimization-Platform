# CLIQ — OFFER SECURITY & AUDIT TRAIL ARCHITECTURE
## Role-Based Access Control, Tamper-Resistance, and Provenance Auditing

---

## 1. Threat Model & Security Objectives

| Threat Scenario | Risk Level | Mitigation in CLIQ |
| :--- | :---: | :--- |
| **Unauthorized Catalog Poisoning:** Non-admin user attempts to create verified 90% discount deals | **Critical** | `require_admin` dependency enforces `is_admin=True` or `role="ADMIN"`. Ordinary user submissions are forced into `PENDING_REVIEW`. |
| **Recommendation Manipulation:** Stale or unapproved offer returned in optimizer | **Critical** | Engine queries enforce `verification_status == "VERIFIED"` and $\text{valid\_from} \le \text{now} \le \text{valid\_to}$. Quarantined offers are mathematically dropped. |
| **Silent Source Tampering:** Bank quietly halves cashback cap on existing promotion | **High** | Discovery pipeline canonical hashing compares hashes; automatically snapshots previous version and forces status into `NEEDS_REVERIFICATION`. |
| **Lack of Accountability:** Offer approved without reviewer trace | **Medium** | `reviewed_by_id`, `reviewed_by_name`, and timestamp recorded on every state mutation; immutable `OfferAuditLog` rows created. |

---

## 2. Role-Based Access Control (RBAC) Implementation

FastAPI route handlers are defended by [`require_admin`](file:///Users/rahuljain/CLIQ/backend/app/security/dependencies.py):

```python
async def require_admin(
    current_user: Profile = Depends(get_current_user)
) -> Profile:
    if not (current_user.is_admin or current_user.role == "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access the offer verification system."
        )
    return current_user
```

### Authorization Matrix
| Operation / Endpoint | Anonymous | Ordinary User (`USER`) | Administrator (`ADMIN`) |
| :--- | :---: | :---: | :---: |
| `GET /api/v1/offers` | 401 | **200 (Only VERIFIED)** | **200 (All Active)** |
| `POST /api/v1/offers` | 401 | **201 (Forces PENDING_REVIEW)** | **201 (Direct Verify Allowed)** |
| `GET /api/v1/admin/offers/review-queue` | 401 | **403 Forbidden** | **200 Allowed** |
| `POST /api/v1/admin/offers/{id}/approve` | 401 | **403 Forbidden** | **200 Allowed** |
| `POST /api/v1/admin/offers/{id}/reject` | 401 | **403 Forbidden** | **200 Allowed** |
| `PUT /api/v1/admin/offers/{id}` | 401 | **403 Forbidden** | **200 Allowed** |
| `POST /api/v1/admin/offers/sync-discovery` | 401 | **403 Forbidden** | **200 Allowed** |
| `GET /api/v1/admin/offers/{id}/audit-trail` | 401 | **403 Forbidden** | **200 Allowed** |

---

## 3. Tamper-Resistant Audit Trail (`offer_audit_logs`)

Every offer event is logged in the dedicated `offer_audit_logs` table:
- `id`: Unique UUID identifier.
- `offer_id`: Foreign key reference to `card_offers.id`.
- `action`: State event (`DISCOVERED`, `SUBMITTED_FOR_REVIEW`, `APPROVED`, `EDITED`, `REJECTED`, `REVERIFICATION_TRIGGERED`, `EXPIRED`).
- `actor_id` & `actor_name`: Identity of the approving admin or automated worker.
- `actor_role`: `ADMIN`, `SYSTEM`, or `USER`.
- `from_status` & `to_status`: State transition tracking.
- `notes`: Documented rationale or rejection reasons.
- `snapshot_json`: Full JSON snapshot of the superseded version when terms change.
- `timestamp`: UTC timestamp of the operation.

Audit entries are append-only and cannot be updated or deleted via API endpoints.
