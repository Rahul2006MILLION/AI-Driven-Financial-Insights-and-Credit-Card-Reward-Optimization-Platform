# CLIQ Reward Optimization Engine

## 1. Engine Core Philosophy

Financial calculations must **NEVER** be delegated to probabilistic Large Language Models (LLMs). LLMs are susceptible to floating-point rounding quirks, hallucinated bonus percentages, and non-deterministic answers.

The CLIQ Reward Optimization Engine is built with:
1. **Strict Determinism:** Pure Python mathematical logic.
2. **Arbitrary Precision:** All monetary amounts, point valuations, and reward multipliers are computed using Python's standard `decimal.Decimal` module with explicit rounding modes (`ROUND_HALF_UP`).
3. **Traceability:** Every evaluation produces an immutable `CalculationBreakdown` step record explaining exactly why a rate was chosen, how caps were applied, or why exclusions were triggered.

---

## 2. Mathematical Model & Algorithm

For any given transaction with:
- Transaction Amount: $A \in \mathbb{R}^+$ ($A \ge 0$)
- Category: $C$
- Merchant: $M$

For each active credit card $K_i$ in the user's registered portfolio:

### Step 1: Minimum Spend Eligibility
If $A < \text{min\_transaction\_amount}(K_i)$, then:
$$\text{eligible} = \text{False}, \quad \text{monetary\_reward} = 0$$

### Step 2: Specific Merchant Rule Matching
Scan rules for an explicit match on merchant name pattern $M$:
- If an exact or pattern match exists and `is_excluded == True`:
  $$\text{monetary\_reward} = 0, \quad \text{status} = \text{EXCLUDED}$$
- Else if a match exists:
  $$\text{rate} = \text{rule.reward\_rate\_percentage}$$

### Step 3: Category Rule Matching
If no merchant-specific rule was triggered, evaluate category $C$:
- If a category rule exists and `is_excluded == True`:
  $$\text{monetary\_reward} = 0, \quad \text{status} = \text{EXCLUDED}$$
  *(e.g. Fuel surcharge waiver exclusion, Government payment exclusion, Wallet load exclusion)*
- Else if category rule matches:
  $$\text{rate} = \text{rule.reward\_rate\_percentage}$$

### Step 4: Base Fallback Rate
If neither merchant nor category has an accelerated or excluded rule:
$$\text{rate} = \text{base\_rate}(K_i)$$

### Step 5: Raw Reward Calculation
- If `reward_type == 'CASHBACK'`:
  $$\text{raw\_reward} = A \times \left(\frac{\text{rate}}{100}\right)$$
- If `reward_type == 'REWARD_POINTS'` or `'MILES'`:
  $$\text{points} = \lfloor A \times \left(\frac{\text{rate}}{100}\right) \rfloor$$
  $$\text{raw\_reward} = \text{points} \times \text{point\_monetary\_value}$$

### Step 6: Per-Transaction Cap Enforcement
If $\text{max\_reward\_per\_transaction}$ is defined:
$$\text{capped\_reward} = \min(\text{raw\_reward}, \text{max\_reward\_per\_transaction})$$

### Step 7: Monthly Category / Global Cap Enforcement
Let $S_{\text{month}}$ be the user's cumulative rewards earned on card $K_i$ in the current billing cycle:
$$\text{available\_cap} = \max(0, \text{monthly\_cap} - S_{\text{month}})$$
$$\text{final\_reward} = \min(\text{capped\_reward}, \text{available\_cap})$$

### Step 8: Ranking & Card Recommendation
All eligible cards are ranked descending by $\text{final\_reward}$. If two cards yield the exact same reward, the tie is broken by:
1. Higher effective cashback percentage.
2. Lower annual fee.
3. Card seniority (oldest added card).

---

## 3. Concrete Calculation Examples

### Example 1: Accelerated Online Food Delivery
- **Transaction:** ₹1,500 at "Swiggy" (Category: `dining`)
- **Card A (HDFC Millennia):**
  - Category `dining` on Swiggy has 5% cashback rule.
  - Calculation: $\text{Decimal}('1500') \times \text{Decimal}('0.05') = \text{₹75.00}$
  - Monthly cap: ₹1,000 (Current month spend reward: ₹250). Available cap: ₹750.
  - Final reward: **₹75.00** (5.0% yield)
- **Card B (Axis Ace):**
  - Dining category has base 2% cashback.
  - Calculation: $\text{Decimal}('1500') \times \text{Decimal}('0.02') = \text{₹30.00}$
  - Final reward: **₹30.00** (2.0% yield)
- **Recommendation:** **Card A (HDFC Millennia)** yielding ₹75.00 (+₹45.00 delta over Card B).

### Example 2: Fuel Exclusion Rule
- **Transaction:** ₹4,000 at "HPCL Petrol Pump" (Category: `fuel`)
- **Card C (Standard Cashback Card):**
  - Rule: `category_id == 'fuel'`, `is_excluded == True`, reason: "Fuel spends do not earn cashback".
  - Final reward: **₹0.00** (Exclusion flagged).
- **Card D (BPCL Co-Branded Card):**
  - Rule: 4.25% value back on BPCL pumps, 1% surcharge waiver on transactions between ₹400 and ₹4,000.
  - Final reward: **₹170.00** value back + **₹40.00** surcharge waiver = **₹210.00**.
- **Recommendation:** **Card D**.
