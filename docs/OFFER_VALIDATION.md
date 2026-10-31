# CLIQ — OFFER VALIDATION & VERIFICATION RULES
## Criteria, Rules, and Quality Assurance for Promotional Deal Approval

---

## 1. Automated Extraction Validation Suite

Before any discovered offer can be staged into `PENDING_REVIEW`, the automated normalizer validates the extracted payload against structural rules:

1. **Merchant Normalization:**
   - Case-insensitive string trim (`Swiggy`, `Amazon`, `MakeMyTrip`, `Blinkit`, `Croma`).
   - Rejects non-alphanumeric special character injections.
2. **Discount Type & Boundary Rules:**
   - Type must be strictly `PERCENTAGE` or `FLAT_AMOUNT`.
   - If `PERCENTAGE`: $0.01\% \le \text{discount\_value} \le 100.00\%$.
   - If `FLAT_AMOUNT`: $\text{discount\_value} \le \text{min\_transaction\_value}$ (unless 100% free trial promo).
3. **Cap Consistency Check:**
   - If $\text{discount\_type} = \text{PERCENTAGE}$, $\text{max\_discount\_amount}$ must be a positive decimal or explicitly marked `None` (unlimited).
   - If $\text{discount\_type} = \text{FLAT\_AMOUNT}$, $\text{max\_discount\_amount}$ is automatically set equal to $\text{discount\_value}$.
4. **Temporal Consistency:**
   - $\text{valid\_from} < \text{valid\_to}$.
   - $\text{valid\_to} > \text{now()}$. Expired offers are dropped immediately upon discovery.
5. **Payment Channel Constraints:**
   - Must be `ONLINE`, `OFFLINE`, or `BOTH`.
   - In-store POS swipe promotions (e.g. Croma PineLabs) must be classified as `OFFLINE`.

---

## 2. Canonical Content Hashing & Change Detection

To achieve deterministic duplicate detection and detect silent source alterations, CLIQ computes a canonical SHA-256 hash:

$$\text{Canonical String} = \text{merchant} \mid \text{category} \mid \text{discount\_type} \mid \text{discount\_value} \mid \text{min\_spend} \mid \text{max\_discount} \mid \text{promo\_code} \mid \text{bank} \mid \text{network}$$

$$\text{content\_hash} = \text{SHA256}(\text{Canonical String})$$

### Change Detection Matrix
| Existing State | Ingestion Match | Term Changes Detected? | Resulting Action |
| :--- | :--- | :---: | :--- |
| `VERIFIED` | Match found | **Yes** (e.g. Cap lowered from ₹1,000 to ₹500) | 1. Snapshot previous state to `previous_version_json`<br/>2. Increment `version`<br/>3. Quarantine to `NEEDS_REVERIFICATION`<br/>4. Exclude from recommendation engine |
| `VERIFIED` | Match found | **No** (terms identical) | 1. Update `last_verified_timestamp` = now<br/>2. Increment `unchanged_count` |
| `PENDING_REVIEW` | Match found | **Yes** or **No** | 1. Refresh extraction confidence & evidence<br/>2. Maintain `PENDING_REVIEW` |
| None | No match found | New Record | 1. Insert into `card_offers` with `status=PENDING_REVIEW`<br/>2. Log `OfferAuditLog(action="DISCOVERED")` |

---

## 3. Human Administrator Verification Checklist

Administrators must verify each field before clicking **Approve & Verify**:

- [ ] **Primary Source Verification:** Inspect the clickable `source_url`. Ensure it belongs to the official issuer (e.g. `hdfcbank.com`) or merchant (`swiggy.com`).
- [ ] **Source Evidence Fidelity:** Verify that the verbatim excerpt in the Evidence Snippet box matches the actual terms published by the bank.
- [ ] **Eligible Card Variants:** Ensure premium variants (e.g., Regalia, Infinia, Burgundy) are distinguished from general bank-wide retail cards.
- [ ] **Minimum Spend & Maximum Discount Caps:** Confirm whether taxes, delivery fees, or packaging fees are included in the minimum spend threshold.
- [ ] **Coupon Code Activation Requirements:** Note whether the coupon must be manually entered or if it is auto-applied on payment card selection.
- [ ] **Transaction Channel:** Ensure online-only vouchers are not matched with offline retail point-of-sale swipes.

