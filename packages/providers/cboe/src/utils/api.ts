import { UnauthorizedError, RateLimitError } from "@openmoney/provider-core";

const CBOE_BASE = "https://cdn.cboe.com/api/global/delayed_quotes";
const CBOE_RESOURCES = "https://cdn.cboe.com/resources";
const CBOE_SYMBOLDIR = "https://www.cboe.com/us/options/symboldir/equity_index_options/";

/**
 * Generic fetch helper with error handling.
 */
export async function fetchHelper<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; OpenMoney/1.0)",
      Accept: "application/json, text/csv",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("CBOE rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    throw new Error(`CBOE API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch CSV text from CBOE.
 */
export async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; OpenMoney/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`CBOE CSV error: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * GET /quotes/{symbol}.json — delayed quote for a symbol.
 */
export async function fetchQuote(symbol: string): Promise<any> {
  const cleanSymbol = symbol.replace("^", "");
  const url = `${CBOE_BASE}/quotes/${encodeURIComponent(cleanSymbol)}.json`;
  return fetchHelper(url);
}

/**
 * GET resources/historical/{symbol}.json — historical OHLCV data.
 */
export async function fetchHistorical(symbol: string): Promise<any[]> {
  const cleanSymbol = symbol.replace("^", "");
  const url = `${CBOE_RESOURCES}/historical/${encodeURIComponent(cleanSymbol)}.json`;
  const data = await fetchHelper<any>(url);
  return data?.data ?? [];
}

/**
 * Fetch equity/option symbol directory CSV.
 */
export async function fetchSymbolDirectory(): Promise<string> {
  const url = `${CBOE_SYMBOLDIR}?download=csv`;
  return fetchCsv(url);
}

/**
 * GET all_indices.json — list of all available indices.
 */
export async function fetchAllIndices(): Promise<any[]> {
  const url = `${CBOE_BASE}/us_indices/definitions/all_indices.json`;
  const data = await fetchHelper<any>(url);
  return data?.data ?? [];
}

/**
 * GET constituents/{symbol}.json — index constituents.
 */
export async function fetchIndexConstituents(symbol: string): Promise<any[]> {
  const cleanSymbol = symbol.replace("^", "");
  const url = `${CBOE_BASE}/us_indices/constituents/${encodeURIComponent(cleanSymbol)}.json`;
  const data = await fetchHelper<any>(url);
  return data?.data ?? [];
}

/**
 * GET snapshots/{symbol}.json — index snapshot data.
 */
export async function fetchIndexSnapshot(symbol: string): Promise<any> {
  const cleanSymbol = symbol.replace("^", "");
  const url = `${CBOE_BASE}/us_indices/snapshots/${encodeURIComponent(cleanSymbol)}.json`;
  const data = await fetchHelper<any>(url);
  return data?.data ?? null;
}

/**
 * GET futures-roots.json — futures curve roots.
 */
export async function fetchFuturesRoots(): Promise<any[]> {
  const url = `${CBOE_BASE}/futures-roots.json`;
  const data = await fetchHelper<any>(url);
  return data?.data ?? [];
}

/**
 * GET options/{symbol}.json — options chain.
 */
export async function fetchOptionsChain(symbol: string): Promise<any> {
  const cleanSymbol = symbol.replace("^", "");
  const url = `${CBOE_BASE}/options/${encodeURIComponent(cleanSymbol)}.json`;
  return fetchHelper(url);
}
