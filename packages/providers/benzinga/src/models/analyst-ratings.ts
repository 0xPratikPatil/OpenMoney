import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBenzinga, type BenzingaAnalystRating } from "../utils/api";

export const BenzingaAnalystRatingsQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.number().int().min(1).max(100).default(20),
  firm: z.string().optional(),
  analyst: z.string().optional(),
  ratingDateFrom: z.string().optional(),
  ratingDateTo: z.string().optional(),
});

export const BenzingaAnalystRatingsData = z.object({
  id: z.string().nullish(),
  ticker: z.string().nullish(),
  analyst: z.string().nullish(),
  firm: z.string().nullish(),
  action: z.string().nullish(),
  ratingFrom: z.string().nullish(),
  ratingTo: z.string().nullish(),
  priceTargetFrom: z.number().nullish(),
  priceTargetTo: z.number().nullish(),
  ratingDate: z.coerce.date().nullish(),
  provider: z.literal("benzinga").default("benzinga"),
});

export type BenzingaAnalystRatingsData = z.infer<typeof BenzingaAnalystRatingsData>;

export class BenzingaAnalystRatingsFetcher extends AbstractFetcher<
  typeof BenzingaAnalystRatingsQueryParams,
  typeof BenzingaAnalystRatingsData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof BenzingaAnalystRatingsQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 20,
      firm: params.firm,
      analyst: params.analyst,
      ratingDateFrom: params.ratingDateFrom,
      ratingDateTo: params.ratingDateTo,
    };
  }

  async extractData(
    query: z.infer<typeof BenzingaAnalystRatingsQueryParams>,
    credentials: Record<string, string>,
  ) {
    const items = await fetchBenzinga<BenzingaAnalystRating>("/analyst/ratings", {
      tickers: query.symbol,
      pageSize: query.limit,
      firm: query.firm,
      analyst: query.analyst,
      dateFrom: query.ratingDateFrom,
      dateTo: query.ratingDateTo,
    }, credentials);
    return items;
  }

  async transformData(raw: unknown) {
    const items = raw as BenzingaAnalystRating[];
    return items.map((item) =>
      BenzingaAnalystRatingsData.parse({
        id: item.id ?? null,
        ticker: item.ticker ?? null,
        analyst: item.analyst ?? null,
        firm: item.firm ?? null,
        action: item.action ?? null,
        ratingFrom: item.rating_from ?? null,
        ratingTo: item.rating_to ?? null,
        priceTargetFrom: item.price_target_from ?? null,
        priceTargetTo: item.price_target_to ?? null,
        ratingDate: item.rating_date ? new Date(item.rating_date) : null,
      }),
    );
  }
}
