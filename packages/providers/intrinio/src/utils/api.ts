import { UnauthorizedError, RateLimitError } from "@openmoney/provider-core";

const INTRINIO_BASE = "https://api-v2.intrinio.com";

/**
 * Build query params with API key for Intrinio requests.
 */
function buildParams(
  credentials: Record<string, string>,
  extra?: Record<string, string | number | undefined>,
): URLSearchParams {
  const apiKey = credentials["intrinio_api_key"];
  if (!apiKey) throw new UnauthorizedError("Intrinio API key is required");

  const params = new URLSearchParams();
  params.set("api_key", apiKey);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined) params.set(key, String(value));
    }
  }
  return params;
}

/**
 * Generic fetch helper for Intrinio with error handling.
 */
export async function intrinioFetch<T>(
  path: string,
  credentials: Record<string, string>,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const qs = buildParams(credentials, params);
  const url = `${INTRINIO_BASE}${path}?${qs.toString()}`;

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Intrinio rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid Intrinio API key");
    throw new Error(`Intrinio API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch real-time price for a security.
 * GET /securities/{symbol}/prices/realtime
 */
export async function fetchRealtimePrice(
  symbol: string,
  credentials: Record<string, string>,
): Promise<any> {
  return intrinioFetch<any>(
    `/securities/${encodeURIComponent(symbol)}/prices/realtime`,
    credentials,
  );
}

/**
 * Fetch historical prices for a security.
 * GET /securities/{symbol}/prices
 */
export async function fetchHistoricalPrices(
  symbol: string,
  credentials: Record<string, string>,
  startDate?: string,
  endDate?: string,
  frequency?: string,
): Promise<any[]> {
  const data = await intrinioFetch<any>(
    `/securities/${encodeURIComponent(symbol)}/prices`,
    credentials,
    { start_date: startDate, end_date: endDate, frequency: frequency ?? "daily" },
  );
  return data?.stock_prices ?? [];
}

/**
 * Fetch company profile.
 * GET /companies/{symbol}
 */
export async function fetchCompanyProfile(
  symbol: string,
  credentials: Record<string, string>,
): Promise<any> {
  return intrinioFetch<any>(
    `/companies/${encodeURIComponent(symbol)}`,
    credentials,
  );
}

/**
 * Search securities.
 * GET /securities/search
 */
export async function searchSecurities(
  query: string,
  credentials: Record<string, string>,
): Promise<any[]> {
  const data = await intrinioFetch<any>(
    "/securities/search",
    credentials,
    { query },
  );
  return data?.securities ?? [];
}

/**
 * Fetch historical data for a specific financial item.
 * GET /companies/{symbol}/historical_data?item={item}
 */
export async function fetchHistoricalData(
  symbol: string,
  item: string,
  credentials: Record<string, string>,
  startDate?: string,
  endDate?: string,
  frequency?: string,
): Promise<any[]> {
  const data = await intrinioFetch<any>(
    `/companies/${encodeURIComponent(symbol)}/historical_data`,
    credentials,
    { item, start_date: startDate, end_date: endDate, frequency: frequency ?? "annual" },
  );
  return data?.historical_data ?? [];
}
