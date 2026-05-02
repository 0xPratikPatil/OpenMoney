import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuote } from "../utils/api";

export const CboeEquityQuoteData = z.object({
  symbol: z.string(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  volume: z.number().nullish(),
  dayHigh: z.number().nullish(),
  dayLow: z.number().nullish(),
  open: z.number().nullish(),
  previousClose: z.number().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  yearHigh: z.number().nullish(),
  yearLow: z.number().nullish(),
  name: z.string().nullish(),
  iv30: z.number().nullish(),
  iv60: z.number().nullish(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeEquityQuoteData = z.infer<typeof CboeEquityQuoteData>;

export const CboeEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase().replace("^", "")),
});

export type CboeEquityQuoteQueryParams = z.infer<typeof CboeEquityQuoteQueryParams>;

/**
 * Fetcher for delayed equity quotes from CBOE.
 */
export class CboeEquityQuoteFetcher extends AbstractFetcher<
  typeof CboeEquityQuoteQueryParams,
  typeof CboeEquityQuoteData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeEquityQuoteQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase().replace("^", "") };
  }

  async extractData(
    query: z.infer<typeof CboeEquityQuoteQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchQuote(query.symbol);
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof CboeEquityQuoteQueryParams>,
  ) {
    const response = raw as any;
    const data = response?.data?.[0];
    if (!data) throw new EmptyDataError("No quote data returned from CBOE");

    return [
      CboeEquityQuoteData.parse({
        symbol: data.symbol ?? query?.symbol,
        price: data.current_price ?? null,
        change: data.change ?? null,
        changePercent: data.change_percent ?? null,
        volume: data.volume ?? null,
        dayHigh: data.high ?? null,
        dayLow: data.low ?? null,
        open: data.open ?? null,
        previousClose: data.previous_close ?? null,
        bid: data.bid ?? null,
        ask: data.ask ?? null,
        yearHigh: data.annual_high ?? null,
        yearLow: data.annual_low ?? null,
        name: data.company_name ?? data.description ?? null,
        iv30: data.iv30 ?? null,
        iv60: data.iv60 ?? null,
      }),
    ];
  }
}
