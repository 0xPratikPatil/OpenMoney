/** Common ticker normalization utilities */

const TICKER_REGEX = /^[A-Z0-9]{1,10}$/;

/**
 * Normalize a ticker symbol to uppercase with basic validation.
 */
export function normalizeTicker(ticker: string): string {
  const normalized = ticker.trim().toUpperCase();
  if (!TICKER_REGEX.test(normalized)) {
    throw new Error(`Invalid ticker symbol: ${ticker}`);
  }
  return normalized;
}

/**
 * Check if ticker symbol format is valid.
 */
export function isValidTicker(ticker: string): boolean {
  return TICKER_REGEX.test(ticker.trim().toUpperCase());
}

/**
 * Known US market suffixes for different exchanges.
 */
export function isUSEquity(ticker: string): boolean {
  const normalized = ticker.trim().toUpperCase();
  return !normalized.includes('-') && !normalized.includes('.');
}

/**
 * Parse a broker-specific ticker format into standard ticker.
 */
export function parseBrokerTicker(raw: string): string {
  // Remove common broker suffixes
  return raw.replace(/\.[A-Z]{2,}$/, '').trim();
}
