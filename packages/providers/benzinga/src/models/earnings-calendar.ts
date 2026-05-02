import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBenzinga, type BenzingaEarningsItem } from "../utils/api";

export const BenzingaEarningsCalendarQueryParams = z.object({
  symbol: z.string().optional().transform((s) => s?.toUpperCase()),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const BenzingaEarningsCalendarData = z.object({
  id: z.string().nullish(),
  ticker: z.string().nullish(),
  company: z.string().nullish(),
  date: z.coerce.date().nullish(),
  time: z.string().nullish(),
  epsEstimate: z.number().nullish(),
  epsActual: z.number().nullish(),
  revenueEstimate: z.number().nullish(),
  revenueActual: z.number().nullish(),
  provider: z.literal("benzinga").default("benzinga"),
});

export type BenzingaEarningsCalendarData = z.infer<typeof BenzingaEarningsCalendarData>;

export class BenzingaEarningsCalendarFetcher extends AbstractFetcher<
  typeof BenzingaEarningsCalendarQueryParams,
  typeof BenzingaEarningsCalendarData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof BenzingaEarningsCalendarQueryParams>) {
    return {
      symbol: params.symbol,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof BenzingaEarningsCalendarQueryParams>,
    credentials: Record<string, string>,
  ) {
    const items = await fetchBenzinga<BenzingaEarningsItem>("/calendar/earnings", {
      tickers: query.symbol,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      pageSize: query.limit,
    }, credentials);
    return items;
  }

  async transformData(raw: unknown) {
    const items = raw as BenzingaEarningsItem[];
    return items.map((item) =>
      BenzingaEarningsCalendarData.parse({
        id: item.id ?? null,
        ticker: item.ticker ?? null,
        company: item.company ?? null,
        date: item.date ? new Date(item.date) : null,
        time: item.time ?? null,
        epsEstimate: item.eps_estimate ?? null,
        epsActual: item.eps_actual ?? null,
        revenueEstimate: item.revenue_estimate ?? null,
        revenueActual: item.revenue_actual ?? null,
      }),
    );
  }
}
