import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchIEXQuote } from "../utils/api";

export const TiingoEquityQuoteData = z.object({
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
  mid: z.number().nullish(),
  lastSaleTimestamp: z.string().nullish(),
  provider: z.literal("tiingo").default("tiingo"),
});

export type TiingoEquityQuoteData = z.infer<typeof TiingoEquityQuoteData>;

export const TiingoEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TiingoEquityQuoteQueryParams = z.infer<typeof TiingoEquityQuoteQueryParams>;

/**
 * Fetcher for real-time equity quotes from Tiingo IEX.
 * Uses /iex/{symbol}.
 */
export class TiingoEquityQuoteFetcher extends AbstractFetcher<
  typeof TiingoEquityQuoteQueryParams,
  typeof TiingoEquityQuoteData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TiingoEquityQuoteQueryParams>,
  ): Promise<z.input<typeof TiingoEquityQuoteQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TiingoEquityQuoteQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const quote = await fetchIEXQuote(query.symbol, credentials);
    if (!quote) throw new EmptyDataError(`No IEX quote data for ${query.symbol}`);
    return quote;
  }

  async transformData(raw: unknown): Promise<TiingoEquityQuoteData[]> {
    const q = raw as Record<string, unknown>;
    return [
      TiingoEquityQuoteData.parse({
        symbol: q.ticker,
        price: q.last ?? null,
        change: q.lastSize ?? null,
        changePercent: (q as any).changePercent ?? null,
        volume: q.volume ?? null,
        dayHigh: q.high ?? null,
        dayLow: q.low ?? null,
        open: q.open ?? null,
        previousClose: q.prevClose ?? null,
        bid: q.bidPrice ?? null,
        ask: q.askPrice ?? null,
        mid: q.mid ?? null,
        lastSaleTimestamp: q.timestamp ?? null,
      }),
    ];
  }
}
