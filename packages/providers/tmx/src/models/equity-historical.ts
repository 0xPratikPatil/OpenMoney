import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

export const TmxEquityHistoricalData = z.object({
  date: z.string(),
  open: z.number().nullish(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  close: z.number().nullish(),
  volume: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEquityHistoricalData = z.infer<typeof TmxEquityHistoricalData>;

export const TmxEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
  range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]).default("1y"),
});

export type TmxEquityHistoricalQueryParams = z.infer<typeof TmxEquityHistoricalQueryParams>;

/**
 * Fetcher for historical OHLCV data from TMX Money.
 * Endpoint: GET /api/quote/{symbol}/history?interval=1d&range=1y
 */
export class TmxEquityHistoricalFetcher extends AbstractFetcher<
  typeof TmxEquityHistoricalQueryParams,
  typeof TmxEquityHistoricalData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEquityHistoricalQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      interval: params.interval ?? "1d",
      range: params.range ?? "1y",
    };
  }

  async extractData(
    query: z.infer<typeof TmxEquityHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchHistorical(query.symbol, query.interval, query.range);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxEquityHistoricalData.parse({
        date: row.date ?? row.timestamp,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
      }),
    );
  }
}
