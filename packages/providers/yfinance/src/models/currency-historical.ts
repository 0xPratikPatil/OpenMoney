import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

/**
 * Currency (Forex) Historical fetcher.
 * Port of OpenBB's YFinanceCurrencyHistoricalFetcher.
 * Transforms symbol "EURUSD" → "EURUSD=X" for Yahoo Finance.
 */
export const YFinanceCurrencyHistoricalQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
  range: z.enum(["1mo", "3mo", "6mo", "1y", "5y", "max"]).default("1y"),
});

export const YFinanceCurrencyHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceCurrencyHistoricalData = z.infer<typeof YFinanceCurrencyHistoricalData>;

export class YFinanceCurrencyHistoricalFetcher extends AbstractFetcher<
  typeof YFinanceCurrencyHistoricalQueryParams,
  typeof YFinanceCurrencyHistoricalData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceCurrencyHistoricalQueryParams>) {
    let symbol = params.symbol.toUpperCase();
    // Transform symbol: "EURUSD" → "EURUSD=X"
    if (!symbol.includes("=X")) {
      symbol = `${symbol}=X`;
    }
    return {
      symbol,
      interval: params.interval ?? "1d",
      range: params.range ?? "1y",
    };
  }

  async extractData(
    query: z.infer<typeof YFinanceCurrencyHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchHistorical(query.symbol, query.interval as any, query.range as any);
  }

  async transformData(
    raw: unknown,
  ): Promise<YFinanceCurrencyHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      YFinanceCurrencyHistoricalData.parse({
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
