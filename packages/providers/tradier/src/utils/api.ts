import { UnauthorizedError, RateLimitError } from "@openmoney/provider-core";

const TRADIER_BASE = "https://api.tradier.com/v1";

/**
 * Build headers with Bearer token for Tradier requests.
 */
function buildHeaders(credentials: Record<string, string>): Record<string, string> {
  const apiKey = credentials["tradier_api_key"];
  if (!apiKey) throw new UnauthorizedError("Tradier API key is required");
  return {
    "Authorization": `Bearer ${apiKey}`,
    "Accept": "application/json",
  };
}

/**
 * Generic fetch helper for Tradier with error handling.
 */
export async function tradierFetch<T>(
  path: string,
  credentials: Record<string, string>,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${TRADIER_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: buildHeaders(credentials),
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Tradier rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid Tradier API key");
    throw new Error(`Tradier API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch real-time quotes for one or more symbols.
 * GET /markets/quotes
 */
export async function fetchQuotes(
  symbols: string[],
  credentials: Record<string, string>,
): Promise<any[]> {
  const data = await tradierFetch<any>(
    "/markets/quotes",
    credentials,
    { symbols: symbols.join(","), greeks: "false" },
  );
  const quotes = data?.quotes?.quote;
  if (!quotes) return [];
  return Array.isArray(quotes) ? quotes : [quotes];
}

/**
 * Fetch historical prices for a symbol.
 * GET /markets/history
 */
export async function fetchHistorical(
  symbol: string,
  credentials: Record<string, string>,
  interval?: string,
  startDate?: string,
  endDate?: string,
): Promise<any[]> {
  const data = await tradierFetch<any>(
    "/markets/history",
    credentials,
    { symbol, interval: interval ?? "daily", startDate, endDate },
  );
  const history = data?.history?.day;
  if (!history) return [];
  return Array.isArray(history) ? history : [history];
}

/**
 * Fetch options chains.
 * GET /markets/options/chains
 */
export async function fetchOptionsChains(
  symbol: string,
  credentials: Record<string, string>,
  expiration?: string,
): Promise<any[]> {
  const data = await tradierFetch<any>(
    "/markets/options/chains",
    credentials,
    { symbol, expiration, greeks: "true" },
  );
  const options = data?.options?.option;
  if (!options) return [];
  return Array.isArray(options) ? options : [options];
}
