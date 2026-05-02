import { RateLimitError } from "@openmoney/provider-core";

const IMF_DATA_URL = "http://dataservices.imf.org/REST/SDMX_JSON.svc";
const MIN_INTERVAL_MS = 500;

let lastCallTime = 0;

export async function imfFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }

  const url = new URL(`${IMF_DATA_URL}${path}`);
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("IMF rate limit exceeded");
    throw new Error(`IMF API error: ${response.status} ${response.statusText}`);
  }
  lastCallTime = now;
  return response.json() as Promise<T>;
}

export interface IMFDataRow {
  [key: string]: unknown;
  "@FREQ"?: string;
  "@REF_AREA"?: string;
  "@INDICATOR"?: string;
  "@UNIT_MULT"?: string;
  "@TIME_FORMAT"?: string;
  Obs: Array<{
    "@TIME_PERIOD": string;
    "@OBS_VALUE": string;
    "@OBS_STATUS"?: string;
  }>;
}

export interface IMFResponse {
  Structure?: unknown;
  DataSets?: Array<{
    Series: Record<string, { Observations: Record<string, Array<{ 0: string }>> }>;
  }>;
}

export function parseIMFValue(value: string | null | undefined): number | null {
  if (value == null || value === "" || value === ".") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
