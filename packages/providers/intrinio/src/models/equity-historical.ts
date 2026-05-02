import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistoricalPrices } from "../utils/api";

export const IntrinioEquityHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  adjClose: z.number().nullish(),
  adjHigh: z.number().nullish(),
  adjLow: z.number().nullish(),
  adjOpen: z.number().nullish(),
  adjVolume: z.number().nullish(),
  splitFactor: z.number().nullish(),
  dividend: z.number().nullish(),
  provider: z.literal("intrinio").default("intrinio"),
});

export type IntrinioEquityHistoricalData = z.infer<typeof IntrinioEquityHistoricalData>;

export const IntrinioEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).default("daily"),
});

export type IntrinioEquityHistoricalQueryParams = z.infer<typeof IntrinioEquityHistoricalQueryParams>;

/**
 * Fetcher for historical equity prices from Intrinio.
 * Uses /securities/{symbol}/prices.
 */
export class IntrinioEquityHistoricalFetcher extends AbstractFetcher<
  typeof IntrinioEquityHistoricalQueryParams,
  typeof IntrinioEquityHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof IntrinioEquityHistoricalQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: params.frequency ?? "daily",
    };
  }

  async extractData(
    query: z.infer<typeof IntrinioEquityHistoricalQueryParams>,
    credentials: Record<string, string>,
  ) {
    const startStr = query.startDate
      ? (query.startDate as Date).toISOString().split("T")[0]
      : undefined;
    const endStr = query.endDate
      ? (query.endDate as Date).toISOString().split("T")[0]
      : undefined;
    return fetchHistoricalPrices(query.symbol, credentials, startStr, endStr, query.frequency);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      IntrinioEquityHistoricalData.parse({
        date: row.date,
        open: row.open ?? row.adjOpen ?? null,
        high: row.high ?? row.adjHigh ?? null,
        low: row.low ?? row.adjLow ?? null,
        close: row.close ?? row.adjClose ?? null,
        volume: row.volume ?? row.adjVolume ?? null,
        adjClose: row.adjClose ?? null,
        adjHigh: row.adjHigh ?? null,
        adjLow: row.adjLow ?? null,
        adjOpen: row.adjOpen ?? null,
        adjVolume: row.adjVolume ?? null,
        splitFactor: row.splitFactor ?? null,
        dividend: row.dividend ?? null,
      }),
    );
  }
}
