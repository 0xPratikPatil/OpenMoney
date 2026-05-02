import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchAggs } from "../utils/api";

export const PolygonCryptoHistoricalData = z.object({
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

export type PolygonCryptoHistoricalData = z.infer<typeof PolygonCryptoHistoricalData>;

export const PolygonCryptoHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required (e.g. BTCUSD)")
    .transform((s) => s.toUpperCase()),
  fromSymbol: z.string().optional(),
  toSymbol: z.string().optional(),
  multiplier: z.number().int().min(1).default(1),
  timespan: z.enum(["minute", "hour", "day", "week", "month", "quarter", "year"]).default("day"),
  from: z.coerce.date(),
  to: z.coerce.date().optional(),
});

export type PolygonCryptoHistoricalQueryParams = z.infer<typeof PolygonCryptoHistoricalQueryParams>;

/**
 * Fetcher for historical crypto data from Polygon.io.
 * Uses /v2/aggs/ticker/X:{from}{to}/range/...
 */
export class PolygonCryptoHistoricalFetcher extends AbstractFetcher<
  typeof PolygonCryptoHistoricalQueryParams,
  typeof PolygonCryptoHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof PolygonCryptoHistoricalQueryParams>,
  ) {
    let fromSym: string;
    let toSym: string;

    if (params.fromSymbol && params.toSymbol) {
      fromSym = params.fromSymbol.toUpperCase();
      toSym = params.toSymbol.toUpperCase();
    } else {
      const s = params.symbol.toUpperCase();
      if (s.length >= 6) {
        fromSym = s.slice(0, -3);
        toSym = s.slice(-3);
      } else {
        fromSym = s;
        toSym = "USD";
      }
    }

    return {
      symbol: `${fromSym}${toSym}`,
      fromSymbol: fromSym,
      toSymbol: toSym,
      multiplier: params.multiplier ?? 1,
      timespan: params.timespan ?? "day",
      from: params.from,
      to: params.to ?? new Date(),
    };
  }

  async extractData(
    query: z.infer<typeof PolygonCryptoHistoricalQueryParams>,
    credentials: Record<string, string>,
  ) {
    const ticker = `X:${query.fromSymbol}${query.toSymbol}`;
    const fromStr = (query.from as Date).toISOString().split("T")[0]!;
    const toStr = query.to
      ? (query.to as Date).toISOString().split("T")[0]!
      : new Date().toISOString().split("T")[0]!;

    return fetchAggs(ticker, query.multiplier, query.timespan, fromStr, toStr, credentials);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      PolygonCryptoHistoricalData.parse({
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
