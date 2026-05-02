import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuotes } from "../utils/api";

/**
 * Price Target Consensus fetcher.
 * Port of OpenBB's YFinancePriceTargetConsensusFetcher.
 */
export const YFinancePriceTargetConsensusQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinancePriceTargetConsensusData = z.object({
  symbol: z.string(),
  targetHigh: z.number().nullish(),
  targetLow: z.number().nullish(),
  targetConsensus: z.number().nullish(),
  targetMedian: z.number().nullish(),
  recommendation: z.string().nullish(),
  recommendationMean: z.number().nullish(),
  numberOfAnalysts: z.number().nullish(),
  currentPrice: z.number().nullish(),
  currency: z.string().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinancePriceTargetConsensusData = z.infer<typeof YFinancePriceTargetConsensusData>;

export class YFinancePriceTargetConsensusFetcher extends AbstractFetcher<
  typeof YFinancePriceTargetConsensusQueryParams,
  typeof YFinancePriceTargetConsensusData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinancePriceTargetConsensusQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinancePriceTargetConsensusQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const quotes = await fetchQuotes([query.symbol]);
    const quote = quotes[query.symbol];
    if (!quote) throw new EmptyDataError(`No data for symbol: ${query.symbol}`);
    return quote;
  }

  async transformData(raw: unknown) {
    const quote = raw as Record<string, unknown>;
    const symbol = quote.symbol as string;
    if (!symbol) throw new EmptyDataError("No symbol in response");

    return [
      YFinancePriceTargetConsensusData.parse({
        symbol,
        targetHigh: quote.targetHighPrice ?? null,
        targetLow: quote.targetLowPrice ?? null,
        targetConsensus: quote.targetMeanPrice ?? null,
        targetMedian: quote.targetMedianPrice ?? null,
        recommendation: quote.recommendationKey ?? null,
        recommendationMean: quote.recommendationMean ?? null,
        numberOfAnalysts: quote.numberOfAnalystOpinions ?? null,
        currentPrice: quote.currentPrice ?? quote.regularMarketPrice ?? null,
        currency: quote.currency ?? null,
      }),
    ];
  }
}
