import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchQuote } from "../utils/api";

export const TmxEquityQuoteData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
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
  yearHigh: z.number().nullish(),
  yearLow: z.number().nullish(),
  marketCap: z.number().nullish(),
  peRatio: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEquityQuoteData = z.infer<typeof TmxEquityQuoteData>;

export const TmxEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxEquityQuoteQueryParams = z.infer<typeof TmxEquityQuoteQueryParams>;

/**
 * Fetcher for real-time equity quotes from TMX Money.
 * Endpoint: GET /api/quote/{symbol}
 */
export class TmxEquityQuoteFetcher extends AbstractFetcher<
  typeof TmxEquityQuoteQueryParams,
  typeof TmxEquityQuoteData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEquityQuoteQueryParams>,
  ): Promise<z.input<typeof TmxEquityQuoteQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxEquityQuoteQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchQuote(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxEquityQuoteData[]> {
    const quote = raw as Record<string, unknown>;
    if (!quote || !quote.symbol) return [];

    return [
      TmxEquityQuoteData.parse({
        symbol: quote.symbol,
        name: quote.name ?? quote.companyName,
        price: quote.price ?? quote.lastPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        dayHigh: quote.dayHigh ?? quote.high,
        dayLow: quote.dayLow ?? quote.low,
        open: quote.open,
        previousClose: quote.previousClose ?? quote.prevClose,
        bid: quote.bid,
        ask: quote.ask,
        yearHigh: quote.yearHigh ?? (quote as Record<string, unknown>)["52WeekHigh"] as number | undefined,
        yearLow: quote.yearLow ?? (quote as Record<string, unknown>)["52WeekLow"] as number | undefined,
        marketCap: quote.marketCap,
        peRatio: quote.peRatio ?? quote.pe,
      }),
    ];
  }
}
