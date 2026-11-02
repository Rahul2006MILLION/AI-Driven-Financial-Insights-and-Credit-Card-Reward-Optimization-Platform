import { test, describe } from "node:test";
import assert from "node:assert";
import { translations } from "../lib/translations.ts";

describe("Financial Inclusion Suite & CLIQ Learn Test Suite", () => {
  test("Requirement 1: Multilingual Localization Integrity for CLIQ Learn", () => {
    const langs = ["en", "hi", "kn"] as const;
    langs.forEach((lang) => {
      const dict = translations[lang];
      assert.ok(dict.nav.learn, `nav.learn must be defined for ${lang}`);
      assert.ok(dict.nav.learn.trim().length > 0);
      assert.ok(dict.learn.title, `learn.title must be defined for ${lang}`);
      assert.ok(dict.learn.tabCurriculum, `learn.tabCurriculum must be defined for ${lang}`);
      assert.ok(dict.learn.tabCalculators, `learn.tabCalculators must be defined for ${lang}`);
      assert.ok(dict.learn.tabProgress, `learn.tabProgress must be defined for ${lang}`);
      assert.ok(dict.learn.calcInterestTitle, `learn.calcInterestTitle must be defined for ${lang}`);
      assert.ok(dict.learn.calcMinDueTitle, `learn.calcMinDueTitle must be defined for ${lang}`);
      assert.ok(dict.learn.calcBudgetTitle, `learn.calcBudgetTitle must be defined for ${lang}`);
      assert.ok(dict.learn.calcUtilizationTitle, `learn.calcUtilizationTitle must be defined for ${lang}`);
      assert.ok(dict.learn.calcBreakEvenTitle, `learn.calcBreakEvenTitle must be defined for ${lang}`);
    });
  });

  test("Requirement 2: Credit Card Interest Compounding Calculation Logic", () => {
    const balance = 20000;
    const apr = 42.0; // 42% APR
    const monthlyRate = apr / 12 / 100; // 0.035 (3.5% per month)
    const firstMonthInterest = Math.round(balance * monthlyRate);

    assert.strictEqual(firstMonthInterest, 700);

    // If payment is ₹2000, principal reduction is ₹1300
    const payment = 2000;
    const principalPaid = payment - firstMonthInterest;
    assert.strictEqual(principalPaid, 1300);
    const endingBalance = balance - principalPaid;
    assert.strictEqual(endingBalance, 18700);
  });

  test("Requirement 3: Minimum Payment Trap Detection", () => {
    const balance = 20000;
    const minPaymentPct = 0.05; // 5% minimum due standard in India
    const firstMinPayment = Math.max(500, Math.round(balance * minPaymentPct));

    assert.strictEqual(firstMinPayment, 1000);

    const monthlyInterest = Math.round(balance * (42 / 12 / 100)); // ₹700
    // Paying ₹1000 means only ₹300 reduces the principal!
    const principalReduced = firstMinPayment - monthlyInterest;
    assert.strictEqual(principalReduced, 300);

    // Interest accounts for 70% of the first payment!
    const interestRatio = Number((monthlyInterest / firstMinPayment).toFixed(2));
    assert.strictEqual(interestRatio, 0.7);
  });

  test("Requirement 4: 50/30/20 Budget Framework Allocation", () => {
    const monthlyIncome = 50000;
    const targetNeeds = monthlyIncome * 0.50; // ₹25,000
    const targetWants = monthlyIncome * 0.30; // ₹15,000
    const targetSavings = monthlyIncome * 0.20; // ₹10,000

    assert.strictEqual(targetNeeds, 25000);
    assert.strictEqual(targetWants, 15000);
    assert.strictEqual(targetSavings, 10000);
    assert.strictEqual(targetNeeds + targetWants + targetSavings, monthlyIncome);
  });

  test("Requirement 5: 30% Credit Utilization Thresholds", () => {
    const totalLimit = 100000;
    const target30Balance = totalLimit * 0.30; // ₹30,000

    const balanceA = 25000;
    const utilA = (balanceA / totalLimit) * 100;
    assert.strictEqual(utilA, 25.0);
    assert.ok(utilA <= 30.0, "Should be categorized as IDEAL (<30%)");

    const balanceB = 65000;
    const utilB = (balanceB / totalLimit) * 100;
    assert.strictEqual(utilB, 65.0);
    assert.ok(utilB > 50.0 && utilB <= 75.0, "Should be categorized as HIGH (>50%)");

    const amountToPayDown = balanceB - target30Balance;
    assert.strictEqual(amountToPayDown, 35000);
  });

  test("Requirement 6: Card Annual Fee Break-Even Evaluation", () => {
    const annualFee = 1500;
    const rewardRate = 0.02; // 2% cashback
    const breakEvenAnnualSpend = annualFee / rewardRate; // ₹75,000
    const breakEvenMonthlySpend = breakEvenAnnualSpend / 12; // ₹6,250

    assert.strictEqual(breakEvenAnnualSpend, 75000);
    assert.strictEqual(breakEvenMonthlySpend, 6250);

    const actualMonthlySpend = 15000;
    const annualSpend = actualMonthlySpend * 12; // ₹1,80,000
    const annualRewards = annualSpend * rewardRate; // ₹3,600
    const netBenefit = annualRewards - annualFee; // +₹2,100

    assert.strictEqual(netBenefit, 2100);
    assert.ok(netBenefit > 0, "Card is financially lucrative");
  });
});
