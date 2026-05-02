import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch, type FmpHistoricalResponse, type FmpHistoricalRow } from "../utils/api";

export const FMPEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  timeseries: z.coerce.number().int().positive().optional(),
});

export type FMPEquityHistoricalQueryParams = z.infer<typeof FMPEquityHistoricalQueryParams>;

export const FMPEquityHistoricalData = z.object({
  symbol: z.string(),
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  adjClose: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  vwap: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPEquityHistoricalData = z.infer<typeof FMPEquityHistoricalData>;

export class FMPEquityHistoricalFetcher extends AbstractFetcher<
  typeof FMPEquityHistoricalQueryParams,
  typeof FMPEquityHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPEquityHistoricalQueryParams>,
  ): Promise<z.input<typeof FMPEquityHistoricalQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      timeseries: params.timeseries ?? undefined,
    };
  }

  async extractData(
    query: z.infer<typeof FMPEquityHistoricalQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const params: Record<string, string | number | undefined> = {};
    if (query.timeseries) params["timeseries"] = query.timeseries;
    const data = await fmpFetch<FmpHistoricalResponse>(
      `/v3/historical-price-full/${encodeURIComponent(query.symbol)}`,
      apiKey,
      params,
    );
    if (!data || !data.historical || data.historical.length === 0) {
      throw new EmptyDataError(`No historical data for ${query.symbol}`);
    }
    return { symbol: data.symbol, historical: data.historical };
  }

  async transformData(raw: unknown): Promise<FMPEquityHistoricalData[]> {
    const { symbol, historical } = raw as { symbol: string; historical: FmpHistoricalRow[] };
    return historical.map((row) =>
      FMPEquityHistoricalData.parse({
        symbol,
        date: row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
        adjClose: row.adjClose ?? null,
        change: row.change ?? null,
        changePercent: row.changePercent ?? null,
        vwap: row.vwap ?? null,
      }),
    );
  }
}
