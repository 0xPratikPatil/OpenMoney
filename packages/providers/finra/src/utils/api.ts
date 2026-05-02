import { RateLimitError, EmptyDataError } from "@openmoney/provider-core";

const FINRA_BASE = "https://api.finra.org/data";

/**
 * Fetch from FINRA API.
 * FINRA uses POST requests with JSON body for their data endpoints.
 */
export async function finraFetch<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = `${FINRA_BASE}${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("FINRA API rate limit exceeded");
    throw new Error(`FINRA API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Fetch from FINRA via GET (for simpler endpoints).
 */
export async function finraGetFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${FINRA_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("FINRA API rate limit exceeded");
    throw new Error(`FINRA API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Parse FINRA API response data.
 */
export interface FinraObservation {
  [key: string]: string | number | null;
}

export function extractFinraData(
  response: unknown,
  dataKey: string = "data",
): FinraObservation[] {
  const resp = response as Record<string, unknown>;
  const data = resp?.[dataKey] ?? resp?.result ?? resp?.rows ?? resp;

  if (!Array.isArray(data) || data.length === 0) {
    throw new EmptyDataError("No FINRA data returned");
  }

  return data as FinraObservation[];
}
