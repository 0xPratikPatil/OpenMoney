import { RateLimitError } from "@openmoney/provider-core";

const DERIBIT_BASE = "https://www.deribit.com/api/v2/public";

/**
 * Generic fetch helper for Deribit public API.
 */
export async function fetchDeribit<T = any>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): Promise<T> {
  let url = `${DERIBIT_BASE}/${endpoint}`;

  if (params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      query.set(key, String(value));
    }
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OpenMoney/1.0",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Deribit rate limit exceeded");
    throw new Error(`Deribit API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as any;

  if (data?.error) {
    throw new Error(`Deribit API error: ${data.error.message ?? JSON.stringify(data.error)}`);
  }

  return data?.result as T;
}
