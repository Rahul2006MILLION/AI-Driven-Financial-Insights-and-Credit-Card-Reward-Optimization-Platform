"use client";

import React, { useState, useEffect, useRef } from "react";
import { sanitizeNumericValue, SanitizeOptions } from "@/lib/numericUtils";

export { sanitizeNumericValue };
export type { SanitizeOptions };

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | string | null | undefined;
  onChange?: (value: string, numValue: number | null, event: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string, numValue: number | null) => void;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  emptyAsZeroOnBlur?: boolean;
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      allowDecimal = true,
      allowNegative = false,
      emptyAsZeroOnBlur = false,
      onBlur,
      onFocus,
      className,
      placeholder,
      type = "text",
      inputMode,
      ...restProps
    },
    ref
  ) => {
    const formatValue = (v: number | string | null | undefined): string => {
      if (v === null || v === undefined) return "";
      const str = String(v);
      return sanitizeNumericValue(str, { allowDecimal, allowNegative });
    };

    const [localValue, setLocalValue] = useState<string>(() => formatValue(value));
    const isFocusedRef = useRef(false);

    // Sync external value updates (e.g. form reset, preset selections)
    useEffect(() => {
      const formatted = formatValue(value);
      if (!isFocusedRef.current) {
        setLocalValue(formatted);
      } else {
        // While user is focused, do not overwrite intermediate typing like "12."
        if (formatted !== "" && localValue !== "") {
          const numExternal = Number(formatted);
          const numLocal = Number(localValue);
          if (!isNaN(numExternal) && !isNaN(numLocal) && numExternal !== numLocal) {
            setLocalValue(formatted);
          }
        } else if (formatted !== localValue && (formatted === "" || localValue === "")) {
          setLocalValue(formatted);
        }
      }
    }, [value, allowDecimal, allowNegative]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const sanitized = sanitizeNumericValue(raw, { allowDecimal, allowNegative });
      setLocalValue(sanitized);

      const numVal =
        sanitized === "" || sanitized === "-" || sanitized === "." || sanitized === "0."
          ? null
          : Number(sanitized);

      if (onChange) {
        onChange(sanitized, numVal, e);
      }
      if (onValueChange) {
        onValueChange(sanitized, numVal);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true;
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      let finalVal = localValue;

      // Clean trailing decimal point on blur: "12." -> "12"
      if (finalVal.endsWith(".")) {
        finalVal = finalVal.slice(0, -1);
      }

      if (finalVal === "" && emptyAsZeroOnBlur) {
        finalVal = "0";
      }

      if (finalVal !== localValue) {
        setLocalValue(finalVal);
        const numVal = finalVal === "" ? null : Number(finalVal);
        if (onChange) {
          onChange(finalVal, numVal, e as any);
        }
        if (onValueChange) {
          onValueChange(finalVal, numVal);
        }
      }

      if (onBlur) onBlur(e);
    };

    return (
      <input
        ref={ref}
        type={type}
        inputMode={inputMode || (allowDecimal ? "decimal" : "numeric")}
        autoComplete="off"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        {...restProps}
      />
    );
  }
);

NumericInput.displayName = "NumericInput";

export default NumericInput;
