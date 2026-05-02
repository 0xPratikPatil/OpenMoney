import { ProviderHttpClient } from "@openmoney/shared/utils";

const POLYGON_BASE = "https://api.polygon.io";

/**
 * Polygon.io API client — uses the shared ProviderHttpClient with Bearer token auth.
 * Covers equities, forex, crypto, and options data.
 */
const polygonClient = new ProviderHttpClient({
  baseUrl: POLYGON_BASE,
  userAgent: "OpenMoney/0.1.0",
  timeout: 30000,
  retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 10000 },
  cache: { ttlMs: 60000, enabled: true },
  auth: {
    type: "bearer",
    key: "Authorization",
    credentialKey: "polygon_api_key",
  },
});

export interface PolygonAgg {
  /** Close price */
  c: number;
  /** High price */
  h: number;
  /** Low price */
  l: number;
  /** Open price */
  o: number;
  /** Volume */
  v: number;
  /** Timestamp (ms) */
  t: number;
  /** Volume-weighted average price */
  vw?: number;
  /** Number of transactions */
  n?: number;
}

export interface PolygonAggsResponse {
  status: string;
  ticker: string;
  results?: PolygonAgg[];
  resultsCount: number;
}

/**
 * Fetch real-time snapshot for a single ticker.
 * GET /v2/snapshot/locale/us/markets/stocks/tickers/{symbol}
 */
export async function fetchEquitySnapshot(
  symbol: string,
  credentials: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  const data = await polygonClient.get<{ ticker?: Record<string, unknown> }>(
    `/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(symbol)}`,
    undefined,
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
  const data = await polygonClient.get<PolygonAggsResponse>(
    url,
    { adjusted: "true", sort: "asc", limit: 50000 },
    credentials,
  );
  return data?.results ?? [];
}

/**
 * Fetch options chain snapshot.
 * GET /v3/snapshot/options/{underlyingAsset}
 */
export async function fetchOptionsChain(
  underlyingAsset: string,
  credentials: Record<string, string>,
): Promise<unknown[]> {
  const data = await polygonClient.get<{ results?: unknown[] }>(
    `/v3/snapshot/options/${encodeURIComponent(underlyingAsset)}`,
    undefined,
    credentials,
  );
  return data?.results ?? [];
}
