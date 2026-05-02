import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { blsFetch, extractBLSObservations, parseBLSValue } from "../utils/api";

// PCUOMFG--OMFG-- = PPI for Manufacturing (Commodity data)
export const BLSppiQueryParams = z.object({
  startYear: z.string().optional(),
  endYear: z.string().optional(),
});

export const BLSppiData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string(),
  period: z.string().nullish(),
  periodName: z.string().nullish(),
  provider: z.literal("bls").default("bls"),
});

export type BLSppiData = z.infer<typeof BLSppiData>;

const PPI_SERIES_IDS = ["PCUOMFG--OMFG--"];

/**
 * Fetch Producer Price Index (PPI) data from BLS.
 * Uses PPI Commodity data series for manufacturing.
 */
export class BLSppiFetcher extends AbstractFetcher<
  typeof BLSppiQueryParams,
  typeof BLSppiData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof BLSppiQueryParams>) {
    return {
      startYear: params.startYear ?? String(new Date().getFullYear() - 1),
      endYear: params.endYear ?? String(new Date().getFullYear()),
    };
  }

  async extractData(
    query: z.infer<typeof BLSppiQueryParams>,
    credentials: Record<string, string>,
  ) {
    return blsFetch(
      PPI_SERIES_IDS,
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

        return BLSppiData.parse({
          date,
          value: parseBLSValue(obs.value),
          seriesId: obs.seriesID,
          period: obs.period,
          periodName: obs.periodName,
        });
      });
  }
}
