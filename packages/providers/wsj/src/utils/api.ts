import { RateLimitError, EmptyDataError } from "@openmoney/provider-core";

/** WSJ API base URL */
export const WSJ_BASE_URL = "https://api.wsj.net";
export const WSJ_MARKET_BASE = "https://www.wsj.com/market-data";

/** Raw market news item from WSJ */
export interface WSJNewsItem {
  id?: string;
  title?: string;
  summary?: string;
  url?: string;
  publishedAt?: string;
  source?: string;
  category?: string;
}

/** Raw market data item from WSJ */
export interface WSJMarketDataItem {
  symbol?: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  timestamp?: string;
}

/** Raw sector performance item from WSJ */
export interface WSJSectorPerformance {
  sector?: string;
  changePercent?: number;
  level?: number;
  volume?: number;
  upVolume?: number;
  downVolume?: number;
}

/**
 * Generic fetch wrapper for WSJ endpoints.
 * WSJ does not require authentication for public market data.
 */
export async function fetchWSJ<T>(
  path: string,
  baseUrl: string = WSJ_BASE_URL,
): Promise<T[]> {
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("WSJ rate limit exceeded");
    throw new Error(`WSJ API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle various WSJ response shapes
  let items: T[];
  if (Array.isArray(data)) {
    items = data;
  } else if (data?.data && Array.isArray(data.data)) {
    items = data.data as T[];
  } else if (data?.items && Array.isArray(data.items)) {
    items = data.items as T[];
  } else if (data?.results && Array.isArray(data.results)) {
    items = data.results as T[];
  } else if (data?.marketData && Array.isArray(data.marketData)) {
    items = data.marketData as T[];
  } else {
    items = [];
  }

  if (items.length === 0) throw new EmptyDataError("No data returned from WSJ");
  return items;
}
