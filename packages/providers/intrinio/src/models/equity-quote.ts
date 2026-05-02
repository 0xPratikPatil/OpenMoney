import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchRealtimePrice } from "../utils/api";

export const IntrinioEquityQuoteData = z.object({
  symbol: z.string(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  volume: z.number().nullish(),
  dayHigh: z.number().nullish(),
  dayLow: z.number().nullish(),
  open: z.number().nullish(),
  previousClose: z.number().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  bidSize: z.number().nullish(),
  askSize: z.number().nullish(),
  fiftyTwoWeekHigh: z.number().nullish(),
  fiftyTwoWeekLow: z.number().nullish(),
  marketCap: z.number().nullish(),
  name: z.string().nullish(),
  lastTradeTimestamp: z.string().nullish(),
  provider: z.literal("intrinio").default("intrinio"),
});

export type IntrinioEquityQuoteData = z.infer<typeof IntrinioEquityQuoteData>;

export const IntrinioEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type IntrinioEquityQuoteQueryParams = z.infer<typeof IntrinioEquityQuoteQueryParams>;

/**
 * Fetcher for real-time equity quotes from Intrinio.
 * Uses /securities/{symbol}/prices/realtime.
 */
export class IntrinioEquityQuoteFetcher extends AbstractFetcher<
  typeof IntrinioEquityQuoteQueryParams,
  typeof IntrinioEquityQuoteData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof IntrinioEquityQuoteQueryParams>,
  ): Promise<z.input<typeof IntrinioEquityQuoteQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof IntrinioEquityQuoteQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const quote = await fetchRealtimePrice(query.symbol, credentials);
    if (!quote) throw new EmptyDataError(`No realtime price data for ${query.symbol}`);
    return quote;
  }

  async transformData(raw: unknown): Promise<IntrinioEquityQuoteData[]> {
    const q = raw as Record<string, unknown>;
    return [
      IntrinioEquityQuoteData.parse({
        symbol: q.ticker ?? q.symbol,
        price: q.last_price ?? q.adj_LastPrice ?? null,
        change: q.change ?? null,
        changePercent: q.percent_change ?? null,
        volume: q.volume ?? null,
        dayHigh: q.day_high ?? q.high ?? null,
        dayLow: q.day_low ?? q.low ?? null,
        open: q.open ?? null,
        previousClose: q.previousClose ?? q.adj_previousClose ?? null,
        bid: q.bid_price ?? q.bid ?? null,
        ask: q.ask_price ?? q.ask ?? null,
        bidSize: q.bid_size ?? null,
        askSize: q.ask_size ?? null,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
        marketCap: q.market_cap ?? null,
        name: q.company_name ?? null,
        lastTradeTimestamp: q.last_tradeTimestamp ?? null,
      }),
    ];
  }
}
