import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

/**
 * Futures Historical fetcher.
 * Port of OpenBB's YFinanceFuturesHistoricalFetcher.
 * Appends "=F" suffix to symbol for Yahoo Finance futures.
 */
export const YFinanceFuturesHistoricalQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
  range: z.enum(["1mo", "3mo", "6mo", "1y", "5y", "max"]).default("1y"),
  expiration: z.string().optional(),
});

export const YFinanceFuturesHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceFuturesHistoricalData = z.infer<typeof YFinanceFuturesHistoricalData>;

export class YFinanceFuturesHistoricalFetcher extends AbstractFetcher<
  typeof YFinanceFuturesHistoricalQueryParams,
  typeof YFinanceFuturesHistoricalData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceFuturesHistoricalQueryParams>) {
    let symbol = params.symbol.toUpperCase();
    // Append =F suffix for futures if not already present
    if (!symbol.includes("=F")) {
      symbol = `${symbol}=F`;
    }
    return {
      symbol,
      interval: params.interval ?? "1d",
      range: params.range ?? "1y",
      expiration: params.expiration,
    };
  }

  async extractData(
    query: z.infer<typeof YFinanceFuturesHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchHistorical(query.symbol, query.interval as any, query.range as any);
  }

  async transformData(
    raw: unknown,
  ): Promise<YFinanceFuturesHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      YFinanceFuturesHistoricalData.parse({
        date: row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
      }),
    );
  }
}
