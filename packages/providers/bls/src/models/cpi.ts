import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { blsFetch, extractBLSObservations, parseBLSValue } from "../utils/api";

// CPI-U All Urban Consumers, All Items - SA (Series ID: CUSR0000SA0)
export const BLSCpiQueryParams = z.object({
  startYear: z.string().optional(),
  endYear: z.string().optional(),
});

export const BLSCpiData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string(),
  period: z.string().nullish(),
  periodName: z.string().nullish(),
  provider: z.literal("bls").default("bls"),
});

export type BLSCpiData = z.infer<typeof BLSCpiData>;

const CPI_SERIES_IDS = ["CUSR0000SA0"];

/**
 * Fetch Consumer Price Index (CPI) data from BLS.
 * Uses CPI-U All Urban Consumers series (CUSR0000SA0).
 */
export class BLSCpiFetcher extends AbstractFetcher<
  typeof BLSCpiQueryParams,
  typeof BLSCpiData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof BLSCpiQueryParams>) {
    return {
      startYear: params.startYear ?? String(new Date().getFullYear() - 1),
      endYear: params.endYear ?? String(new Date().getFullYear()),
    };
  }

  async extractData(
    query: z.infer<typeof BLSCpiQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    return blsFetch(
      CPI_SERIES_IDS,
      credentials.bls_api_key,
      query.startYear,
      query.endYear,
    );
  }

  async transformData(raw: unknown): Promise<BLSCpiData[]> {
    const response = raw as any;
    const observations = extractBLSObservations(response);

    return observations
      .filter((obs) => obs.period !== "M13") // Skip annual averages
      .map((obs) => {
        // Build date from year and period (e.g., "202401" → "2024-01")
        const month = obs.period.replace("M", "");
        const date = `${obs.year}-${month.padStart(2, "0")}`;

        return BLSCpiData.parse({
          date,
          value: parseBLSValue(obs.value),
          seriesId: obs.seriesID,
          period: obs.period,
          periodName: obs.periodName,
        });
      });
  }
}
