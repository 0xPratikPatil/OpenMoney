import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

export const YFinanceEquityHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  adjClose: z.number().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceEquityHistoricalData = z.infer<typeof YFinanceEquityHistoricalData>;

export const YFinanceEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
  range: z.enum(["1mo", "3mo", "6mo", "1y", "5y", "max"]).default("1y"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type YFinanceEquityHistoricalQueryParams = z.infer<typeof YFinanceEquityHistoricalQueryParams>;

/**
 * Fetcher for historical equity OHLCV data from Yahoo Finance.
 * Implements the TET (Transform-Extract-Transform) pattern from OpenBB.
 */
export class YFinanceEquityHistoricalFetcher extends AbstractFetcher<
  typeof YFinanceEquityHistoricalQueryParams,
  typeof YFinanceEquityHistoricalData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof YFinanceEquityHistoricalQueryParams>,
  ): Promise<z.input<typeof YFinanceEquityHistoricalQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      interval: params.interval ?? "1d",
      range: params.range ?? "1y",
    };
  }

  async extractData(
    query: z.infer<typeof YFinanceEquityHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchHistorical(query.symbol, query.interval as any, query.range as any);
  }

  async transformData(
    raw: unknown,
  ): Promise<YFinanceEquityHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      YFinanceEquityHistoricalData.parse({
        date: row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
        adjClose: row.adjClose,
      }),
    );
  }
}
