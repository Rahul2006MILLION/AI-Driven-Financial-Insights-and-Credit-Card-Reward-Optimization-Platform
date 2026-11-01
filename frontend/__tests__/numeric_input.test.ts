import { describe, it } from "node:test";
import assert from "node:assert";
import { sanitizeNumericValue } from "../lib/numericUtils.ts";

describe("CLIQ Application-Wide Numeric Input & Leading Zero Fix Suite", () => {
  it("Requirement 1: Empty initial state renders empty string, never forcing zero", () => {
    const rawEmpty = "";
    assert.strictEqual(sanitizeNumericValue(rawEmpty), "");

    // Simulating component value resolution for empty/null/undefined
    const formatValue = (v: number | string | null | undefined): string => {
      if (v === null || v === undefined) return "";
      return sanitizeNumericValue(String(v));
    };

    assert.strictEqual(formatValue(null), "");
    assert.strictEqual(formatValue(undefined), "");
    assert.strictEqual(formatValue(""), "");
  });

  it("Requirement 2: Typing a single digit (e.g. 6) results in '6', never '06'", () => {
    // When input had "0" and user types "6" directly: browser event value is "06"
    const inputWithZeroPlusSix = "06";
    const sanitized = sanitizeNumericValue(inputWithZeroPlusSix);
    assert.strictEqual(sanitized, "6", "Leading zero must be stripped when a non-zero digit is typed");

    // Multiple leading zeros e.g. "007" -> "7"
    assert.strictEqual(sanitizeNumericValue("007"), "7");
    assert.strictEqual(sanitizeNumericValue("01"), "1");
    assert.strictEqual(sanitizeNumericValue("09"), "9");
  });

  it("Requirement 3: Typing multiple digits (e.g. 650) results in '650'", () => {
    // Progressive keystrokes starting from "0"
    let current = "0";
    // Keystroke 1: '6' typed after '0' -> browser gives '06'
    current = sanitizeNumericValue("06");
    assert.strictEqual(current, "6");

    // Keystroke 2: '5' typed -> browser gives '65'
    current = sanitizeNumericValue(current + "5");
    assert.strictEqual(current, "65");

    // Keystroke 3: '0' typed -> browser gives '650'
    current = sanitizeNumericValue(current + "0");
    assert.strictEqual(current, "650");
  });

  it("Requirement 4: Clearing the complete value results in '', never forcing '0'", () => {
    // User has value "650" and presses Backspace until empty
    let val = "650";
    val = sanitizeNumericValue("65");
    assert.strictEqual(val, "65");

    val = sanitizeNumericValue("6");
    assert.strictEqual(val, "6");

    // Last backspace deletes the single digit -> raw is ""
    val = sanitizeNumericValue("");
    assert.strictEqual(val, "", "Clearing must return empty string, never reverting to 0");

    // Backspacing a standalone "0"
    const backspacedZero = sanitizeNumericValue("");
    assert.strictEqual(backspacedZero, "");
  });

  it("Requirement 5: Decimal entry ('12.', '12.5', '0.5') works smoothly without stripping trailing dot", () => {
    // Typing single '.' into empty field converts cleanly to '0.'
    assert.strictEqual(sanitizeNumericValue("."), "0.");

    // Typing '0.' directly
    assert.strictEqual(sanitizeNumericValue("0."), "0.");

    // Typing '0.5'
    assert.strictEqual(sanitizeNumericValue("0.5"), "0.5");

    // Typing '0.05'
    assert.strictEqual(sanitizeNumericValue("0.05"), "0.05");

    // Normalizing accidental '00.5' to '0.5'
    assert.strictEqual(sanitizeNumericValue("00.5"), "0.5");

    // Typing '12.' (intermediate typing state must NOT be stripped or converted to 12)
    const trailingDot = sanitizeNumericValue("12.");
    assert.strictEqual(trailingDot, "12.", "Trailing decimal point must be preserved during active user typing");

    // Typing '12.5'
    const decimalValue = sanitizeNumericValue("12.5");
    assert.strictEqual(decimalValue, "12.5");

    // Preventing multiple decimal points: '12.5.6' -> '12.56'
    assert.strictEqual(sanitizeNumericValue("12.5.6"), "12.56");
  });

  it("Requirement 6: Replacing existing value (selecting all and typing)", () => {
    // Existing input was "2000", user selects all and types "6"
    const replaced = sanitizeNumericValue("6");
    assert.strictEqual(replaced, "6");

    // Existing input was "0", user selects all and types "6"
    const replacedZero = sanitizeNumericValue("6");
    assert.strictEqual(replacedZero, "6");
  });

  it("Requirement 7: Form submission boundary validation and conversion", () => {
    // 1. Required field (e.g. Spend Amount in Optimizer / Manual Transaction)
    const validateRequiredAmount = (val: string | number | null | undefined): { valid: boolean; num?: number; error?: string } => {
      if (val === "" || val === null || val === undefined) {
        return { valid: false, error: "Amount is required" };
      }
      const num = typeof val === "number" ? val : parseFloat(val);
      if (isNaN(num) || num <= 0) {
        return { valid: false, error: "Amount must be greater than 0" };
      }
      return { valid: true, num };
    };

    assert.strictEqual(validateRequiredAmount("").valid, false);
    assert.strictEqual(validateRequiredAmount("0").valid, false);
    assert.strictEqual(validateRequiredAmount("-10").valid, false);
    assert.strictEqual(validateRequiredAmount("6").valid, true);
    assert.strictEqual(validateRequiredAmount("6").num, 6);
    assert.strictEqual(validateRequiredAmount("650.50").num, 650.5);

    // 2. Optional field (e.g. renewal waiver spend, monthly cap, max discount)
    const serializeOptionalSpend = (val: string | number | null | undefined): number | undefined => {
      if (val === "" || val === null || val === undefined) {
        return undefined;
      }
      const num = typeof val === "number" ? val : parseFloat(val);
      return isNaN(num) || num === 0 ? undefined : num;
    };

    assert.strictEqual(serializeOptionalSpend(""), undefined);
    assert.strictEqual(serializeOptionalSpend(null), undefined);
    assert.strictEqual(serializeOptionalSpend("0"), undefined);
    assert.strictEqual(serializeOptionalSpend("50000"), 50000);
    assert.strictEqual(serializeOptionalSpend(100000), 100000);

    // 3. Fee with 0 as valid zero-cost fee
    const serializeFee = (val: string | number | null | undefined): number => {
      if (val === "" || val === null || val === undefined) {
        return 0;
      }
      const num = typeof val === "number" ? val : parseFloat(val);
      return isNaN(num) ? 0 : num;
    };

    assert.strictEqual(serializeFee(""), 0);
    assert.strictEqual(serializeFee("0"), 0);
    assert.strictEqual(serializeFee("500"), 500);
    assert.strictEqual(serializeFee(1000), 1000);
  });

  it("Requirement 8: Non-decimal and non-negative constraints", () => {
    // Non-decimal mode (e.g. Billing Cycle Day 1-31)
    const integerOnly = sanitizeNumericValue("15.5", { allowDecimal: false });
    assert.strictEqual(integerOnly, "155", "Decimals must be stripped when allowDecimal is false");

    // Non-negative mode (default)
    const noNegative = sanitizeNumericValue("-500", { allowNegative: false });
    assert.strictEqual(noNegative, "500", "Minus sign must be stripped when allowNegative is false");

    // Negative allowed
    const allowNegative = sanitizeNumericValue("-500", { allowNegative: true });
    assert.strictEqual(allowNegative, "-500");
  });
});
