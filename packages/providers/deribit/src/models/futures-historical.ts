import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchDeribit } from "../utils/api";

export const DeribitFuturesHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("deribit").default("deribit"),
});

export type DeribitFuturesHistoricalData = z.infer<typeof DeribitFuturesHistoricalData>;

export const DeribitFuturesHistoricalQueryParams = z.object({
  symbol: z.string().min(1, "Instrument name is required"),
  startTimestamp: z.number().optional(),
  endTimestamp: z.number().optional(),
  resolution: z.enum(["1", "5", "15", "30", "60", "360", "720", "1D"]).default("1D"),
});

export type DeribitFuturesHistoricalQueryParams = z.infer<typeof DeribitFuturesHistoricalQueryParams>;

/**
 * Fetcher for historical OHLCV data from Deribit.
 */
export class DeribitFuturesHistoricalFetcher extends AbstractFetcher<
  typeof DeribitFuturesHistoricalQueryParams,
  typeof DeribitFuturesHistoricalData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof DeribitFuturesHistoricalQueryParams>,
  ): Promise<z.input<typeof DeribitFuturesHistoricalQueryParams>> {
    const now = Math.floor(Date.now() / 1000);
    return {
      symbol: params.symbol,
      startTimestamp: params.startTimestamp ?? now - 365 * 86400,
      endTimestamp: params.endTimestamp ?? now,
      resolution: params.resolution ?? "1D",
    };
  }

  async extractData(
    query: z.infer<typeof DeribitFuturesHistoricalQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const now = Math.floor(Date.now() / 1000);
    const data = await fetchDeribit<any>("get_tradingview_chart_data", {
      instrument_name: query.symbol,
      start_timestamp: query.startTimestamp ?? now - 365 * 86400,
      end_timestamp: query.endTimestamp ?? now,
      resolution: query.resolution,
    });
    return data;
  }

  async transformData(
    raw: unknown,
  ): Promise<DeribitFuturesHistoricalData[]> {
    const data = raw as Record<string, unknown> | null;
    if (!data) throw new EmptyDataError("No historical data returned");

    const timestamps = data.timestamps as number[] ?? [];
    const opens = data.open as number[] ?? [];
    const highs = data.high as number[] ?? [];
    const lows = data.low as number[] ?? [];
    const closes = data.close as number[] ?? [];
    const volumes = data.volume as number[] ?? [];

    if (timestamps.length === 0) throw new EmptyDataError("No historical data points");

    return timestamps.map((ts, i) =>
      DeribitFuturesHistoricalData.parse({
        date: new Date(ts).toISOString(),
        open: opens[i] ?? 0,
        high: highs[i] ?? 0,
        low: lows[i] ?? 0,
        close: closes[i] ?? 0,
        volume: volumes[i] ?? 0,
      }),
    );
  }
}
