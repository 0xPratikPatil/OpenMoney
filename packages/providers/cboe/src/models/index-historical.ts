import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

export const CboeIndexHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeIndexHistoricalData = z.infer<typeof CboeIndexHistoricalData>;

export const CboeIndexHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase().replace("^", "")),
});

export type CboeIndexHistoricalQueryParams = z.infer<typeof CboeIndexHistoricalQueryParams>;

/**
 * Fetcher for historical index OHLCV data from CBOE.
 */
export class CboeIndexHistoricalFetcher extends AbstractFetcher<
  typeof CboeIndexHistoricalQueryParams,
  typeof CboeIndexHistoricalData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeIndexHistoricalQueryParams>,
  ): Promise<z.input<typeof CboeIndexHistoricalQueryParams>> {
    return { symbol: params.symbol.toUpperCase().replace("^", "") };
  }

  async extractData(
    query: z.infer<typeof CboeIndexHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchHistorical(query.symbol);
  }

  async transformData(
    raw: unknown,
  ): Promise<CboeIndexHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError("No index historical data returned");
    return rows.map((row) =>
      CboeIndexHistoricalData.parse({
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
