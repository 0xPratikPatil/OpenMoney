import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchCryptoPrices } from "../utils/api";

export const TiingoCryptoHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  volumeNotional: z.number().nullish(),
  tradesDone: z.number().nullish(),
  provider: z.literal("tiingo").default("tiingo"),
});

export type TiingoCryptoHistoricalData = z.infer<typeof TiingoCryptoHistoricalData>;

export const TiingoCryptoHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required (e.g. BTCUSD)")
    .transform((s) => s.toUpperCase()),
  baseCurrency: z.string().optional(),
  quoteCurrency: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  resampleFreq: z
    .enum(["1min", "5min", "15min", "30min", "1hour", "4hour", "1day"])
    .default("1day"),
});

export type TiingoCryptoHistoricalQueryParams = z.infer<typeof TiingoCryptoHistoricalQueryParams>;

/**
 * Fetcher for historical cryptocurrency prices from Tiingo.
 * Uses /tiingo/crypto/prices.
 */
export class TiingoCryptoHistoricalFetcher extends AbstractFetcher<
  typeof TiingoCryptoHistoricalQueryParams,
  typeof TiingoCryptoHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TiingoCryptoHistoricalQueryParams>,
  ): Promise<z.input<typeof TiingoCryptoHistoricalQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      baseCurrency: params.baseCurrency,
      quoteCurrency: params.quoteCurrency,
      startDate: params.startDate,
      endDate: params.endDate,
      resampleFreq: params.resampleFreq ?? "1day",
    };
  }

  async extractData(
    query: z.infer<typeof TiingoCryptoHistoricalQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const ticker = query.symbol.includes("-")
      ? query.symbol.replace("-", "")
      : query.symbol;
    const startStr = query.startDate
      ? (query.startDate as Date).toISOString()
      : undefined;
    const endStr = query.endDate
      ? (query.endDate as Date).toISOString()
      : undefined;

    return fetchCryptoPrices(ticker, credentials, startStr, endStr, query.resampleFreq);
  }

  async transformData(raw: unknown): Promise<TiingoCryptoHistoricalData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (rows.length === 0) throw new EmptyDataError();
    return rows.map((row) =>
      TiingoCryptoHistoricalData.parse({
        date: row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
        volumeNotional: row.volumeNotional ?? null,
        tradesDone: row.tradesDone ?? null,
      }),
    );
  }
}
