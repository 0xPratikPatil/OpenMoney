import { RateLimitError } from "@openmoney/provider-core";

const OECD_BASE_URL = "https://sdmx.oecd.org/public/rest/data";
const MIN_INTERVAL_MS = 800;

let lastCallTime = 0;

export async function oecdFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }

  const url = new URL(`${OECD_BASE_URL}${path}`);
  url.searchParams.set("format", "jsondata");
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("OECD rate limit exceeded");
    throw new Error(`OECD API error: ${response.status} ${response.statusText}`);
  }
  lastCallTime = now;
  return response.json() as Promise<T>;
}

export interface OECDDataRow {
  /** Time period, e.g. "2024" or "2024-Q1" */
  TIME_PERIOD: string;
  /** Observation value */
  OBS_VALUE: string;
  /** Unit */
  UNIT?: string;
  /** Unit multiplier */
  UNIT_MULT?: string;
  /** Frequency */
  FREQ?: string;
  /** Measure */
  MEASURE?: string;
  /** Subject */
  SUBJECT?: string;
  /** Reference area / country */
  REF_AREA?: string;
  [key: string]: unknown;
}

export interface OECDDataSet {
  dataSets: Array<{
    series: Record<string, {
      observations: Record<string, [number]>;
      attributes?: number[];
    }>;
  }>;
  structure: {
    dimensions: {
      series: Array<{
        id: string;
        values: Array<{ id: string; name: string }>;
      }>;
    };
  };
}

export function parseOECDValue(value: string | number | null | undefined): number | null {
  if (value == null || value === "" || value === ".") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
