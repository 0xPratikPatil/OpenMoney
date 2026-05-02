import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchEquitySnapshot } from "../utils/api";

export const PolygonEquityQuoteData = z.object({
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
  provider: z.literal("polygon").default("polygon"),
});

export type PolygonEquityQuoteData = z.infer<typeof PolygonEquityQuoteData>;

export const PolygonEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type PolygonEquityQuoteQueryParams = z.infer<typeof PolygonEquityQuoteQueryParams>;

/**
 * Fetcher for real-time equity quotes from Polygon.io.
 * Uses /v2/snapshot/locale/us/markets/stocks/tickers/{symbol}.
 */
export class PolygonEquityQuoteFetcher extends AbstractFetcher<
  typeof PolygonEquityQuoteQueryParams,
  typeof PolygonEquityQuoteData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof PolygonEquityQuoteQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof PolygonEquityQuoteQueryParams>,
    credentials: Record<string, string>,
  ) {
    const snapshot = await fetchEquitySnapshot(query.symbol, credentials);
    if (!snapshot) throw new EmptyDataError(`No quote data for ${query.symbol}`);
    return snapshot;
  }

  async transformData(raw: unknown) {
    const t = raw as any;
    return [
      PolygonEquityQuoteData.parse({
        symbol: t.ticker,
        price: t.lastTrade?.p ?? t.day?.c ?? null,
        change: t.todaysChange ?? null,
        changePercent: t.todaysChangePerc ?? null,
        volume: t.day?.v ?? null,
        dayHigh: t.day?.h ?? null,
        dayLow: t.day?.l ?? null,
        open: t.day?.o ?? null,
        previousClose: t.prevDay?.c ?? null,
        bid: t.lastQuote?.P ?? null,
        ask: t.lastQuote?.p ?? null,
        bidSize: t.lastQuote?.S ?? null,
        askSize: t.lastQuote?.s ?? null,
        fiftyTwoWeekHigh: t.fiftyTwoWeek?.high ?? null,
        fiftyTwoWeekLow: t.fiftyTwoWeek?.low ?? null,
        marketCap: t.marketCap ?? null,
        name: t.name ?? null,
      }),
    ];
  }
}
