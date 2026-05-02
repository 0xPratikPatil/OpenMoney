import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fredFetch, parseFredValue } from "../utils/api";
import type { FredSeriesResponse } from "../utils/api";

export const FredSeriesData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string(),
  provider: z.literal("fred").default("fred"),
});

export type FredSeriesData = z.infer<typeof FredSeriesData>;

export const FredSeriesQueryParams = z.object({
  seriesId: z.string().min(1, "seriesId is required"),
  observationStart: z.string().optional(),
  observationEnd: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  limit: z.number().default(100000),
  frequency: z.enum(["d", "w", "bw", "m", "q", "sa", "a"]).optional(),
  units: z.enum(["lin", "chg", "ch1", "pch", "pc1", "pca", "cch", "cca", "log"]).optional(),
});

export type FredSeriesQueryParams = z.infer<typeof FredSeriesQueryParams>;

export class FredSeriesFetcher extends AbstractFetcher<
  typeof FredSeriesQueryParams,
  typeof FredSeriesData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FredSeriesQueryParams>,
  ) {
    return {
      seriesId: params.seriesId,
      observationStart: params.observationStart,
      observationEnd: params.observationEnd,
      sortOrder: params.sortOrder ?? "asc",
      limit: params.limit ?? 100000,
      frequency: params.frequency,
      units: params.units,
    };
  }

  async extractData(
    query: z.infer<typeof FredSeriesQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.fred_api_key;
    const response = await fredFetch<FredSeriesResponse>(
      "/series/observations",
      apiKey,
      {
        series_id: query.seriesId,
        sort_order: query.sortOrder,
        limit: query.limit,
        observation_start: query.observationStart,
        observation_end: query.observationEnd,
        frequency: query.frequency,
        units: query.units,
      },
    );
    return response;
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof FredSeriesQueryParams>,
  ) {
    const response = raw as FredSeriesResponse;
    if (!response.observations || response.observations.length === 0) {
      throw new EmptyDataError("No FRED series observations returned");
    }
    const seriesId = query?.seriesId ?? "";
    return response.observations.map((obs) =>
      FredSeriesData.parse({
        date: obs.date,
        value: parseFredValue(obs.value),
        seriesId,
      }),
    );
  }
}
