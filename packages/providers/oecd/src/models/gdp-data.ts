import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { oecdFetch, parseOECDValue } from "../utils/api";
import type { OECDDataSet } from "../utils/api";

export const OECDGdpDataData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  country: z.string().nullish(),
  measure: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("oecd").default("oecd"),
});

export type OECDGdpDataData = z.infer<typeof OECDGdpDataData>;

export const OECDGdpDataQueryParams = z.object({
  country: z.string().default("USA"),
  measure: z.string().default("LNBQRSA"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type OECDGdpDataQueryParams = z.infer<typeof OECDGdpDataQueryParams>;

/**
 * Fetch GDP data from OECD.
 * Uses the National Accounts dataset (SNA_TABLE1).
 */
export class OECDGdpDataFetcher extends AbstractFetcher<
  typeof OECDGdpDataQueryParams,
  typeof OECDGdpDataData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof OECDGdpDataQueryParams>,
  ) {
    return {
      country: params.country ?? "USA",
      measure: params.measure ?? "LNBQRSA",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof OECDGdpDataQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const path = `/SNA_TABLE1/Q.${query.country}.${query.measure}.C/all`;
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
    _query?: z.infer<typeof OECDGdpDataQueryParams>,
  ) {
    const dataSet = raw as OECDDataSet;
    if (!dataSet?.dataSets || dataSet.dataSets.length === 0) {
      throw new EmptyDataError("No OECD GDP data returned");
    }

    const results: OECDGdpDataData[] = [];
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
          OECDGdpDataData.parse({
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
      throw new EmptyDataError("No OECD GDP observations returned");
    }

    return results;
  }
}
