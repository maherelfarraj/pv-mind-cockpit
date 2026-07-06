/**
 * Safe math utilities — ensure the UI never renders NaN or Infinity.
 * All calculation functions return `number | null`.
 * Null means "result cannot be computed (missing or invalid input)".
 * Render null as "Needs Input" in the UI layer.
 */

export const NEEDS_INPUT = 'Needs Input' as const;
export type SafeNumber = number | null;

/**
 * Returns the number if finite and not NaN, otherwise null.
 */
export function safeNumber(value: unknown): SafeNumber {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (isNaN(n) || !isFinite(n)) return null;
  return n;
}

/**
 * Returns numerator / denominator, or null if denominator is zero or either operand is invalid.
 */
export function safeDivide(numerator: number, denominator: number): SafeNumber {
  const n = safeNumber(numerator);
  const d = safeNumber(denominator);
  if (n === null || d === null || d === 0) return null;
  return safeNumber(n / d);
}

/**
 * Returns (value / total) * 100 as a percentage, or null if invalid.
 */
export function safePercent(value: number, total: number): SafeNumber {
  const pct = safeDivide(value, total);
  if (pct === null) return null;
  return safeNumber(pct * 100);
}

/**
 * Returns the product of all operands, or null if any is invalid.
 */
export function safeProduct(...operands: number[]): SafeNumber {
  if (operands.length === 0) return null;
  let result = 1;
  for (const op of operands) {
    const n = safeNumber(op);
    if (n === null) return null;
    result *= n;
  }
  return safeNumber(result);
}

/**
 * Returns the sum of all operands, or null if any is invalid.
 */
export function safeSum(...operands: number[]): SafeNumber {
  if (operands.length === 0) return null;
  let result = 0;
  for (const op of operands) {
    const n = safeNumber(op);
    if (n === null) return null;
    result += n;
  }
  return safeNumber(result);
}

/**
 * Checks that all provided values are valid (non-null safeNumbers > 0).
 * Used to gate calculations that require all inputs to be positive.
 */
export function allPositive(...values: Array<number | null | undefined>): boolean {
  return values.every((v) => {
    const n = safeNumber(v as number);
    return n !== null && n > 0;
  });
}

/**
 * Format a safe number for display. Returns NEEDS_INPUT if null.
 */
export function formatValue(
  value: SafeNumber,
  unit = '',
  decimals = 2,
): string {
  if (value === null) return NEEDS_INPUT;
  const formatted = value.toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format currency value (USD by default).
 */
export function formatCurrency(
  value: SafeNumber,
  currency = 'USD',
  locale = 'en-US',
): string {
  if (value === null) return NEEDS_INPUT;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
