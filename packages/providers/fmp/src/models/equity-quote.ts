import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch, type FmpQuote } from "../utils/api";

export const FMPEquityQuoteQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type FMPEquityQuoteQueryParams = z.infer<typeof FMPEquityQuoteQueryParams>;

export const FMPEquityQuoteData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  dayLow: z.number().nullish(),
  dayHigh: z.number().nullish(),
  yearHigh: z.number().nullish(),
  yearLow: z.number().nullish(),
  marketCap: z.number().nullish(),
  volume: z.number().nullish(),
  avgVolume: z.number().nullish(),
  open: z.number().nullish(),
  previousClose: z.number().nullish(),
  eps: z.number().nullish(),
  earningsAnnouncement: z.string().nullish(),
  sharesOutstanding: z.number().nullish(),
  peRatio: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPEquityQuoteData = z.infer<typeof FMPEquityQuoteData>;

export class FMPEquityQuoteFetcher extends AbstractFetcher<
  typeof FMPEquityQuoteQueryParams,
  typeof FMPEquityQuoteData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPEquityQuoteQueryParams>,
  ): Promise<z.input<typeof FMPEquityQuoteQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof FMPEquityQuoteQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const data = await fmpFetch<FmpQuote[]>(
      `/v3/quote/${encodeURIComponent(query.symbol)}`,
      apiKey,
    );
    if (!data || data.length === 0) throw new EmptyDataError(`No quote data for ${query.symbol}`);
    return data;
  }

  async transformData(raw: unknown): Promise<FMPEquityQuoteData[]> {
    const quotes = raw as FmpQuote[];
    return quotes
      .filter((q) => q.symbol)
      .map((q) =>
        FMPEquityQuoteData.parse({
          symbol: q.symbol,
          name: q.name ?? null,
          price: q.price ?? null,
          change: q.change ?? null,
          changePercent: q.changesPercentage ?? null,
          dayLow: q.dayLow ?? null,
          dayHigh: q.dayHigh ?? null,
          yearHigh: q.yearHigh ?? null,
          yearLow: q.yearLow ?? null,
          marketCap: q.marketCap ?? null,
          volume: q.volume ?? null,
          avgVolume: q.avgVolume ?? null,
          open: q.open ?? null,
          previousClose: q.previousClose ?? null,
          eps: q.eps ?? null,
          earningsAnnouncement: q.earningsAnnouncement ?? null,
          sharesOutstanding: q.sharesOutstanding ?? null,
          peRatio: q.pe ?? null,
        }),
      );
  }
}
