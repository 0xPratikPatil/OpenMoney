import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { avFetch, parseNumber, parseString, stripNumericPrefix } from "../utils/api";

// ---- Forex Quote ----

export const AVForexQuoteData = z.object({
  fromCurrency: z.string(),
  toCurrency: z.string(),
  exchangeRate: z.number().nullish(),
  bidPrice: z.number().nullish(),
  askPrice: z.number().nullish(),
  lastRefreshed: z.string().nullish(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVForexQuoteData = z.infer<typeof AVForexQuoteData>;

export const AVForexQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required (e.g. EURUSD)")
    .transform((s) => s.toUpperCase()),
});

export type AVForexQuoteQueryParams = z.infer<typeof AVForexQuoteQueryParams>;

export class AVForexQuoteFetcher extends AbstractFetcher<
  typeof AVForexQuoteQueryParams,
  typeof AVForexQuoteData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof AVForexQuoteQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof AVForexQuoteQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    // Symbol "EURUSD" -> from_currency=EUR, to_currency=USD
    const fromCurrency = query.symbol.slice(0, 3);
    const toCurrency = query.symbol.slice(3);
    return avFetch("CURRENCY_EXCHANGE_RATE", apiKey, {
      from_currency: fromCurrency,
      to_currency: toCurrency,
    });
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as Record<string, unknown>;
    const rateData = data["Realtime Currency Exchange Rate"] as Record<string, unknown> | undefined;
    if (!rateData) throw new EmptyDataError("No Realtime Currency Exchange Rate data returned");

    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(rateData)) {
      cleaned[stripNumericPrefix(key)] = val;
    }

    return [
      AVForexQuoteData.parse({
        fromCurrency: parseString(cleaned["From_Currency Code"]),
        toCurrency: parseString(cleaned["To_Currency Code"]),
        exchangeRate: parseNumber(cleaned["Exchange Rate"]),
        bidPrice: parseNumber(cleaned["Bid Price"]),
        askPrice: parseNumber(cleaned["Ask Price"]),
        lastRefreshed: parseString(cleaned["Last Refreshed"]),
      }),
    ];
  }
}

// ---- Forex Historical ----

export const AVForexHistoricalData = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVForexHistoricalData = z.infer<typeof AVForexHistoricalData>;

export const AVForexHistoricalQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required (e.g. EURUSD)")
    .transform((s) => s.toUpperCase()),
  outputsize: z.enum(["compact", "full"]).default("compact"),
});

export type AVForexHistoricalQueryParams = z.infer<typeof AVForexHistoricalQueryParams>;

export class AVForexHistoricalFetcher extends AbstractFetcher<
  typeof AVForexHistoricalQueryParams,
  typeof AVForexHistoricalData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof AVForexHistoricalQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      outputsize: params.outputsize ?? "compact",
    };
  }

  async extractData(
    query: z.infer<typeof AVForexHistoricalQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    const fromCurrency = query.symbol.slice(0, 3);
    const toCurrency = query.symbol.slice(3);
    return avFetch("FX_DAILY", apiKey, {
      from_symbol: fromCurrency,
      to_symbol: toCurrency,
      outputsize: query.outputsize,
    });
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as Record<string, unknown>;
    const series = data["Time Series FX (Daily)"] as Record<string, Record<string, string>> | undefined;
    if (!series) throw new EmptyDataError("No Time Series FX (Daily) data returned");

    const results: AVForexHistoricalData[] = [];

    for (const [dateStr, entry] of Object.entries(series)) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(entry)) {
        cleaned[stripNumericPrefix(key)] = val;
      }

      const open = parseNumber(cleaned.open);
      const high = parseNumber(cleaned.high);
      const low = parseNumber(cleaned.low);
      const close = parseNumber(cleaned.close);

      if (open == null || high == null || low == null || close == null) continue;

      results.push(
        AVForexHistoricalData.parse({
          date: dateStr,
          open,
          high,
          low,
          close,
        }),
      );
    }

    if (results.length === 0) throw new EmptyDataError("No valid forex historical data rows");

    return results;
  }
}
