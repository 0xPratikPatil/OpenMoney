import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import type { YahooFinanceQuote } from "../utils/api";
import { fetchQuotes } from "../utils/api";

// Standard schema for equity quote (consumed by API)
export const YFinanceEquityQuoteData = z.object({
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
  fiftyTwoWeekHigh: z.number().nullish(),
  fiftyTwoWeekLow: z.number().nullish(),
  marketCap: z.number().nullish(),
  peRatio: z.number().nullish(),
  dividendYield: z.number().nullish(),
  name: z.string().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceEquityQuoteData = z.infer<typeof YFinanceEquityQuoteData>;

// Query params schema
export const YFinanceEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type YFinanceEquityQuoteQueryParams = z.infer<typeof YFinanceEquityQuoteQueryParams>;

/**
 * Fetcher for real-time equity quotes from Yahoo Finance.
 * Implements the TET (Transform-Extract-Transform) pattern from OpenBB.
 */
export class YFinanceEquityQuoteFetcher extends AbstractFetcher<
  typeof YFinanceEquityQuoteQueryParams,
  typeof YFinanceEquityQuoteData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof YFinanceEquityQuoteQueryParams>,
  ): Promise<z.input<typeof YFinanceEquityQuoteQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceEquityQuoteQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const symbols = query.symbol.includes(",")
      ? query.symbol.split(",").map((s) => s.trim())
      : [query.symbol];
    return fetchQuotes(symbols);
  }

  async transformData(
    raw: unknown,
  ): Promise<YFinanceEquityQuoteData[]> {
    const quotes = raw as Record<string, YahooFinanceQuote>;
    return Object.values(quotes)
      .filter((q) => q.symbol)
      .map((q) =>
        YFinanceEquityQuoteData.parse({
          symbol: q.symbol,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          volume: q.regularMarketVolume,
          dayHigh: q.regularMarketDayHigh,
          dayLow: q.regularMarketDayLow,
          open: q.regularMarketOpen,
          previousClose: q.regularMarketPreviousClose,
          bid: q.bid,
          ask: q.ask,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow,
          marketCap: q.marketCap,
          peRatio: q.trailingPE,
          dividendYield: q.dividendYield,
          name: q.shortName ?? q.longName,
        }),
      );
  }
}
