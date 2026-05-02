import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { oecdFetch, parseOECDValue } from "../utils/api";
import type { OECDDataSet } from "../utils/api";

export const OECDEconomicOutlookData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  subject: z.string().nullish(),
  measure: z.string().nullish(),
  unit: z.string().nullish(),
  country: z.string().nullish(),
  provider: z.literal("oecd").default("oecd"),
});

export type OECDEconomicOutlookData = z.infer<typeof OECDEconomicOutlookData>;

export const OECDEconomicOutlookQueryParams = z.object({
  subject: z.string().default("GDP"),
  measure: z.string().default("GROWTH"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type OECDEconomicOutlookQueryParams = z.infer<typeof OECDEconomicOutlookQueryParams>;

/**
 * Fetch OECD Economic Outlook data.
 * Uses SDMX JSON format from the OECD public API.
 */
export class OECDEconomicOutlookFetcher extends AbstractFetcher<
  typeof OECDEconomicOutlookQueryParams,
  typeof OECDEconomicOutlookData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof OECDEconomicOutlookQueryParams>,
  ) {
    return {
      subject: params.subject ?? "GDP",
      measure: params.measure ?? "GROWTH",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof OECDEconomicOutlookQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // OECD Economic Outlook: EO dataset with GDP/MEASURE subject
    const path = `/EO${new Date().getFullYear()}/COMPLETE.${query.subject}.${query.measure}.ALL./all`;
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
    _query?: z.infer<typeof OECDEconomicOutlookQueryParams>,
  ) {
    const dataSet = raw as OECDDataSet;
    if (!dataSet?.dataSets || dataSet.dataSets.length === 0) {
      throw new EmptyDataError("No OECD Economic Outlook data returned");
    }

    const results: OECDEconomicOutlookData[] = [];
    const seriesDimensions = dataSet.structure?.dimensions?.series ?? [];
    const countryIdx = seriesDimensions.findIndex((d) => d.id === "REF_AREA");
    const subjectIdx = seriesDimensions.findIndex((d) => d.id === "SUBJECT");
    const measureIdx = seriesDimensions.findIndex((d) => d.id === "MEASURE");

    for (const [key, series] of Object.entries(dataSet.dataSets[0]?.series ?? {})) {
      const keyParts = key.split(":");
      const country = countryIdx >= 0 && keyParts[countryIdx]
        ? seriesDimensions[countryIdx]?.values[Number(keyParts[countryIdx])]?.name ?? null
        : null;
      const subject = subjectIdx >= 0 && keyParts[subjectIdx]
        ? seriesDimensions[subjectIdx]?.values[Number(keyParts[subjectIdx])]?.name ?? null
        : null;
      const measure = measureIdx >= 0 && keyParts[measureIdx]
        ? seriesDimensions[measureIdx]?.values[Number(keyParts[measureIdx])]?.name ?? null
        : null;

      for (const [timeKey, obs] of Object.entries(series.observations ?? {})) {
        results.push(
          OECDEconomicOutlookData.parse({
            timePeriod: timeKey,
            value: parseOECDValue(obs[0]),
            subject,
            measure,
            country,
            unit: null,
          }),
        );
      }
    }

    if (results.length === 0) {
      throw new EmptyDataError("No OECD Economic Outlook observations returned");
    }

    return results;
  }
}
