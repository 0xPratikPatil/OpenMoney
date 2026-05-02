import { RateLimitError, EmptyDataError } from "@openmoney/provider-core";

/** BizToc API base URL */
export const BIZTOC_BASE_URL = "https://ai.biztoc.com/ai";

/** Raw news article from BizToc API */
export interface BizTocArticle {
  id?: string;
  title?: string;
  body?: string;
  url?: string;
  source?: string;
  date?: string;
  tickers?: string[];
  summary?: string;
}

/**
 * Generic fetch wrapper for BizToc AI API.
 * BizToc does not require authentication.
 */
export async function fetchBizToc<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T[]> {
  const url = new URL(`${BIZTOC_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": "OpenMoney/1.0" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("BizToc rate limit exceeded");
    throw new Error(`BizToc API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { articles?: T[] } | T[];
  if (Array.isArray(data)) {
    if (data.length === 0) throw new EmptyDataError("No news found from BizToc");
    return data;
  }
  const articles = (data as { articles?: T[] }).articles;
  if (!articles || articles.length === 0) throw new EmptyDataError("No news found from BizToc");
  return articles;
}
