export interface SanitizeOptions {
  allowDecimal?: boolean;
  allowNegative?: boolean;
}

/**
 * Normalizes and sanitizes a numeric string:
 * - Completely empty string remains ""
 * - Preserves "0", "0.", and "0.05"
 * - Normalizes leading zeros before integers: "06" -> "6", "00" -> "0", "007" -> "7"
 * - Preserves active decimal typing: "12." is preserved
 * - Normalizes "00.5" -> "0.5"
 * - Typing "." into empty input becomes "0."
 * - Strips invalid characters (preserving only digits, at most one decimal point, and optional minus)
 */
export function sanitizeNumericValue(
  raw: string,
  options: SanitizeOptions = {}
): string {
  const { allowDecimal = true, allowNegative = false } = options;

  if (raw === "") return "";

  // If user typed only ".", convert to "0." for clean decimal entry
  if (allowDecimal && raw === ".") {
    return "0.";
  }

  let cleaned = raw;

  // Filter allowed characters
  if (!allowDecimal && !allowNegative) {
    cleaned = cleaned.replace(/[^\d]/g, "");
  } else if (!allowDecimal && allowNegative) {
    cleaned = cleaned.replace(/[^\d-]/g, "");
  } else if (allowDecimal && !allowNegative) {
    cleaned = cleaned.replace(/[^\d.]/g, "");
  } else {
    cleaned = cleaned.replace(/[^\d.-]/g, "");
  }

  if (cleaned === "") return "";

  // Handle minus sign
  let isNegative = false;
  if (allowNegative && cleaned.startsWith("-")) {
    isNegative = true;
    cleaned = cleaned.slice(1);
  }
  cleaned = cleaned.replace(/-/g, "");

  // Handle decimals: only allow the first decimal point
  if (allowDecimal) {
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
  } else {
    cleaned = cleaned.replace(/\./g, "");
  }

  if (cleaned === "") return "";

  // Strip leading zeroes before digits (e.g. "06" -> "6", "00" -> "0", but keep "0.", "0.05", "0")
  if (cleaned.length > 1 && cleaned.startsWith("0")) {
    if (cleaned[1] === ".") {
      // Keep "0." or "0.x"
    } else if (/^0+\./.test(cleaned)) {
      // "00.5" -> "0.5"
      cleaned = cleaned.replace(/^0+/, "0");
    } else {
      // "06" -> "6", "00" -> "0", "007" -> "7"
      cleaned = cleaned.replace(/^0+(?=\d)/, "");
      if (cleaned === "") cleaned = "0";
    }
  }

  return (isNegative ? "-" : "") + cleaned;
}

