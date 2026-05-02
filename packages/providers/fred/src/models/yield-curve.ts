import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fredFetch, parseFredValue } from "../utils/api";
import type { FredSeriesResponse } from "../utils/api";

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

export const FredYieldCurveData = z.object({
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

export type FredYieldCurveData = z.infer<typeof FredYieldCurveData>;

export const FredYieldCurveQueryParams = z.object({}).strict();

export type FredYieldCurveQueryParams = z.infer<typeof FredYieldCurveQueryParams>;

export class FredYieldCurveFetcher extends AbstractFetcher<
  typeof FredYieldCurveQueryParams,
  typeof FredYieldCurveData
> {
  requireCredentials = true;

  async transformQuery(
    _params: z.input<typeof FredYieldCurveQueryParams>,
  ) {
    return {};
  }

  async extractData(
    _query: z.infer<typeof FredYieldCurveQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.fred_api_key;
    const results: Record<string, string> = {};

    for (const seriesId of Object.keys(TENOR_SERIES)) {
      const response = await fredFetch<FredSeriesResponse>(
        "/series/observations",
        apiKey,
        {
          series_id: seriesId,
          sort_order: "desc",
          limit: 1,
        },
      );
      const obs = response.observations?.[0];
      if (obs) {
        results[seriesId] = obs.date;
        results[`${seriesId}_value`] = obs.value;
      }
    }

    return results;
  }

  async transformData(
    raw: unknown,
  ) {
    const results = raw as Record<string, string>;

    let latestDate = "";
    for (const seriesId of Object.keys(TENOR_SERIES)) {
      const date = results[seriesId];
      if (date && date > latestDate) {
        latestDate = date;
      }
    }

    if (!latestDate) {
      throw new EmptyDataError("No yield curve data returned from FRED");
    }

    const entry: Record<string, number | null | string> = { date: latestDate };

    for (const seriesId of Object.keys(TENOR_SERIES)) {
      const obsDate = results[seriesId];
      if (obsDate === latestDate) {
        const fieldName = `rate${TENOR_SERIES[seriesId]!}`;
        (entry as any)[fieldName] = parseFredValue(results[`${seriesId}_value`] ?? "");
      }
    }

    return [FredYieldCurveData.parse(entry)];
  }
}
