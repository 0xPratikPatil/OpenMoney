import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fredFetch, parseFredValue } from "../utils/api";
import type { FredSeriesResponse } from "../utils/api";

const INDICATOR_MAP: Record<string, string> = {
  REAL_GDP: "GDPC1",
  GDP_GROWTH: "A191RL1Q225SBEA",
  CPI: "CPIAUCSL",
  UNEMPLOYMENT: "UNRATE",
  FED_FUNDS: "FEDFUNDS",
  NONFARM_PAYROLLS: "PAYEMS",
  CONSUMER_SENTIMENT: "UMCSENT",
};

export const economicIndicatorSchema = z.enum([
  "REAL_GDP",
  "GDP_GROWTH",
  "CPI",
  "UNEMPLOYMENT",
  "FED_FUNDS",
  "NONFARM_PAYROLLS",
  "CONSUMER_SENTIMENT",
]);

export const FredEconomicDataData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  indicator: z.string(),
  seriesId: z.string(),
  provider: z.literal("fred").default("fred"),
});

export type FredEconomicDataData = z.infer<typeof FredEconomicDataData>;

export const FredEconomicDataQueryParams = z.object({
  indicator: economicIndicatorSchema,
  observationStart: z.string().optional(),
  observationEnd: z.string().optional(),
  limit: z.number().default(100000),
});

export type FredEconomicDataQueryParams = z.infer<typeof FredEconomicDataQueryParams>;

export class FredEconomicDataFetcher extends AbstractFetcher<
  typeof FredEconomicDataQueryParams,
  typeof FredEconomicDataData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FredEconomicDataQueryParams>,
  ): Promise<z.input<typeof FredEconomicDataQueryParams>> {
    return {
      indicator: params.indicator,
      observationStart: params.observationStart,
      observationEnd: params.observationEnd,
      limit: params.limit ?? 100000,
    };
  }

  async extractData(
    query: z.infer<typeof FredEconomicDataQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.fred_api_key;
    const seriesId = INDICATOR_MAP[query.indicator] ?? "";
    return fredFetch<FredSeriesResponse>(
      "/series/observations",
      apiKey,
      {
        series_id: seriesId,
        sort_order: "asc",
        limit: query.limit,
        observation_start: query.observationStart,
        observation_end: query.observationEnd,
      },
    );
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof FredEconomicDataQueryParams>,
  ): Promise<FredEconomicDataData[]> {
    const response = raw as FredSeriesResponse;
    if (!response.observations || response.observations.length === 0) {
      throw new EmptyDataError("No economic data returned from FRED");
    }
    const indicator = query?.indicator ?? "";
    const seriesId = INDICATOR_MAP[indicator] ?? "";
    return response.observations.map((obs) =>
      FredEconomicDataData.parse({
        date: obs.date,
        value: parseFredValue(obs.value),
        indicator,
        seriesId,
      }),
    );
  }
}
