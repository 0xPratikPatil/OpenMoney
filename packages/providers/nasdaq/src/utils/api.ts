import { UnauthorizedError, RateLimitError, EmptyDataError } from "@openmoney/provider-core";

const NASDAQ_QUANDL_BASE = "https://data.nasdaq.com/api/v3";
const NASDAQ_API_BASE = "https://api.nasdaq.com";

/**
 * Fetch from Nasdaq Data (Quandl) APIs with optional API key.
 */
export async function nasdaqFetch<T>(
  path: string,
  params?: Record<string, string>,
  apiKey?: string,
): Promise<T> {
  const url = new URL(`${NASDAQ_QUANDL_BASE}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Nasdaq API rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    throw new Error(`Nasdaq API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Fetch from Nasdaq public (non-Quandl) APIs.
 * These don't require authentication.
 */
export async function nasdaqPublicFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${NASDAQ_API_BASE}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
      Referer: "https://www.nasdaq.com/",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Nasdaq public API rate limit exceeded");
    throw new Error(`Nasdaq public API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Extract datatable data from Nasdaq's Quandl datatable response.
 */
export function extractDatatable(
  raw: unknown,
): Array<Record<string, unknown>> {
  const data = raw as Record<string, unknown>;
  const datatable = (data as any)?.datatable;
  if (!datatable) throw new EmptyDataError("No datatable in Nasdaq response");

  const columns: string[] = (datatable.columns as Array<Record<string, unknown>>)?.map(
    (c: Record<string, unknown>) => c.name as string,
  ) ?? [];
  const rows: Array<Array<unknown>> = (datatable.data as Array<Array<unknown>>) ?? [];

  return rows.map((row) => {
    const record: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      record[col] = row[i] ?? null;
    });
    return record;
  });
}
