import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { econdbFetch } from "../utils/api";
import type { EconDBSearchResult } from "../utils/api";

export const EconDBIndicatorSearchData = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullish(),
  description: z.string().nullish(),
  unit: z.string().nullish(),
  frequency: z.string().nullish(),
  provider: z.literal("econdb").default("econdb"),
});

export type EconDBIndicatorSearchData = z.infer<typeof EconDBIndicatorSearchData>;

export const EconDBIndicatorSearchQueryParams = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().default(50),
});

export type EconDBIndicatorSearchQueryParams = z.infer<typeof EconDBIndicatorSearchQueryParams>;

/**
 * Search for economic indicators available in EconDB.
 */
export class EconDBIndicatorSearchFetcher extends AbstractFetcher<
  typeof EconDBIndicatorSearchQueryParams,
  typeof EconDBIndicatorSearchData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof EconDBIndicatorSearchQueryParams>,
  ) {
    return {
      query: params.query,
      limit: params.limit ?? 50,
    };
  }

  async extractData(
    query: z.infer<typeof EconDBIndicatorSearchQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.econdb_api_key;
    return econdbFetch<EconDBSearchResult[]>(
      "/api/search",
      apiKey,
      { q: query.query, limit: query.limit },
    );
  }

  async transformData(
    raw: unknown,
  ) {
    const results = raw as EconDBSearchResult[];
    if (!results || results.length === 0) {
      throw new EmptyDataError("No EconDB indicator search results returned");
    }
    return results.map((r) =>
      EconDBIndicatorSearchData.parse({
        id: r.id,
        name: r.name,
        category: r.category ?? null,
        description: r.description ?? null,
        unit: r.unit ?? null,
        frequency: r.frequency ?? null,
      }),
    );
  }
}
