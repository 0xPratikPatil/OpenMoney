import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { avFetch, parseNumber, stripNumericPrefix } from "../utils/api";

export const AVEquityHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  adjClose: z.number().nullish(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVEquityHistoricalData = z.infer<typeof AVEquityHistoricalData>;

export const AVEquityHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  outputsize: z.enum(["compact", "full"]).default("compact"),
});

export type AVEquityHistoricalQueryParams = z.infer<typeof AVEquityHistoricalQueryParams>;

export class AVEquityHistoricalFetcher extends AbstractFetcher<
  typeof AVEquityHistoricalQueryParams,
  typeof AVEquityHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof AVEquityHistoricalQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      outputsize: params.outputsize ?? "compact",
    };
  }

  async extractData(
    query: z.infer<typeof AVEquityHistoricalQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    return avFetch("TIME_SERIES_DAILY_ADJUSTED", apiKey, {
      symbol: query.symbol,
      outputsize: query.outputsize,
    });
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as Record<string, unknown>;
    const series = data["Time Series (Daily)"] as Record<string, Record<string, string>> | undefined;
    if (!series) throw new EmptyDataError("No Time Series (Daily) data returned");

    const results: AVEquityHistoricalData[] = [];

    for (const [dateStr, entry] of Object.entries(series)) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(entry)) {
        cleaned[stripNumericPrefix(key)] = val;
      }

      const open = parseNumber(cleaned.open);
      const high = parseNumber(cleaned.high);
      const low = parseNumber(cleaned.low);
      const close = parseNumber(cleaned.close);
      const volume = parseNumber(cleaned.volume);
      const adjClose = parseNumber(cleaned["adjusted close"]);

      if (open == null || high == null || low == null || close == null || volume == null) continue;

      results.push(
        AVEquityHistoricalData.parse({
          date: dateStr,
          open,
          high,
          low,
          close,
          volume,
          adjClose,
        }),
      );
    }

    if (results.length === 0) throw new EmptyDataError("No valid historical data rows");

    return results;
  }
}
