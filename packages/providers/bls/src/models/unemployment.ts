import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { blsFetch, extractBLSObservations, parseBLSValue } from "../utils/api";

// LNS14000000 = Unemployment Rate (Seasonally Adjusted)
export const BLSUnemploymentQueryParams = z.object({
  startYear: z.string().optional(),
  endYear: z.string().optional(),
});

export const BLSUnemploymentData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string(),
  period: z.string().nullish(),
  periodName: z.string().nullish(),
  provider: z.literal("bls").default("bls"),
});

export type BLSUnemploymentData = z.infer<typeof BLSUnemploymentData>;

const UNEMPLOYMENT_SERIES_IDS = ["LNS14000000"];

/**
 * Fetch unemployment rate data from BLS.
 * Uses CPS (Current Population Survey) series LNS14000000.
 */
export class BLSUnemploymentFetcher extends AbstractFetcher<
  typeof BLSUnemploymentQueryParams,
  typeof BLSUnemploymentData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof BLSUnemploymentQueryParams>) {
    return {
      startYear: params.startYear ?? String(new Date().getFullYear() - 1),
      endYear: params.endYear ?? String(new Date().getFullYear()),
    };
  }

  async extractData(
    query: z.infer<typeof BLSUnemploymentQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    return blsFetch(
      UNEMPLOYMENT_SERIES_IDS,
      credentials.bls_api_key,
      query.startYear,
      query.endYear,
    );
  }

  async transformData(raw: unknown): Promise<BLSUnemploymentData[]> {
    const response = raw as any;
    const observations = extractBLSObservations(response);

    return observations
      .filter((obs) => obs.period !== "M13")
      .map((obs) => {
        const month = obs.period.replace("M", "");
        const date = `${obs.year}-${month.padStart(2, "0")}`;

        return BLSUnemploymentData.parse({
          date,
          value: parseBLSValue(obs.value),
          seriesId: obs.seriesID,
          period: obs.period,
          periodName: obs.periodName,
        });
      });
  }
}
