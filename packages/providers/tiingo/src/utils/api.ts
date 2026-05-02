import { UnauthorizedError, RateLimitError } from "@openmoney/provider-core";

const TIINGO_BASE = "https://api.tiingo.com";

/**
 * Build headers with API key for Tiingo requests.
 */
function buildHeaders(credentials: Record<string, string>): Record<string, string> {
  const apiKey = credentials["tiingo_api_key"];
  if (!apiKey) throw new UnauthorizedError("Tiingo API key is required");
  return {
    "Content-Type": "application/json",
    "Authorization": `Token ${apiKey}`,
  };
}

/**
 * Generic fetch helper for Tiingo with error handling.
 */
export async function tiingoFetch<T>(
  path: string,
  credentials: Record<string, string>,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${TIINGO_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: buildHeaders(credentials),
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Tiingo rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid Tiingo API key");
    throw new Error(`Tiingo API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch real-time top-of-book quote.
 * GET /iex/{symbol}
 */
export async function fetchIEXQuote(
  symbol: string,
  credentials: Record<string, string>,
): Promise<any> {
  const data = await tiingoFetch<any[]>(
    `/iex/${encodeURIComponent(symbol)}`,
    credentials,
  );
  return data?.[0] ?? null;
}

/**
 * Fetch historical daily prices.
 * GET /tiingo/daily/{symbol}/prices
 */
export async function fetchDailyPrices(
  symbol: string,
  credentials: Record<string, string>,
  startDate?: string,
  endDate?: string,
): Promise<any[]> {
  return tiingoFetch<any[]>(
    `/tiingo/daily/${encodeURIComponent(symbol)}/prices`,
    credentials,
    { startDate, endDate },
  );
}

/**
 * Fetch crypto historical prices.
 * GET /tiingo/crypto/prices
 */
export async function fetchCryptoPrices(
  tickers: string,
  credentials: Record<string, string>,
  startDate?: string,
  endDate?: string,
  resampleFreq?: string,
): Promise<any[]> {
  return tiingoFetch<any[]>(
    `/tiingo/crypto/prices`,
    credentials,
    {
      tickers,
      startDate,
      endDate,
      resampleFreq: resampleFreq ?? "1day",
    },
  );
}
