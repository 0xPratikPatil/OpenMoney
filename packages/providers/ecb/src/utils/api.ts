import { RateLimitError } from "@openmoney/provider-core";

const ECB_BASE = "https://data-api.ecb.europa.eu/service/data";

/**
 * Generic fetch helper for ECB SDMX JSON API.
 */
export async function fetchEcbData(
  dataflow: string,
  params?: Record<string, string>,
): Promise<any> {
  let url = `${ECB_BASE}/${dataflow}?format=jsondata`;
  if (params) {
    const query = new URLSearchParams(params);
    url += `&${query.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OpenMoney/1.0",
    },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("ECB rate limit exceeded");
    throw new Error(`ECB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Parse SDMX-JSON observations into flat records.
 */
export function parseObservations(
  json: any,
): Array<Record<string, string | number | null>> {
  const dataSets = json?.dataSets ?? [];
  const structure = json?.structure;
  if (!structure || dataSets.length === 0) return [];

  // Get dimension info
  const seriesKeys = structure.dimensions?.series ?? [];
  const obsDimensions = structure.dimensions?.observation ?? [];

  // Build series dimension lookup
  const seriesDimMap: Record<string, Array<{ id: string; name: string }>> = {};
  for (const sk of seriesKeys) {
    const values = (sk.values as Array<{ id: string; name: string }>) ?? [];
    seriesDimMap[sk.id] = values;
  }

  // Build observation dimension lookup
  const obsDimMap: Record<string, Array<{ id: string; name: string }>> = {};
  for (const od of obsDimensions) {
    const values = (od.values as Array<{ id: string; name: string }>) ?? [];
    obsDimMap[od.id] = values;
  }

  const results: Array<Record<string, string | number | null>> = [];

  // Process observations from the first dataset
  const dataSet = dataSets[0];
  if (!dataSet) return [];

  // The series map is keyed by series dimension indices joined by ":"
  const series = dataSet.series ?? {};
  const observations = dataSet.observations ?? {};

  // If there are observations (flat structure)
  if (Object.keys(observations).length > 0) {
    for (const [obsKey, obsValue] of Object.entries(observations)) {
      const keyParts = obsKey.split(":");
      const record: Record<string, string | number | null> = {};

      // Map series dimensions
      for (let i = 0; i < seriesKeys.length && i < keyParts.length; i++) {
        const dim = seriesKeys[i]!;
        const idx = parseInt(keyParts[i] ?? "0", 10);
        const value = seriesDimMap[dim.id]?.[idx];
        record[dim.id] = value?.name ?? keyParts[i] ?? null;
      }

      // Map observation dimensions
      const offset = seriesKeys.length;
      for (let i = 0; i < obsDimensions.length && (i + offset) < keyParts.length; i++) {
        const dim = obsDimensions[i]!;
        const idx = parseInt(keyParts[i + offset] ?? "0", 10);
        const value = obsDimMap[dim.id]?.[idx];
        record[dim.id] = value?.name ?? keyParts[i + offset] ?? null;
      }

      // Get value (first element in value array)
      const val = Array.isArray(obsValue) ? (obsValue[0] as number) : null;
      record["value"] = val;

      results.push(record);
    }
  }

  // If there are series with nested observations
  if (Object.keys(series).length > 0) {
    for (const [seriesKey, seriesData] of Object.entries(series)) {
      const keyParts = seriesKey.split(":");
      const baseRecord: Record<string, string | number | null> = {};

      // Map series dimensions
      for (let i = 0; i < seriesKeys.length && i < keyParts.length; i++) {
        const dim = seriesKeys[i]!;
        const idx = parseInt(keyParts[i] ?? "0", 10);
        const value = seriesDimMap[dim.id]?.[idx];
        baseRecord[dim.id] = value?.name ?? keyParts[i] ?? null;
      }

      const sData = seriesData as any;
      const obs = sData?.observations ?? {};
      for (const [obsKey, obsValue] of Object.entries(obs)) {
        const record = { ...baseRecord };
        const val = Array.isArray(obsValue) ? (obsValue[0] as number) : null;
        record["value"] = val;

        // Map observation dimension (usually TIME_PERIOD)
        const obsParts = obsKey.split(":");
        for (let i = 0; i < obsDimensions.length && i < obsParts.length; i++) {
          const dim = obsDimensions[i]!;
          const idx = parseInt(obsParts[i] ?? "0", 10);
          const value = obsDimMap[dim.id]?.[idx];
          record[dim.id] = value?.name ?? obsParts[i] ?? null;
        }

        results.push(record);
      }
    }
  }

  return results;
}
