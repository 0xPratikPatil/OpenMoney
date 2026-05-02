import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fredFetch, parseFredValue } from "../utils/api";
import type { FredSeriesResponse, FredObservation } from "../utils/api";

const TENOR_SERIES: Record<string, string> = {
  DGS1MO: "1mo",
  DGS3MO: "3mo",
  DGS6MO: "6mo",
  DGS1: "1yr",
  DGS2: "2yr",
  DGS5: "5yr",
  DGS7: "7yr",
  DGS10: "10yr",
  DGS20: "20yr",
  DGS30: "30yr",
};

export const FredTreasuryRatesData = z.object({
  date: z.string(),
  rate1mo: z.number().nullish(),
  rate3mo: z.number().nullish(),
  rate6mo: z.number().nullish(),
  rate1yr: z.number().nullish(),
  rate2yr: z.number().nullish(),
  rate5yr: z.number().nullish(),
  rate7yr: z.number().nullish(),
  rate10yr: z.number().nullish(),
  rate20yr: z.number().nullish(),
  rate30yr: z.number().nullish(),
  provider: z.literal("fred").default("fred"),
});

export type FredTreasuryRatesData = z.infer<typeof FredTreasuryRatesData>;

export const FredTreasuryRatesQueryParams = z.object({
  observationStart: z.string().optional(),
  observationEnd: z.string().optional(),
});

export type FredTreasuryRatesQueryParams = z.infer<typeof FredTreasuryRatesQueryParams>;

export class FredTreasuryRatesFetcher extends AbstractFetcher<
  typeof FredTreasuryRatesQueryParams,
  typeof FredTreasuryRatesData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FredTreasuryRatesQueryParams>,
  ): Promise<z.input<typeof FredTreasuryRatesQueryParams>> {
    return {
      observationStart: params.observationStart,
      observationEnd: params.observationEnd,
    };
  }

  async extractData(
    query: z.infer<typeof FredTreasuryRatesQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.fred_api_key;
    const results: Record<string, FredObservation[]> = {};

    for (const seriesId of Object.keys(TENOR_SERIES)) {
      const response = await fredFetch<FredSeriesResponse>(
        "/series/observations",
        apiKey,
        {
          series_id: seriesId,
          observation_start: query.observationStart,
          observation_end: query.observationEnd,
          sort_order: "asc",
        },
      );
      results[seriesId] = response.observations ?? [];
    }

    return results;
  }

  async transformData(
    raw: unknown,
  ): Promise<FredTreasuryRatesData[]> {
    const results = raw as Record<string, FredObservation[]>;

    const tenorKeys = Object.keys(TENOR_SERIES);
    const dateMap = new Map<string, Record<string, number | null>>();

    for (const seriesId of tenorKeys) {
      const fieldName = `rate${TENOR_SERIES[seriesId]!}`;
      const observations = results[seriesId] ?? [];
      for (const obs of observations) {
        if (!dateMap.has(obs.date)) {
          dateMap.set(obs.date, {});
        }
        const entry = dateMap.get(obs.date)!;
        (entry as any)[fieldName] = parseFredValue(obs.value);
      }
    }

    const sortedDates = Array.from(dateMap.keys()).sort();
    return sortedDates.map((date) => {
      const rates = dateMap.get(date);
      return FredTreasuryRatesData.parse({
        date,
        ...rates,
      });
    });
  }
}
