import { RateLimitError, UnauthorizedError } from "@openmoney/provider-core";

const FRED_BASE_URL = "https://api.stlouisfed.org/fred";
const MIN_INTERVAL_MS = 500;

let lastCallTime = 0;

export async function fredFetch<T>(
  path: string,
  apiKey: string | undefined,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  if (!apiKey) {
    throw new UnauthorizedError("FRED API key is required");
  }

  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }

  const url = new URL(`${FRED_BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid FRED API key");
    if (response.status === 429) throw new RateLimitError("FRED rate limit exceeded");
    throw new Error(`FRED API error: ${response.status}`);
  }
  lastCallTime = now;
  return response.json() as Promise<T>;
}

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredSeriesResponse {
  observations: FredObservation[];
}

export interface FredSearchResult {
  id: string;
  title: string;
  observation_start: string;
  observation_end: string;
  frequency: string;
  units: string;
  seasonal_adjustment: string;
  popularity?: number;
}

export interface FredSearchResponse {
  seriess: FredSearchResult[];
}

export function parseFredValue(value: string): number | null {
  if (value === "." || value === "" || value == null) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
