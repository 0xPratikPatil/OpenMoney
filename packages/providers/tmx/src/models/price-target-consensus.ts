import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchPriceTargets } from "../utils/api";

export const TmxPriceTargetConsensusData = z.object({
  symbol: z.string(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  median: z.number().nullish(),
  average: z.number().nullish(),
  count: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxPriceTargetConsensusData = z.infer<typeof TmxPriceTargetConsensusData>;

export const TmxPriceTargetConsensusQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxPriceTargetConsensusQueryParams = z.infer<typeof TmxPriceTargetConsensusQueryParams>;

/**
 * Fetcher for price target consensus from TMX Money.
 * Endpoint: GET /api/company/{symbol}/price-targets
 */
export class TmxPriceTargetConsensusFetcher extends AbstractFetcher<
  typeof TmxPriceTargetConsensusQueryParams,
  typeof TmxPriceTargetConsensusData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxPriceTargetConsensusQueryParams>,
  ): Promise<z.input<typeof TmxPriceTargetConsensusQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxPriceTargetConsensusQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchPriceTargets(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxPriceTargetConsensusData[]> {
    const targets = raw as Record<string, unknown>;
    if (!targets || Object.keys(targets).length === 0) return [];

    return [
      TmxPriceTargetConsensusData.parse({
        symbol: targets.symbol as string,
        high: targets.high ?? targets.targetHigh,
        low: targets.low ?? targets.targetLow,
        median: targets.median ?? targets.targetMedian,
        average: targets.average ?? targets.targetMean,
        count: targets.count ?? targets.numberOfAnalysts,
      }),
    ];
  }
}
