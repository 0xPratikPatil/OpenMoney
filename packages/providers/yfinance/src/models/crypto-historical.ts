import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

/**
 * Crypto Historical fetcher.
 * Port of OpenBB's YFinanceCryptoHistoricalFetcher.
 * Transforms symbol "BTCUSD" → "BTC-USD" for Yahoo Finance.
 */
export const YFinanceCryptoHistoricalQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
  range: z.enum(["1mo", "3mo", "6mo", "1y", "5y", "max"]).default("1y"),
});

export const YFinanceCryptoHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceCryptoHistoricalData = z.infer<typeof YFinanceCryptoHistoricalData>;

export class YFinanceCryptoHistoricalFetcher extends AbstractFetcher<
  typeof YFinanceCryptoHistoricalQueryParams,
  typeof YFinanceCryptoHistoricalData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceCryptoHistoricalQueryParams>) {
    let symbol = params.symbol.toUpperCase();
    // Transform symbol: "BTCUSD" → "BTC-USD" or "BTCUSDT" → "BTC-USDT"
    if (!symbol.includes("-")) {
      // Insert dash before the last 3 chars (e.g., BTCUSD -> BTC-USD)
      symbol = symbol.slice(0, -3) + "-" + symbol.slice(-3);
    }
    return {
      symbol,
      interval: params.interval ?? "1d",
      range: params.range ?? "1y",
    };
  }

  async extractData(
    query: z.infer<typeof YFinanceCryptoHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchHistorical(query.symbol, query.interval as any, query.range as any);
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      YFinanceCryptoHistoricalData.parse({
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
