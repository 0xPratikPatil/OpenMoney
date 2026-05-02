import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchSAJson, type SAAnalystRating } from "../utils/api";

export const SAAnalystRatingsQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.number().int().min(1).max(50).default(20),
});

export const SAAnalystRatingsData = z.object({
  ticker: z.string().nullish(),
  rating: z.string().nullish(),
  priceTarget: z.number().nullish(),
  firm: z.string().nullish(),
  analyst: z.string().nullish(),
  date: z.coerce.date().nullish(),
  provider: z.literal("seeking_alpha").default("seeking_alpha"),
});

export type SAAnalystRatingsData = z.infer<typeof SAAnalystRatingsData>;

export class SAAnalystRatingsFetcher extends AbstractFetcher<
  typeof SAAnalystRatingsQueryParams,
  typeof SAAnalystRatingsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SAAnalystRatingsQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof SAAnalystRatingsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const items = await fetchSAJson<SAAnalystRating>(
      `/api/v3/analyst-ratings/${query.symbol}`,
      { limit: query.limit },
    );
    return items;
  }

  async transformData(raw: unknown) {
    const items = raw as SAAnalystRating[];
    return items.map((item) =>
      SAAnalystRatingsData.parse({
        ticker: item.ticker ?? null,
        rating: item.rating ?? null,
        priceTarget: item.priceTarget ?? null,
        firm: item.firm ?? null,
        analyst: item.analyst ?? null,
        date: item.date ? new Date(item.date) : null,
      }),
    );
  }
}
