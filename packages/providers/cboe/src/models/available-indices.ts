import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchAllIndices } from "../utils/api";

export const CboeAvailableIndicesData = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeAvailableIndicesData = z.infer<typeof CboeAvailableIndicesData>;

export const CboeAvailableIndicesQueryParams = z.object({
  // No params needed — returns all available indices
});

export type CboeAvailableIndicesQueryParams = z.infer<typeof CboeAvailableIndicesQueryParams>;

/**
 * Fetcher for available index list from CBOE.
 */
export class CboeAvailableIndicesFetcher extends AbstractFetcher<
  typeof CboeAvailableIndicesQueryParams,
  typeof CboeAvailableIndicesData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeAvailableIndicesQueryParams>,
  ) {
    return { ...params };
  }

  async extractData(
    _query: z.infer<typeof CboeAvailableIndicesQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchAllIndices();
  }

  async transformData(
    raw: unknown,
  ) {
    const indices = raw as Array<Record<string, unknown>>;
    if (indices.length === 0) throw new EmptyDataError("No indices data returned");
    return indices.map((i) =>
      CboeAvailableIndicesData.parse({
        code: i.code ?? i.index_code ?? i.symbol,
        name: i.name ?? i.index_name ?? i.description,
        symbol: i.symbol ?? i.ticker ?? i.code,
      }),
    );
  }
}
