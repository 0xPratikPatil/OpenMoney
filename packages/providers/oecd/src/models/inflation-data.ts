import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { oecdFetch, parseOECDValue } from "../utils/api";
import type { OECDDataSet } from "../utils/api";

export const OECDInflationDataData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  country: z.string().nullish(),
  measure: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("oecd").default("oecd"),
});

export type OECDInflationDataData = z.infer<typeof OECDInflationDataData>;

export const OECDInflationDataQueryParams = z.object({
  country: z.string().default("USA"),
  measure: z.string().default("CPALTT01"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type OECDInflationDataQueryParams = z.infer<typeof OECDInflationDataQueryParams>;

/**
 * Fetch inflation/CPI data from OECD.
 * Uses the Consumer Price Index dataset (PRICES_CPI).
 */
export class OECDInflationDataFetcher extends AbstractFetcher<
  typeof OECDInflationDataQueryParams,
  typeof OECDInflationDataData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof OECDInflationDataQueryParams>,
  ) {
    return {
      country: params.country ?? "USA",
      measure: params.measure ?? "CPALTT01",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof OECDInflationDataQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const path = `/PRICES_CPI/M.${query.country}.${query.measure}.all/all`;
    return oecdFetch<OECDDataSet>(
      path,
      {
        startPeriod: query.startPeriod,
        endPeriod: query.endPeriod,
      },
    );
  }

  async transformData(
    raw: unknown,
    _query?: z.infer<typeof OECDInflationDataQueryParams>,
  ) {
    const dataSet = raw as OECDDataSet;
    if (!dataSet?.dataSets || dataSet.dataSets.length === 0) {
      throw new EmptyDataError("No OECD inflation data returned");
    }

    const results: OECDInflationDataData[] = [];
    const seriesDimensions = dataSet.structure?.dimensions?.series ?? [];
    const countryIdx = seriesDimensions.findIndex((d) => d.id === "REF_AREA");
    const measureIdx = seriesDimensions.findIndex((d) => d.id === "MEASURE");

    for (const [_key, series] of Object.entries(dataSet.dataSets[0]?.series ?? {})) {
      const keyParts = _key.split(":");
      const country = countryIdx >= 0 && keyParts[countryIdx]
        ? seriesDimensions[countryIdx]?.values[Number(keyParts[countryIdx])]?.name ?? null
        : null;
      const measure = measureIdx >= 0 && keyParts[measureIdx]
        ? seriesDimensions[measureIdx]?.values[Number(keyParts[measureIdx])]?.name ?? null
        : null;

      for (const [timeKey, obs] of Object.entries(series.observations ?? {})) {
        results.push(
          OECDInflationDataData.parse({
            timePeriod: timeKey,
            value: parseOECDValue(obs[0]),
            country,
            measure,
            unit: null,
          }),
        );
      }
    }

    if (results.length === 0) {
      throw new EmptyDataError("No OECD inflation observations returned");
    }

    return results;
  }
}
