import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchDailyPrices } from "../utils/api";

export const TiingoEquityHistoricalData = z.object({
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
  provider: z.literal("tiingo").default("tiingo"),
});

export type TiingoEquityHistoricalData = z.infer<typeof TiingoEquityHistoricalData>;

export const TiingoEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type TiingoEquityHistoricalQueryParams = z.infer<typeof TiingoEquityHistoricalQueryParams>;

/**
 * Fetcher for historical daily equity prices from Tiingo.
 * Uses /tiingo/daily/{symbol}/prices.
 */
export class TiingoEquityHistoricalFetcher extends AbstractFetcher<
  typeof TiingoEquityHistoricalQueryParams,
  typeof TiingoEquityHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TiingoEquityHistoricalQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  async extractData(
    query: z.infer<typeof TiingoEquityHistoricalQueryParams>,
    credentials: Record<string, string>,
  ) {
    const startStr = query.startDate
      ? (query.startDate as Date).toISOString().split("T")[0]
      : undefined;
    const endStr = query.endDate
      ? (query.endDate as Date).toISOString().split("T")[0]
      : undefined;

    return fetchDailyPrices(query.symbol, credentials, startStr, endStr);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      TiingoEquityHistoricalData.parse({
        date: (row.date as string)?.split("T")[0] ?? row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
        adjClose: row.adjClose ?? row.adjClose,
        adjHigh: row.adjHigh ?? null,
        adjLow: row.adjLow ?? null,
        adjOpen: row.adjOpen ?? null,
        adjVolume: row.adjVolume ?? null,
        splitFactor: row.splitFactor ?? null,
        dividend: row.divCash ?? null,
      }),
    );
  }
}
