import { RateLimitError } from "@openmoney/provider-core";

const CONGRESS_BASE = "https://api.congress.gov/v3";

/**
 * Fetch from congress.gov API.
 * No auth required for public API endpoints.
 */
export async function congressFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${CONGRESS_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Congress.gov API rate limit exceeded");
    throw new Error(`Congress.gov API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Standard Congress.gov API list response with pagination.
 */
export interface CongressApiListResponse<T> {
  pagination: {
    count: number;
    offset: number;
  };
  results: T[];
}

/**
 * Standard Congress.gov API single item response.
 */
export interface CongressApiItemResponse<T> {
  results: T[];
}
