import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fredFetch } from "../utils/api";
import type { FredSearchResponse } from "../utils/api";

export const FredSearchData = z.object({
  seriesId: z.string(),
  title: z.string(),
  frequency: z.string(),
  units: z.string(),
  seasonalAdjustment: z.string(),
  observationStart: z.string(),
  observationEnd: z.string(),
  popularity: z.number().nullish(),
  provider: z.literal("fred").default("fred"),
});

export type FredSearchData = z.infer<typeof FredSearchData>;

export const FredSearchQueryParams = z.object({
  text: z.string().min(1, "Search text is required"),
  limit: z.number().default(50),
  orderBy: z.enum(["search_rank", "series_id", "title", "popularity"]).default("search_rank"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type FredSearchQueryParams = z.infer<typeof FredSearchQueryParams>;

export class FredSearchFetcher extends AbstractFetcher<
  typeof FredSearchQueryParams,
  typeof FredSearchData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FredSearchQueryParams>,
  ) {
    return {
      text: params.text,
      limit: params.limit ?? 50,
      orderBy: params.orderBy ?? "search_rank",
      sortOrder: params.sortOrder ?? "desc",
    };
  }

  async extractData(
    query: z.infer<typeof FredSearchQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.fred_api_key;
    return fredFetch<FredSearchResponse>(
      "/series/search",
      apiKey,
      {
        search_text: query.text,
        limit: query.limit,
        order_by: query.orderBy,
        sort_order: query.sortOrder,
      },
    );
  }

  async transformData(
    raw: unknown,
  ) {
    const response = raw as FredSearchResponse;
    if (!response.seriess || response.seriess.length === 0) {
      throw new EmptyDataError("No FRED search results returned");
    }
    return response.seriess.map((s) =>
      FredSearchData.parse({
        seriesId: s.id,
        title: s.title,
        frequency: s.frequency,
        units: s.units,
        seasonalAdjustment: s.seasonal_adjustment,
        observationStart: s.observation_start,
        observationEnd: s.observation_end,
        popularity: s.popularity ?? null,
      }),
    );
  }
}
