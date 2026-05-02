import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { blsFetch, extractBLSObservations, parseBLSValue } from "../utils/api";

// CES0000000001 = Total Nonfarm Payrolls (Seasonally Adjusted)
export const BLSEmploymentQueryParams = z.object({
  startYear: z.string().optional(),
  endYear: z.string().optional(),
});

export const BLSEmploymentData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string(),
  period: z.string().nullish(),
  periodName: z.string().nullish(),
  provider: z.literal("bls").default("bls"),
});

export type BLSEmploymentData = z.infer<typeof BLSEmploymentData>;

const EMPLOYMENT_SERIES_IDS = ["CES0000000001"];

/**
 * Fetch Employment/Payroll data from BLS.
 * Uses CES (Current Employment Statistics) series CES0000000001.
 */
export class BLSEmploymentFetcher extends AbstractFetcher<
  typeof BLSEmploymentQueryParams,
  typeof BLSEmploymentData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof BLSEmploymentQueryParams>) {
    return {
      startYear: params.startYear ?? String(new Date().getFullYear() - 1),
      endYear: params.endYear ?? String(new Date().getFullYear()),
    };
  }

  async extractData(
    query: z.infer<typeof BLSEmploymentQueryParams>,
    credentials: Record<string, string>,
  ) {
    return blsFetch(
      EMPLOYMENT_SERIES_IDS,
      credentials.bls_api_key,
      query.startYear,
      query.endYear,
    );
  }

  async transformData(raw: unknown) {
    const response = raw as any;
    const observations = extractBLSObservations(response);

    return observations
      .filter((obs) => obs.period !== "M13")
      .map((obs) => {
        const month = obs.period.replace("M", "");
        const date = `${obs.year}-${month.padStart(2, "0")}`;

        return BLSEmploymentData.parse({
          date,
          value: parseBLSValue(obs.value),
          seriesId: obs.seriesID,
          period: obs.period,
          periodName: obs.periodName,
        });
      });
  }
}
