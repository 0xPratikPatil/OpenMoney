import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchAggs } from "../utils/api";

export const PolygonEquityHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  vwap: z.number().nullish(),
  transactions: z.number().nullish(),
  provider: z.literal("polygon").default("polygon"),
});

export type PolygonEquityHistoricalData = z.infer<typeof PolygonEquityHistoricalData>;

export const PolygonEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  multiplier: z.number().int().min(1).default(1),
  timespan: z.enum(["minute", "hour", "day", "week", "month", "quarter", "year"]).default("day"),
  from: z.coerce.date(),
  to: z.coerce.date().optional(),
});

export type PolygonEquityHistoricalQueryParams = z.infer<typeof PolygonEquityHistoricalQueryParams>;

/**
 * Fetcher for historical equity OHLCV data from Polygon.io.
 * Uses /v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/{from}/{to}.
 */
export class PolygonEquityHistoricalFetcher extends AbstractFetcher<
  typeof PolygonEquityHistoricalQueryParams,
  typeof PolygonEquityHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof PolygonEquityHistoricalQueryParams>,
  ): Promise<z.input<typeof PolygonEquityHistoricalQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      multiplier: params.multiplier ?? 1,
      timespan: params.timespan ?? "day",
      from: params.from,
      to: params.to ?? new Date(),
    };
  }

  async extractData(
    query: z.infer<typeof PolygonEquityHistoricalQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const fromStr = typeof query.from === "string" ? query.from : (query.from as Date).toISOString().split("T")[0]!;
    const toStr = query.to
      ? (typeof query.to === "string" ? query.to : (query.to as Date).toISOString().split("T")[0]!)
      : new Date().toISOString().split("T")[0]!;

    return fetchAggs(query.symbol, query.multiplier, query.timespan, fromStr, toStr, credentials);
  }

  async transformData(raw: unknown): Promise<PolygonEquityHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      PolygonEquityHistoricalData.parse({
        date: new Date(row.t as number).toISOString(),
        open: row.o,
        high: row.h,
        low: row.l,
        close: row.c,
        volume: row.v,
        vwap: row.vw ?? null,
        transactions: row.n ?? null,
      }),
    );
  }
}
