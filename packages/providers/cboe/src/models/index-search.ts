import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchAllIndices } from "../utils/api";

export const CboeIndexSearchData = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeIndexSearchData = z.infer<typeof CboeIndexSearchData>;

export const CboeIndexSearchQueryParams = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().int().min(1).max(500).default(50),
});

export type CboeIndexSearchQueryParams = z.infer<typeof CboeIndexSearchQueryParams>;

/**
 * Fetcher for searching available indices from CBOE.
 */
export class CboeIndexSearchFetcher extends AbstractFetcher<
  typeof CboeIndexSearchQueryParams,
  typeof CboeIndexSearchData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeIndexSearchQueryParams>,
  ): Promise<z.input<typeof CboeIndexSearchQueryParams>> {
    return { query: params.query.toUpperCase(), limit: params.limit ?? 50 };
  }

  async extractData(
    _query: z.infer<typeof CboeIndexSearchQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchAllIndices();
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof CboeIndexSearchQueryParams>,
  ): Promise<CboeIndexSearchData[]> {
    const indices = raw as Array<Record<string, unknown>>;
    if (indices.length === 0) throw new EmptyDataError("No indices data returned");

    const searchQuery = query?.query?.toUpperCase() ?? "";
    const limit = query?.limit ?? 50;

    const filtered = indices.filter(
      (i) =>
        ((i.code ?? i.symbol ?? "") as string).toUpperCase().includes(searchQuery) ||
        ((i.name ?? i.description ?? "") as string).toUpperCase().includes(searchQuery),
    );

    if (filtered.length === 0) throw new EmptyDataError("No matching indices found");

    return filtered.slice(0, limit).map((i) =>
      CboeIndexSearchData.parse({
        code: i.code ?? i.index_code ?? i.symbol,
        name: i.name ?? i.index_name ?? i.description,
        symbol: i.symbol ?? i.ticker ?? i.code,
      }),
    );
  }
}
