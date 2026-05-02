import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

export const CboeEquityHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeEquityHistoricalData = z.infer<typeof CboeEquityHistoricalData>;

export const CboeEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase().replace("^", "")),
});

export type CboeEquityHistoricalQueryParams = z.infer<typeof CboeEquityHistoricalQueryParams>;

/**
 * Fetcher for historical equity OHLCV data from CBOE.
 */
export class CboeEquityHistoricalFetcher extends AbstractFetcher<
  typeof CboeEquityHistoricalQueryParams,
  typeof CboeEquityHistoricalData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeEquityHistoricalQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase().replace("^", "") };
  }

  async extractData(
    query: z.infer<typeof CboeEquityHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchHistorical(query.symbol);
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError("No historical data returned from CBOE");
    return rows.map((row) =>
      CboeEquityHistoricalData.parse({
        date: row.date ?? row.datetime,
        open: row.open ?? 0,
        high: row.high ?? 0,
        low: row.low ?? 0,
        close: row.close ?? 0,
        volume: row.volume ?? 0,
      }),
    );
  }
}
