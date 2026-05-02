import { RateLimitError, UnauthorizedError } from "@openmoney/provider-core";

const EIA_BASE_URL = "https://api.eia.gov/v2";
const MIN_INTERVAL_MS = 1000;

let lastCallTime = 0;

export async function eiaFetch<T>(
  path: string,
  apiKey: string | undefined,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  if (!apiKey) {
    throw new UnauthorizedError("EIA API key is required");
  }

  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }

  const url = new URL(`${EIA_BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid EIA API key");
    if (response.status === 429) throw new RateLimitError("EIA rate limit exceeded");
    throw new Error(`EIA API error: ${response.status} ${response.statusText}`);
  }
  lastCallTime = now;
  return response.json() as Promise<T>;
}

export interface EIAResponseRow {
  period: string;
  value: number | null;
  [key: string]: unknown;
}

export interface EIAResponse {
  response: {
    data: EIAResponseRow[];
    total: number;
    dateFormat?: string;
    frequency?: string;
    description?: string;
    id?: string;
    name?: string;
  };
}

export function parseEIAValue(value: unknown): number | null {
  if (value == null || value === "" || value === ".") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
