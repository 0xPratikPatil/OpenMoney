import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { teFetch, parseTEValue } from "../utils/api";
import type { TECountryIndicator } from "../utils/api";

export const TECountryIndicatorsData = z.object({
  country: z.string(),
  category: z.string().nullish(),
  title: z.string().nullish(),
  latestValue: z.number().nullish(),
  latestValueDate: z.string().nullish(),
  frequency: z.string().nullish(),
  unit: z.string().nullish(),
  previousValue: z.number().nullish(),
  previousValueDate: z.string().nullish(),
  provider: z.literal("tradingeconomics").default("tradingeconomics"),
});

export type TECountryIndicatorsData = z.infer<typeof TECountryIndicatorsData>;

export const TECountryIndicatorsQueryParams = z.object({
  country: z.string().min(1, "Country is required"),
  indicator: z.string().optional(),
});

export type TECountryIndicatorsQueryParams = z.infer<typeof TECountryIndicatorsQueryParams>;

/**
 * Fetch country economic indicators from Trading Economics.
 */
export class TECountryIndicatorsFetcher extends AbstractFetcher<
  typeof TECountryIndicatorsQueryParams,
  typeof TECountryIndicatorsData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TECountryIndicatorsQueryParams>,
  ): Promise<z.input<typeof TECountryIndicatorsQueryParams>> {
    return {
      country: params.country,
      indicator: params.indicator,
    };
  }

  async extractData(
    query: z.infer<typeof TECountryIndicatorsQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.tradingeconomics_api_key;
    const path = query.indicator
      ? `/country/${query.country}/${query.indicator}`
      : `/country/${query.country}`;
    return teFetch<TECountryIndicator[]>(path, apiKey);
  }

  async transformData(
    raw: unknown,
  ): Promise<TECountryIndicatorsData[]> {
    const indicators = raw as TECountryIndicator[];
    if (!indicators || indicators.length === 0) {
      throw new EmptyDataError("No Trading Economics indicators returned");
    }
    return indicators.map((i) =>
      TECountryIndicatorsData.parse({
        country: i.Country,
        category: i.Category ?? null,
        title: i.Title ?? null,
        latestValue: parseTEValue(i.LatestValue),
        latestValueDate: i.LatestValueDate ?? null,
        frequency: i.Frequency ?? null,
        unit: i.Unit ?? null,
        previousValue: parseTEValue(i.PreviousValue),
        previousValueDate: i.PreviousValueDate ?? null,
      }),
    );
  }
}
