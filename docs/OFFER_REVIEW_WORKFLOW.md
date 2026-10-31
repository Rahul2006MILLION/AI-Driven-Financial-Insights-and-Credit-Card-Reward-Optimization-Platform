# CLIQ — ADMINISTRATIVE OFFER REVIEW WORKFLOW
## Operational Standard Operating Procedures (SOP) for Human-in-the-Loop Verification

---

## 1. Access Control & Authorization

The administrative review desk is accessible at:
- **Web UI:** `/admin/offers`
- **REST Endpoints:** `/api/v1/admin/offers/*`

Access is restricted exclusively to authenticated users with `role: "ADMIN"` or `is_admin: true`.
Unauthenticated requests yield `HTTP 401 Unauthorized`; non-admin user requests yield `HTTP 403 Forbidden`.

---

## 2. Review Desk Interface & Features

The review interface ([`frontend/app/admin/offers/page.tsx`](file:///Users/rahuljain/CLIQ/frontend/app/admin/offers/page.tsx)) provides:

1. **Top Metrics Bar:** Real-time counters of items awaiting action:
   - `PENDING_REVIEW` (Yellow counter)
   - `NEEDS_REVERIFICATION` (Orange counter — high priority)
   - `VERIFIED` (Emerald active counter)
   - `REJECTED` (Rose counter)
2. **On-Demand Discovery Ingestion:** "Run Discovery Sync" button executes the connector pipeline and displays summary counters.
3. **Filter Pills:** Filter review table by status or search across merchants and promo codes.
4. **Source Evidence Proof Box:** Displays verbatim text extracted from the official issuer terms.
5. **Reverification Diff View:** When an offer is in `NEEDS_REVERIFICATION`, presents a side-by-side comparison between the previously approved terms and the proposed source terms.
6. **Action Bar:**
   - **Approve & Verify:** Promotes offer to `VERIFIED` and marks reviewer identity and timestamp.
   - **Edit Terms:** Allows inline correction of caps, variants, and expiry dates before approving.
   - **Reject Offer:** Prompts for mandatory rejection reason and quenches the offer.
   - **Flag Reverification:** Quarantines a verified offer if suspicious changes are noted.
   - **Audit Trail:** Chronological modal showing complete version history and provenance.

---

## 3. Operational Workflows

### 3.1. Standard Review & Approval
1. Administrator navigates to `/admin/offers` and selects the **Pending Review** filter tab.
2. Clicks the **Primary Source** link to verify authenticity.
3. Reviews the **Evidence Snippet** and **Confidence Score**.
4. If parameters are correct, clicks **Approve & Verify**.
5. The API sets `verification_status="VERIFIED"`, records `reviewed_by_id`, `reviewed_by_name`, and timestamp, and writes an `OfferAuditLog` record.
6. The offer immediately becomes eligible for user recommendation matching.

### 3.2. Editing Discrepant Terms
1. If the automated parser misclassified card names or omitted a cap, administrator clicks **Edit Terms**.
2. The modal form allows editing merchant, category, discount rates, min spends, caps, and specific card variants.
3. Check the **Promote directly to VERIFIED upon saving** box to verify immediately.
4. System increments `version`, applies changes, and writes an `EDITED` audit entry.

### 3.3. Rejection Workflow
1. If an offer is expired, unverified, or ambiguous, administrator clicks **Reject Offer**.
2. Enters mandatory rejection reason (e.g., "Merchant no longer accepts HDFC cards on this promotion").
3. System transitions status to `REJECTED`. The offer is permanently excluded from recommendation rankings.

### 3.4. Reverification Resolution Workflow
1. Administrator filters by **Needs Reverification**.
2. Inspects the side-by-side diff comparing `Previous Approved Version` with `Proposed Source Terms`.
3. If new terms are valid: clicks **Approve & Verify**.
4. If new terms are unfavorable or defunct: clicks **Reject Offer**.

