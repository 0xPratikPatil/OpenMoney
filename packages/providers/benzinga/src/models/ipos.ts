import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBenzinga, type BenzingaIPOItem } from "../utils/api";

export const BenzingaIposQueryParams = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(["priced", "filed", "withdrawn", "upcoming"]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const BenzingaIposData = z.object({
  id: z.string().nullish(),
  ticker: z.string().nullish(),
  company: z.string().nullish(),
  exchange: z.string().nullish(),
  ipoDate: z.coerce.date().nullish(),
  priceRangeLow: z.number().nullish(),
  priceRangeHigh: z.number().nullish(),
  shares: z.number().nullish(),
  status: z.string().nullish(),
  provider: z.literal("benzinga").default("benzinga"),
});

export type BenzingaIposData = z.infer<typeof BenzingaIposData>;

export class BenzingaIposFetcher extends AbstractFetcher<
  typeof BenzingaIposQueryParams,
  typeof BenzingaIposData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof BenzingaIposQueryParams>) {
    return {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      status: params.status,
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof BenzingaIposQueryParams>,
    credentials: Record<string, string>,
  ) {
    const items = await fetchBenzinga<BenzingaIPOItem>("/calendar/ipos", {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      status: query.status,
      pageSize: query.limit,
    }, credentials);
    return items;
  }

  async transformData(raw: unknown) {
    const items = raw as BenzingaIPOItem[];
    return items.map((item) =>
      BenzingaIposData.parse({
        id: item.id ?? null,
        ticker: item.ticker ?? null,
        company: item.company ?? null,
        exchange: item.exchange ?? null,
        ipoDate: item.ipo_date ? new Date(item.ipo_date) : null,
        priceRangeLow: item.price_range_low ?? null,
        priceRangeHigh: item.price_range_high ?? null,
        shares: item.shares ?? null,
        status: item.status ?? null,
      }),
    );
  }
}
