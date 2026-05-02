import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistorical } from "../utils/api";

export const TradierEquityHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  provider: z.literal("tradier").default("tradier"),
});

export type TradierEquityHistoricalData = z.infer<typeof TradierEquityHistoricalData>;

export const TradierEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  interval: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type TradierEquityHistoricalQueryParams = z.infer<typeof TradierEquityHistoricalQueryParams>;

/**
 * Fetcher for historical equity data from Tradier.
 * Uses /markets/history.
 */
export class TradierEquityHistoricalFetcher extends AbstractFetcher<
  typeof TradierEquityHistoricalQueryParams,
  typeof TradierEquityHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TradierEquityHistoricalQueryParams>,
  ): Promise<z.input<typeof TradierEquityHistoricalQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      interval: params.interval ?? "daily",
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  async extractData(
    query: z.infer<typeof TradierEquityHistoricalQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const startStr = query.startDate
      ? (query.startDate as Date).toISOString().split("T")[0]
      : undefined;
    const endStr = query.endDate
      ? (query.endDate as Date).toISOString().split("T")[0]
      : undefined;

    return fetchHistorical(query.symbol, credentials, query.interval, startStr, endStr);
  }

  async transformData(raw: unknown): Promise<TradierEquityHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      TradierEquityHistoricalData.parse({
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
