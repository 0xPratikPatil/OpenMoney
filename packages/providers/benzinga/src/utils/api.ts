import { UnauthorizedError, RateLimitError, EmptyDataError } from "@openmoney/provider-core";

/** Benzinga API base URL */
export const BENZINGA_BASE_URL = "https://api.benzinga.com/api/v2";

/** Raw article/feed item from Benzinga API */
export interface BenzingaNewsItem {
  id: string;
  title?: string;
  body?: string;
  url?: string;
  author?: string;
  created?: number;
  updated?: number;
  stocks?: string[];
  channels?: string[];
  /** Categories from Benzinga */
  categories?: string[];
}

/** Raw analyst rating from Benzinga */
export interface BenzingaAnalystRating {
  id?: string;
  ticker?: string;
  analyst?: string;
  firm?: string;
  action?: string;
  rating_from?: string;
  rating_to?: string;
  price_target_from?: number;
  price_target_to?: number;
  rating_date?: string;
}

/** Raw earnings item from Benzinga */
export interface BenzingaEarningsItem {
  id?: string;
  ticker?: string;
  company?: string;
  date?: string;
  time?: string;
  eps_estimate?: number;
  eps_actual?: number;
  revenue_estimate?: number;
  revenue_actual?: number;
}

/** Raw IPO item from Benzinga */
export interface BenzingaIPOItem {
  id?: string;
  ticker?: string;
  company?: string;
  exchange?: string;
  ipo_date?: string;
  price_range_low?: number;
  price_range_high?: number;
  shares?: number;
  status?: string;
}

/**
 * Generic fetch wrapper for Benzinga API.
 * Automatically injects the API token and handles errors.
 */
export async function fetchBenzinga<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  credentials: Record<string, string>,
): Promise<T[]> {
  const token = credentials["benzinga_api_key"];
  if (!token) throw new UnauthorizedError("Benzinga API key is required");

  const url = new URL(`${BENZINGA_BASE_URL}${path}`);
  url.searchParams.set("token", token);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": "OpenMoney/1.0" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Benzinga rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid Benzinga API key");
    throw new Error(`Benzinga API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as T[];
  if (!Array.isArray(data) || data.length === 0) throw new EmptyDataError("No data returned from Benzinga");
  return data;
}
