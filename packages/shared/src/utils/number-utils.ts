/** Number formatting and precision utilities */

/** Default decimal precision for financial values */
const FINANCIAL_PRECISION = 2;
const PERCENT_PRECISION = 2;

/** Round a number to specified decimal places */
export function round(value: number, decimals: number = FINANCIAL_PRECISION): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Format a number as USD */
export function formatUSD(value: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: FINANCIAL_PRECISION,
    maximumFractionDigits: FINANCIAL_PRECISION,
  });
  return formatter.format(value);
}

/** Format a number as percentage */
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${round(value, PERCENT_PRECISION)}%`;
}

/** Format a number with abbreviated units (1K, 1M, 1B) */
export function abbreviateNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(FINANCIAL_PRECISION);
}

/** Ensure a number is a valid finite number */
export function ensureFinite(value: number, fallback: number = 0): number {
  return Number.isFinite(value) ? value : fallback;
}
