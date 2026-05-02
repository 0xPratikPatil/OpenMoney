import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuotes } from "../utils/api";

export const TradierEquityQuoteData = z.object({
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
  week52High: z.number().nullish(),
  week52Low: z.number().nullish(),
  marketCap: z.number().nullish(),
  description: z.string().nullish(),
  provider: z.literal("tradier").default("tradier"),
});

export type TradierEquityQuoteData = z.infer<typeof TradierEquityQuoteData>;

export const TradierEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TradierEquityQuoteQueryParams = z.infer<typeof TradierEquityQuoteQueryParams>;

/**
 * Fetcher for real-time equity quotes from Tradier.
 * Uses /markets/quotes.
 */
export class TradierEquityQuoteFetcher extends AbstractFetcher<
  typeof TradierEquityQuoteQueryParams,
  typeof TradierEquityQuoteData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TradierEquityQuoteQueryParams>,
  ): Promise<z.input<typeof TradierEquityQuoteQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TradierEquityQuoteQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const symbols = query.symbol.includes(",")
      ? query.symbol.split(",").map((s) => s.trim())
      : [query.symbol];
    const quotes = await fetchQuotes(symbols, credentials);
    if (quotes.length === 0) throw new EmptyDataError(`No quote data for ${query.symbol}`);
    return quotes;
  }

  async transformData(raw: unknown): Promise<TradierEquityQuoteData[]> {
    const quotes = raw as Array<Record<string, unknown>>;
    return quotes.map((q) =>
      TradierEquityQuoteData.parse({
        symbol: q.symbol,
        price: q.last ?? null,
        change: q.change ?? null,
        changePercent: q.change_percentage ?? null,
        volume: q.volume ?? null,
        dayHigh: q.high ?? null,
        dayLow: q.low ?? null,
        open: q.open ?? null,
        previousClose: q.prevclose ?? null,
        bid: q.bid ?? null,
        ask: q.ask ?? null,
        bidSize: q.bidsz ?? null,
        askSize: q.asksz ?? null,
        week52High: q.week_52_high ?? null,
        week52Low: q.week_52_low ?? null,
        marketCap: q.market_cap ?? null,
        description: q.description ?? null,
      }),
    );
  }
}
