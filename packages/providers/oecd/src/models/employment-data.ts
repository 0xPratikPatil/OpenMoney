import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { oecdFetch, parseOECDValue } from "../utils/api";
import type { OECDDataSet } from "../utils/api";

export const OECDEmploymentDataData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  country: z.string().nullish(),
  subject: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("oecd").default("oecd"),
});

export type OECDEmploymentDataData = z.infer<typeof OECDEmploymentDataData>;

export const OECDEmploymentDataQueryParams = z.object({
  country: z.string().default("USA"),
  subject: z.string().default("UNEMP"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type OECDEmploymentDataQueryParams = z.infer<typeof OECDEmploymentDataQueryParams>;

/**
 * Fetch employment/unemployment data from OECD.
 * Uses the Labour Force Statistics dataset (STLABOUR).
 */
export class OECDEmploymentDataFetcher extends AbstractFetcher<
  typeof OECDEmploymentDataQueryParams,
  typeof OECDEmploymentDataData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof OECDEmploymentDataQueryParams>,
  ): Promise<z.input<typeof OECDEmploymentDataQueryParams>> {
    return {
      country: params.country ?? "USA",
      subject: params.subject ?? "UNEMP",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof OECDEmploymentDataQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const path = `/STLABOUR/M.${query.country}.${query.subject}.all/all`;
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
    _query?: z.infer<typeof OECDEmploymentDataQueryParams>,
  ): Promise<OECDEmploymentDataData[]> {
    const dataSet = raw as OECDDataSet;
    if (!dataSet?.dataSets || dataSet.dataSets.length === 0) {
      throw new EmptyDataError("No OECD employment data returned");
    }

    const results: OECDEmploymentDataData[] = [];
    const seriesDimensions = dataSet.structure?.dimensions?.series ?? [];
    const countryIdx = seriesDimensions.findIndex((d) => d.id === "REF_AREA");
    const subjectIdx = seriesDimensions.findIndex((d) => d.id === "SUBJECT");

    for (const [_key, series] of Object.entries(dataSet.dataSets[0]?.series ?? {})) {
      const keyParts = _key.split(":");
      const country = countryIdx >= 0 && keyParts[countryIdx]
        ? seriesDimensions[countryIdx]?.values[Number(keyParts[countryIdx])]?.name ?? null
        : null;
      const subject = subjectIdx >= 0 && keyParts[subjectIdx]
        ? seriesDimensions[subjectIdx]?.values[Number(keyParts[subjectIdx])]?.name ?? null
        : null;

      for (const [timeKey, obs] of Object.entries(series.observations ?? {})) {
        results.push(
          OECDEmploymentDataData.parse({
            timePeriod: timeKey,
            value: parseOECDValue(obs[0]),
            country,
            subject,
            unit: null,
          }),
        );
      }
    }

    if (results.length === 0) {
      throw new EmptyDataError("No OECD employment observations returned");
    }

    return results;
  }
}
