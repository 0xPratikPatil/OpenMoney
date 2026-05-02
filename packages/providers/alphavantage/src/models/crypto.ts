import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { avFetch, parseNumber, stripNumericPrefix } from "../utils/api";

export const AVCryptoHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().nullish(),
  marketCap: z.number().nullish(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVCryptoHistoricalData = z.infer<typeof AVCryptoHistoricalData>;

export const AVCryptoHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required (e.g. BTC)")
    .transform((s) => s.toUpperCase()),
});

export type AVCryptoHistoricalQueryParams = z.infer<typeof AVCryptoHistoricalQueryParams>;

export class AVCryptoHistoricalFetcher extends AbstractFetcher<
  typeof AVCryptoHistoricalQueryParams,
  typeof AVCryptoHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof AVCryptoHistoricalQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof AVCryptoHistoricalQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    return avFetch("DIGITAL_CURRENCY_DAILY", apiKey, {
      symbol: query.symbol,
      market: "USD",
    });
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as Record<string, unknown>;
    const series = data["Time Series (Digital Currency Daily)"] as Record<string, Record<string, string>> | undefined;
    if (!series) throw new EmptyDataError("No Time Series (Digital Currency Daily) data returned");

    const results: AVCryptoHistoricalData[] = [];

    for (const [dateStr, entry] of Object.entries(series)) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(entry)) {
        cleaned[stripNumericPrefix(key)] = val;
      }

      // Digital Currency Daily has USD-specific fields like "open (USD)", "close (USD)"
      const open = parseNumber(cleaned["open (USD)"]);
      const high = parseNumber(cleaned["high (USD)"]);
      const low = parseNumber(cleaned["low (USD)"]);
      const close = parseNumber(cleaned["close (USD)"]);
      const volume = parseNumber(cleaned.volume);
      const marketCap = parseNumber(cleaned["market cap (USD)"]);

      if (open == null || high == null || low == null || close == null) continue;

      results.push(
        AVCryptoHistoricalData.parse({
          date: dateStr,
          open,
          high,
          low,
          close,
          volume,
          marketCap,
        }),
      );
    }

    if (results.length === 0) throw new EmptyDataError("No valid crypto historical data rows");

    return results;
  }
}
