import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { teFetch, parseTEValue } from "../utils/api";
import type { TEForecast } from "../utils/api";

export const TEForecastData = z.object({
  country: z.string(),
  category: z.string().nullish(),
  title: z.string().nullish(),
  latestValue: z.number().nullish(),
  latestValueDate: z.string().nullish(),
  frequency: z.string().nullish(),
  unit: z.string().nullish(),
  q1: z.number().nullish(),
  q2: z.number().nullish(),
  q3: z.number().nullish(),
  q4: z.number().nullish(),
  provider: z.literal("tradingeconomics").default("tradingeconomics"),
});

export type TEForecastData = z.infer<typeof TEForecastData>;

export const TEForecastQueryParams = z.object({
  country: z.string().min(1, "Country is required"),
  indicator: z.string().optional(),
});

export type TEForecastQueryParams = z.infer<typeof TEForecastQueryParams>;

/**
 * Fetch economic forecasts from Trading Economics.
 */
export class TEForecastFetcher extends AbstractFetcher<
  typeof TEForecastQueryParams,
  typeof TEForecastData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TEForecastQueryParams>,
  ): Promise<z.input<typeof TEForecastQueryParams>> {
    return {
      country: params.country,
      indicator: params.indicator,
    };
  }

  async extractData(
    query: z.infer<typeof TEForecastQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.tradingeconomics_api_key;
    const path = query.indicator
      ? `/forecast/country/${query.country}/${query.indicator}`
      : `/forecast/country/${query.country}`;
    return teFetch<TEForecast[]>(path, apiKey);
  }

  async transformData(
    raw: unknown,
  ): Promise<TEForecastData[]> {
    const forecasts = raw as TEForecast[];
    if (!forecasts || forecasts.length === 0) {
      throw new EmptyDataError("No Trading Economics forecasts returned");
    }
    return forecasts.map((f) =>
      TEForecastData.parse({
        country: f.Country,
        category: f.Category ?? null,
        title: f.Title ?? null,
        latestValue: parseTEValue(f.LatestValue),
        latestValueDate: f.LatestValueDate ?? null,
        frequency: f.Frequency ?? null,
        unit: f.Unit ?? null,
        q1: parseTEValue(f.q1),
        q2: parseTEValue(f.q2),
        q3: parseTEValue(f.q3),
        q4: parseTEValue(f.q4),
      }),
    );
  }
}
