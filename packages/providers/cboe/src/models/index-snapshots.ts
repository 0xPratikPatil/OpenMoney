import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchIndexSnapshot } from "../utils/api";

export const CboeIndexSnapshotsData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  yearHigh: z.number().nullish(),
  yearLow: z.number().nullish(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeIndexSnapshotsData = z.infer<typeof CboeIndexSnapshotsData>;

export const CboeIndexSnapshotsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase().replace("^", "")),
});

export type CboeIndexSnapshotsQueryParams = z.infer<typeof CboeIndexSnapshotsQueryParams>;

/**
 * Fetcher for index snapshot data from CBOE.
 */
export class CboeIndexSnapshotsFetcher extends AbstractFetcher<
  typeof CboeIndexSnapshotsQueryParams,
  typeof CboeIndexSnapshotsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeIndexSnapshotsQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase().replace("^", "") };
  }

  async extractData(
    query: z.infer<typeof CboeIndexSnapshotsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchIndexSnapshot(query.symbol);
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof CboeIndexSnapshotsQueryParams>,
  ) {
    const data = raw as Record<string, unknown> | null;
    if (!data) throw new EmptyDataError("No index snapshot data returned");

    return [
      CboeIndexSnapshotsData.parse({
        symbol: data.symbol ?? query?.symbol,
        name: data.name ?? data.description ?? null,
        price: data.current_price ?? data.price ?? null,
        change: data.change ?? null,
        changePercent: data.change_percent ?? null,
        yearHigh: data.annual_high ?? data.year_high ?? null,
        yearLow: data.annual_low ?? data.year_low ?? null,
      }),
    ];
  }
}
