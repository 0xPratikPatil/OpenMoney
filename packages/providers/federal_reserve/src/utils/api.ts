import { RateLimitError } from "@openmoney/provider-core";

const FRB_BASE = "https://www.federalreserve.gov/datadownload/api";

/**
 * Fetch data from Federal Reserve Board Data Download API.
 * All FRB data is publicly available with no auth.
 */
export async function frbFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${FRB_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json, text/csv, text/plain, */*",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Federal Reserve API rate limit exceeded");
    throw new Error(`Federal Reserve API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

/**
 * Parse Federal Reserve Data Download JSON format.
 * FRB data download returns: { observations: [...], columns: [...] }
 */
export interface FRBObservation {
  [key: string]: string | number | null;
}

export function extractFRBObservations(
  response: unknown,
): FRBObservation[] {
  const resp = (response ?? {}) as Record<string, unknown>;
  const observations = ((resp.observations as FRBObservation[]) ?? (resp.data as FRBObservation[]) ?? []) as FRBObservation[];

  if (!Array.isArray(observations) || observations.length === 0) {
    return [];
  }

  return observations;
}

/**
 * Parse value to number, handling special codes.
 */
export function parseFRBValue(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  if (value === "." || value === "-" || value === " " || value === "") return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}
