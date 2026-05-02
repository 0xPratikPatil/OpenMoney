import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { avFetch, parseNumber, parseString, stripNumericPrefix } from "../utils/api";

export const AVEquityQuoteData = z.object({
  symbol: z.string(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  volume: z.number().nullish(),
  dayHigh: z.number().nullish(),
  dayLow: z.number().nullish(),
  open: z.number().nullish(),
  previousClose: z.number().nullish(),
  marketCap: z.number().nullish(),
  name: z.string().nullish(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVEquityQuoteData = z.infer<typeof AVEquityQuoteData>;

export const AVEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type AVEquityQuoteQueryParams = z.infer<typeof AVEquityQuoteQueryParams>;

export class AVEquityQuoteFetcher extends AbstractFetcher<
  typeof AVEquityQuoteQueryParams,
  typeof AVEquityQuoteData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof AVEquityQuoteQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof AVEquityQuoteQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    return avFetch("GLOBAL_QUOTE", apiKey, { symbol: query.symbol });
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as Record<string, unknown>;
    const quoteData = data["Global Quote"] as Record<string, unknown> | undefined;
    if (!quoteData) throw new EmptyDataError("No Global Quote data returned");

    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(quoteData)) {
      cleaned[stripNumericPrefix(key)] = val;
    }

    return [
      AVEquityQuoteData.parse({
        symbol: parseString(cleaned.symbol),
        price: parseNumber(cleaned.price),
        change: parseNumber(cleaned.change),
        changePercent: parseNumber(cleaned["change percent"]),
        volume: parseNumber(cleaned.volume),
        dayHigh: parseNumber(cleaned.high),
        dayLow: parseNumber(cleaned.low),
        open: parseNumber(cleaned.open),
        previousClose: parseNumber(cleaned["previous close"]),
      }),
    ];
  }
}
