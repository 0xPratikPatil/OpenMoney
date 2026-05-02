import { RateLimitError, UnauthorizedError } from "@openmoney/provider-core";

const TE_BASE_URL = "https://api.tradingeconomics.com";
const MIN_INTERVAL_MS = 500;

let lastCallTime = 0;

export async function teFetch<T>(
  path: string,
  apiKey: string | undefined,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  if (!apiKey) {
    throw new UnauthorizedError("TradingEconomics API key is required");
  }

  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }

  const url = new URL(`${TE_BASE_URL}${path}`);
  url.searchParams.set("c", apiKey);
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError("Invalid TradingEconomics API key");
    if (response.status === 429) throw new RateLimitError("TradingEconomics rate limit exceeded");
    throw new Error(`TradingEconomics API error: ${response.status} ${response.statusText}`);
  }
  lastCallTime = now;
  return response.json() as Promise<T>;
}

export interface TECountryIndicator {
  Country: string;
  Category: string;
  Title: string;
  LatestValue: number | null;
  LatestValueDate: string;
  Frequency: string;
  Unit: string;
  PreviousValue: number | null;
  PreviousValueDate: string;
  [key: string]: unknown;
}

export interface TECalendarEvent {
  CalendarId: number;
  Date: string;
  Country: string;
  Category: string;
  Event: string;
  Reference: string;
  Source: string;
  Actual: number | string | null;
  Previous: number | string | null;
  Forecast: number | string | null;
  teForecast: number | string | null;
  Url: string;
  Importance: number;
  [key: string]: unknown;
}

export interface TEForecast {
  Country: string;
  Category: string;
  Title: string;
  LatestValue: number | null;
  LatestValueDate: string;
  Frequency: string;
  Unit: string;
  q1?: number | null;
  q2?: number | null;
  q3?: number | null;
  q4?: number | null;
  [key: string]: unknown;
}

export interface TEMarketData {
  Symbol: string;
  Name: string;
  Country: string;
  Last: number | null;
  Date: string;
  Previous: number | null;
  Open: number | null;
  High: number | null;
  Low: number | null;
  PercentChange: number | null;
  DailyChange: number | null;
  WeeklyChange: number | null;
  MonthlyChange: number | null;
  YearlyChange: number | null;
  [key: string]: unknown;
}

export function parseTEValue(value: unknown): number | null {
  if (value == null || value === "" || value === ".") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
