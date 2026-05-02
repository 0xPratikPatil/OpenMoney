import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchIndexConstituents } from "../utils/api";

export const CboeIndexConstituentsData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  weight: z.number().nullish(),
  sector: z.string().nullish(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeIndexConstituentsData = z.infer<typeof CboeIndexConstituentsData>;

export const CboeIndexConstituentsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase().replace("^", "")),
});

export type CboeIndexConstituentsQueryParams = z.infer<typeof CboeIndexConstituentsQueryParams>;

/**
 * Fetcher for index constituents from CBOE.
 */
export class CboeIndexConstituentsFetcher extends AbstractFetcher<
  typeof CboeIndexConstituentsQueryParams,
  typeof CboeIndexConstituentsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeIndexConstituentsQueryParams>,
  ): Promise<z.input<typeof CboeIndexConstituentsQueryParams>> {
    return { symbol: params.symbol.toUpperCase().replace("^", "") };
  }

  async extractData(
    query: z.infer<typeof CboeIndexConstituentsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchIndexConstituents(query.symbol);
  }

  async transformData(
    raw: unknown,
  ): Promise<CboeIndexConstituentsData[]> {
    const constituents = raw as Array<Record<string, unknown>>;
    if (constituents.length === 0) throw new EmptyDataError("No constituents data returned");
    return constituents.map((c) =>
      CboeIndexConstituentsData.parse({
        symbol: c.symbol ?? c.ticker,
        name: c.name ?? c.company_name ?? c.description ?? null,
        weight: c.weight ?? c.index_weight ?? null,
        sector: c.sector ?? null,
      }),
    );
  }
}
