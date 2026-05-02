import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

/**
 * Index Historical fetcher.
 * Port of OpenBB's YFinanceIndexHistoricalFetcher.
 * Resolves index codes (like "sp500") to their Yahoo ticker symbols.
 */
const INDICES: Record<string, { name: string; ticker: string }> = {
  sp500: { name: "S&P 500 Index", ticker: "^GSPC" },
  spx: { name: "S&P 500 Index", ticker: "^SPX" },
  nasdaq: { name: "Nasdaq Composite Index", ticker: "^IXIC" },
  nasdaq100: { name: "NASDAQ 100", ticker: "^NDX" },
  dow_dji: { name: "Dow Jones Industrial Average Index", ticker: "^DJI" },
  nyse: { name: "NYSE Composite Index", ticker: "^NYA" },
  russell2000: { name: "Russell 2000 Index", ticker: "^RUT" },
  cboe_vix: { name: "CBOE S&P 500 Volatility Index", ticker: "^VIX" },
  ftse100: { name: "FTSE Global 100 Index (GBP)", ticker: "^FTSE" },
  de_dax40: { name: "DAX Performance Index (EUR)", ticker: "^GDAXI" },
  fr_cac40: { name: "CAC 40 PR Index (EUR)", ticker: "^FCHI" },
  jp_n225: { name: "Nikkei 255 Index (JPY)", ticker: "^N225" },
  hk_hsi: { name: "Hang Seng Index (HKD)", ticker: "^HSI" },
};

export const YFinanceIndexHistoricalQueryParams = z.object({
  symbol: z.string(),
  interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
  range: z.enum(["1mo", "3mo", "6mo", "1y", "5y", "max"]).default("1y"),
});

export const YFinanceIndexHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceIndexHistoricalData = z.infer<typeof YFinanceIndexHistoricalData>;

export class YFinanceIndexHistoricalFetcher extends AbstractFetcher<
  typeof YFinanceIndexHistoricalQueryParams,
  typeof YFinanceIndexHistoricalData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceIndexHistoricalQueryParams>) {
    let symbol = params.symbol.toUpperCase();
    // Resolve index codes
    const lowerSym = params.symbol.toLowerCase();
    if (lowerSym in INDICES) {
      symbol = INDICES[lowerSym]!.ticker;
    }

    return {
      symbol,
      interval: params.interval ?? "1d",
      range: params.range ?? "1y",
    };
  }

  async extractData(
    query: z.infer<typeof YFinanceIndexHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchHistorical(query.symbol, query.interval as any, query.range as any);
  }

  async transformData(
    raw: unknown,
  ): Promise<YFinanceIndexHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      YFinanceIndexHistoricalData.parse({
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
