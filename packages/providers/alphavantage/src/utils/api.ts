import { RateLimitError, UnauthorizedError } from "@openmoney/provider-core";

const AV_BASE_URL = "https://www.alphavantage.co/query";
const MIN_INTERVAL_MS = 12_000; // 12 seconds — 5 calls/minute on free tier
let lastCallTime = 0;

/**
 * Fetch data from Alpha Vantage API with rate limit enforcement.
 * Free tier allows 5 calls per minute; premium tiers have higher limits.
 */
export async function avFetch<T>(
  functionName: string,
  apiKey: string,
  extraParams?: Record<string, string>,
): Promise<T> {
  const now = Date.now();
  const elapsed = now - lastCallTime;

  if (elapsed < MIN_INTERVAL_MS) {
    const waitTime = MIN_INTERVAL_MS - elapsed;
    throw new RateLimitError(
      `Alpha Vantage rate limit: wait ${Math.ceil(waitTime / 1000)}s between calls`,
      Math.ceil(waitTime / 1000),
    );
  }

  const params = new URLSearchParams({
    function: functionName,
    apikey: apiKey,
    ...extraParams,
  });

  const url = `${AV_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedError("Invalid or missing Alpha Vantage API key");
    }
    throw new Error(
      `Alpha Vantage HTTP ${response.status}: ${response.statusText}`,
    );
  }

  const data = (await response.json()) as Record<string, unknown>;

  // Alpha Vantage returns error messages in the JSON body
  if (typeof data["Error Message"] === "string") {
    throw new Error(`Alpha Vantage error: ${data["Error Message"]}`);
  }

  // Rate limit note from Alpha Vantage
  if (typeof data["Note"] === "string") {
    lastCallTime = 0; // Reset so next call waits the full interval
    throw new RateLimitError(`Alpha Vantage rate limit: ${data["Note"] as string}`, 60);
  }

  lastCallTime = now;

  return data as T;
}

/**
 * Strip numeric prefixes from Alpha Vantage field names.
 * "01. symbol" → "symbol", "02. open" → "open", "10. change percent" → "change percent"
 */
export function stripNumericPrefix(key: string): string {
  return key.replace(/^\d{1,2}[a-z]?\.\s*/, "");
}

/**
 * Parse a string value from Alpha Vantage as a number, returning null for invalid values.
 * Handles $ and % symbols that Alpha Vantage sometimes includes.
 */
export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,%]/g, "").trim();
    if (cleaned === "" || cleaned === "None") return null;
    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Parse a string value from Alpha Vantage as a string, with null handling.
 */
export function parseString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" || trimmed === "None" ? null : trimmed;
  }
  return value == null ? null : String(value);
}
