import { UnauthorizedError, RateLimitError } from "@openmoney/provider-core";

const POLYGON_BASE = "https://api.polygon.io";

export interface PolygonAgg {
  c: number;  // close
  h: number;  // high
  l: number;  // low
  o: number;  // open
  v: number;  // volume
  t: number;  // timestamp (ms)
  vw?: number; // volume-weighted avg price
  n?: number;  // number of transactions
}

export interface PolygonAggsResponse {
  status: string;
  ticker: string;
  results?: PolygonAgg[];
  resultsCount: number;
}

/**
 * Build headers with API key for Polygon.io requests.
 */
function buildHeaders(credentials: Record<string, string>): Record<string, string> {
  const apiKey = credentials["polygon_api_key"];
  if (!apiKey) throw new UnauthorizedError("Polygon.io API key is required");
  return { "Authorization": `Bearer ${apiKey}` };
}

/**
 * Generic fetch helper for Polygon.io with error handling.
 */
export async function polygonFetch<T>(
  path: string,
  credentials: Record<string, string>,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${POLYGON_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  // Polygon also accepts apiKey as query param
  if (!credentials["polygon_api_key"]) {
    url.searchParams.set("apiKey", credentials["polygon_api_key"] ?? "");
  }

  const response = await fetch(url.toString(), {
    headers: { ...buildHeaders(credentials) },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Polygon.io rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid Polygon.io API key");
    throw new Error(`Polygon.io API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch real-time snapshot for a single ticker.
 * GET /v2/snapshot/locale/us/markets/stocks/tickers/{symbol}
 */
export async function fetchEquitySnapshot(
  symbol: string,
  credentials: Record<string, string>,
): Promise<any> {
  const data = await polygonFetch<any>(
    `/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(symbol)}`,
    credentials,
  );
  return data?.ticker ?? null;
}

/**
 * Fetch aggregated (OHLCV) bars.
 * GET /v2/aggs/ticker/{stockTicker}/range/{multiplier}/{timespan}/{from}/{to}
 */
export async function fetchAggs(
  ticker: string,
  multiplier: number,
  timespan: string,
  from: string,
  to: string,
  credentials: Record<string, string>,
): Promise<PolygonAgg[]> {
  const url = `/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/${multiplier}/${timespan}/${from}/${to}`;
  const data = await polygonFetch<PolygonAggsResponse>(url, credentials, {
    adjusted: "true",
    sort: "asc",
    limit: 50000,
  });
  return data?.results ?? [];
}

/**
 * Fetch options chain snapshot.
 * GET /v3/snapshot/options/{underlyingAsset}
 */
export async function fetchOptionsChain(
  underlyingAsset: string,
  credentials: Record<string, string>,
): Promise<any> {
  const data = await polygonFetch<any>(
    `/v3/snapshot/options/${encodeURIComponent(underlyingAsset)}`,
    credentials,
  );
  return data?.results ?? [];
}
