import { RateLimitError } from "@openmoney/provider-core";

const TREASURY_BASE = "https://www.treasurydirect.gov/TA_WS";
const USDA_BASE = "https://apps.fas.usda.gov";

/**
 * Fetch from TreasuryDirect API.
 * No auth required for public data.
 */
export async function treasuryFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${TREASURY_BASE}${path}`);
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
    if (response.status === 429) throw new RateLimitError("Treasury API rate limit exceeded");
    throw new Error(`Treasury API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Fetch from USDA PSD (Production, Supply, Distribution) data.
 */
export async function usdaFetch<T>(
  path: string,
): Promise<T> {
  const url = `${USDA_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("USDA API rate limit exceeded");
    throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Fetch from National Weather Service or other public .gov sources.
 */
export async function govPublicFetch<T>(
  url: string,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Government API rate limit exceeded");
    throw new Error(`Government API error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  // Try JSON first, fallback to text
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
