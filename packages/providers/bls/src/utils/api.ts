import { UnauthorizedError, RateLimitError, EmptyDataError } from "@openmoney/provider-core";

const BLS_BASE = "https://api.bls.gov/publicAPI/v2";

/**
 * BLS API response wrapper.
 */
export interface BLSResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results?: {
    series: BLSSeriesResult[];
  };
}

export interface BLSSeriesResult {
  seriesID: string;
  data: BLSObservation[];
}

export interface BLSObservation {
  year: string;
  period: string;
  periodName: string;
  value: string;
  footnotes: Array<{ code: string; text: string }>;
}

/**
 * Fetch timeseries data from BLS API.
 * Uses POST with API key (optional — free tier available at bls.gov).
 */
export async function blsFetch<T = BLSResponse>(
  seriesIds: string[],
  apiKey?: string,
  startYear?: string,
  endYear?: string,
): Promise<T> {
  const body: Record<string, unknown> = {
    seriesid: seriesIds,
    startyear: startYear ?? String(new Date().getFullYear() - 1),
    endyear: endYear ?? String(new Date().getFullYear()),
  };

  // API key is required for > 25 queries per day but optional for low volume
  if (apiKey) {
    body.registrationkey = apiKey;
  }

  const response = await fetch(`${BLS_BASE}/timeseries/data/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("BLS rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    throw new Error(`BLS API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as BLSResponse;

  if (json.status === "REQUEST_FAILED") {
    const msg = json.message?.join("; ") ?? "Unknown BLS error";
    throw new Error(`BLS request failed: ${msg}`);
  }

  return json as unknown as T;
}

/**
 * Extract observations from BLS series response.
 * Returns flattened array of {seriesID, year, period, value}.
 */
export function extractBLSObservations(
  response: BLSResponse,
): Array<{ seriesID: string; year: string; period: string; periodName: string; value: string }> {
  if (!response.Results?.series || response.Results.series.length === 0) {
    throw new EmptyDataError("No BLS series data returned");
  }

  const results: Array<{ seriesID: string; year: string; period: string; periodName: string; value: string }> = [];

  for (const series of response.Results.series) {
    for (const obs of series.data) {
      results.push({
        seriesID: series.seriesID,
        year: obs.year,
        period: obs.period,
        periodName: obs.periodName,
        value: obs.value,
      });
    }
  }

  if (results.length === 0) {
    throw new EmptyDataError("No BLS observations found");
  }

  return results;
}

/**
 * Parse a BLS value string to number, handling special codes.
 */
export function parseBLSValue(value: string): number | null {
  if (!value || value === "." || value === "-" || value === " ") return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}
