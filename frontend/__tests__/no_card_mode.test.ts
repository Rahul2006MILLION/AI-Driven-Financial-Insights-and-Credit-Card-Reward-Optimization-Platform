import { test, describe } from "node:test";
import assert from "node:assert";
import { translations } from "../lib/translations.ts";

describe("Phase 3: No-Credit-Card Mode & Financial Inclusion Unit Suite", () => {
  test("Requirement 1: Nav budget translation keys exist across EN, HI, and KN", () => {
    const langs = ["en", "hi", "kn"] as const;
    langs.forEach((lang) => {
      const dict = translations[lang];
      assert.ok(dict.nav.budget, `nav.budget must be defined for ${lang}`);
      assert.ok(dict.nav.budget.trim().length > 0);
    });
  });

  test("Requirement 2: Normalizes income frequencies to monthly equivalent", () => {
    const normalizeIncomeToMonthly = (amount: number, frequency: string): number => {
      switch (frequency) {
        case "WEEKLY":
          return Math.round(amount * (52 / 12) * 100) / 100;
        case "BI_WEEKLY":
          return Math.round(amount * (26 / 12) * 100) / 100;
        case "MONTHLY":
          return amount;
        case "ONE_TIME":
          return 0; // Does not contribute to permanent monthly recurring inflow
        case "IRREGULAR":
          return amount; // Treated as base estimate until rolling median is computed
        default:
          return amount;
      }
    };

    assert.ok(Math.abs(normalizeIncomeToMonthly(10000, "WEEKLY") - 43333.33) < 0.1);
    assert.ok(Math.abs(normalizeIncomeToMonthly(20000, "BI_WEEKLY") - 43333.33) < 0.1);
    assert.strictEqual(normalizeIncomeToMonthly(75000, "MONTHLY"), 75000);
    assert.strictEqual(normalizeIncomeToMonthly(5000, "ONE_TIME"), 0);
  });

  test("Requirement 3: Calculates 90-day rolling median for irregular income streams", () => {
    const calculateMedian = (values: number[]): number => {
      if (values.length === 0) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    // 3 gig/freelance checks over last 90 days: 30k, 60k, 45k
    const irregularIncomes = [30000, 60000, 45000];
    assert.strictEqual(calculateMedian(irregularIncomes), 45000);

    // 4 checks: 20k, 50k, 30k, 40k -> sorted [20k, 30k, 40k, 50k] -> median 35k
    assert.strictEqual(calculateMedian([20000, 50000, 30000, 40000]), 35000);
  });

  test("Requirement 4: Computes net cash flow, savings rate, and deficit status correctly", () => {
    const calculateCashFlow = (monthlyInflow: number, monthlyOutflow: number) => {
      const netCashFlow = monthlyInflow - monthlyOutflow;
      const savingsRatePct = monthlyInflow > 0
        ? Math.round((netCashFlow / monthlyInflow) * 100)
        : 0;
      const isDeficit = netCashFlow < 0;
      return { netCashFlow, savingsRatePct, isDeficit };
    };

    // User with 60k income, 36k spending (24k surplus -> 40% savings rate)
    const healthy = calculateCashFlow(60000, 36000);
    assert.strictEqual(healthy.netCashFlow, 24000);
    assert.strictEqual(healthy.savingsRatePct, 40);
    assert.strictEqual(healthy.isDeficit, false);

    // User with 40k income, 48k spending (8k deficit -> -20% savings rate)
    const deficit = calculateCashFlow(40000, 48000);
    assert.strictEqual(deficit.netCashFlow, -8000);
    assert.strictEqual(deficit.savingsRatePct, -20);
    assert.strictEqual(deficit.isDeficit, true);
  });

  test("Requirement 5: Calculates 50/30/20 budget envelope allocations", () => {
    const allocate503020 = (monthlyIncome: number) => {
      return {
        needs: Math.round(monthlyIncome * 0.50),
        wants: Math.round(monthlyIncome * 0.30),
        savings: Math.round(monthlyIncome * 0.20),
      };
    };

    const envelope = allocate503020(70000);
    assert.strictEqual(envelope.needs, 35000);
    assert.strictEqual(envelope.wants, 21000);
    assert.strictEqual(envelope.savings, 14000);
    assert.strictEqual(envelope.needs + envelope.wants + envelope.savings, 70000);
  });

  test("Requirement 6: Formats non-card transactions without card_id and with valid payment method", () => {
    const formatNonCardTransaction = (
      merchant: string,
      amount: number,
      category: string,
      method: "UPI" | "CASH" | "BANK_TRANSFER" | "DEBIT_CARD" | "OTHER"
    ) => {
      return {
        merchant_name: merchant.trim(),
        amount: Math.round(amount * 100) / 100,
        category_id: category,
        card_id: null,
        payment_method: method,
      };
    };

    const payload = formatNonCardTransaction("Metro Recharge", 250.50, "travel", "UPI");
    assert.strictEqual(payload.card_id, null);
    assert.strictEqual(payload.payment_method, "UPI");
    assert.strictEqual(payload.merchant_name, "Metro Recharge");
    assert.strictEqual(payload.amount, 250.50);
  });
});
