import { RateLimitError, UnauthorizedError } from "@openmoney/provider-core";

const ECONDB_BASE_URL = "https://api.econdb.com";
const MIN_INTERVAL_MS = 600;

let lastCallTime = 0;

export async function econdbFetch<T>(
  path: string,
  apiKey: string | undefined,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  if (!apiKey) {
    throw new UnauthorizedError("EconDB API key is required");
  }

  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }

  const url = new URL(`${ECONDB_BASE_URL}${path}`);
  url.searchParams.set("token", apiKey);
  url.searchParams.set("format", "json");
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid EconDB API key");
    if (response.status === 429) throw new RateLimitError("EconDB rate limit exceeded");
    throw new Error(`EconDB API error: ${response.status} ${response.statusText}`);
  }
  lastCallTime = now;
  return response.json() as Promise<T>;
}

export interface EconDBCountry {
  country_code: string;
  country_name: string;
  currency: string;
  region: string;
}

export interface EconDBTimeSeries {
  dates: string[];
  values: number[];
  series_id: string;
  name: string;
  frequency: string;
  unit: string;
}

export interface EconDBCountryDataResponse {
  country: string;
  indicator: string;
  frequency: string;
  unit: string;
  data: Array<{ date: string; value: number | null }>;
}

export interface EconDBSearchResult {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit?: string;
  frequency?: string;
}

export function parseEconDBValue(value: unknown): number | null {
  if (value == null || value === "" || value === ".") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
