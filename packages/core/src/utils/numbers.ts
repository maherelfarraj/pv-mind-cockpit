const NEEDS_INPUT = 'Needs Input';
const DEFAULT_CURRENCY = 'USD';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeCurrency(currency?: string): string {
  const value = currency?.trim().toUpperCase();
  return value ? value : DEFAULT_CURRENCY;
}

function formatValue(
  value: number | null | undefined,
  formatter: () => string,
): string {
  if (!isFiniteNumber(value)) {
    return NEEDS_INPUT;
  }

  return formatter();
}

export function safeNumber(value: unknown, fallback = 0): number {
  const safeFallback = isFiniteNumber(fallback) ? fallback : 0;

  if (isFiniteNumber(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return safeFallback;
}

export function safeDiv(
  numerator: number,
  denominator: number,
  fallback = 0,
): number {
  const safeFallback = safeNumber(fallback, 0);

  if (!isFiniteNumber(numerator) || !isFiniteNumber(denominator) || denominator === 0) {
    return safeFallback;
  }

  const result = numerator / denominator;
  return Number.isFinite(result) ? result : safeFallback;
}

export function formatMW(value: number | null | undefined): string {
  return formatValue(
    value,
    () =>
      `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)} MW`,
  );
}

export function formatMWh(value: number | null | undefined): string {
  return formatValue(
    value,
    () =>
      `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)} MWh`,
  );
}

export function formatKWhKwp(value: number | null | undefined): string {
  return formatValue(
    value,
    () =>
      `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)} kWh/kWp`,
  );
}

export function formatCurrency(
  value: number | null | undefined,
  currency = DEFAULT_CURRENCY,
): string {
  return formatValue(value, () => {
    const normalizedCurrency = normalizeCurrency(currency);

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: DEFAULT_CURRENCY,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
  });
}

export function formatPercent(value: number | null | undefined): string {
  return formatValue(
    value,
    () =>
      `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)}%`,
  );
}
