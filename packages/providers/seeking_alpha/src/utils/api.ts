import { RateLimitError, EmptyDataError } from "@openmoney/provider-core";

/** Seeking Alpha base URL */
export const SA_BASE_URL = "https://seekingalpha.com";

/** Raw article/transcript from Seeking Alpha */
export interface SAArticle {
  id?: string;
  title?: string;
  summary?: string;
  content?: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  tickers?: string[];
  type?: string;
}

/** Raw analyst rating from SA */
export interface SAAnalystRating {
  ticker?: string;
  rating?: string;
  priceTarget?: number;
  firm?: string;
  analyst?: string;
  date?: string;
}

/** Raw dividend item from SA */
export interface SADividendItem {
  ticker?: string;
  exDate?: string;
  payDate?: string;
  amount?: number;
  yield?: number;
  type?: string;
  frequency?: string;
}

/**
 * Fetch HTML from Seeking Alpha and parse JSON from embedded data.
 * Seeking Alpha pages embed data in script tags or API responses.
 */
export async function fetchSAJson<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T[]> {
  const url = new URL(`${SA_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Seeking Alpha rate limit exceeded");
    throw new Error(`Seeking Alpha error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { data?: T[] } | T[];
  if (Array.isArray(data)) {
    if (data.length === 0) throw new EmptyDataError("No data returned from Seeking Alpha");
    return data;
  }
  const extracted = (data as { data?: T[] }).data;
  if (!extracted || extracted.length === 0) throw new EmptyDataError("No data returned from Seeking Alpha");
  return extracted;
}

/**
 * Fetch a single JSON object (for detail endpoints).
 */
export async function fetchSAJsonSingle<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(`${SA_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Seeking Alpha rate limit exceeded");
    throw new Error(`Seeking Alpha error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as T;
  if (!data) throw new EmptyDataError("No data returned from Seeking Alpha");
  return data;
}
