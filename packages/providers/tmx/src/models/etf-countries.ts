import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchEtfCountries } from "../utils/api";

export const TmxEtfCountriesData = z.object({
  country: z.string(),
  weight: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEtfCountriesData = z.infer<typeof TmxEtfCountriesData>;

export const TmxEtfCountriesQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxEtfCountriesQueryParams = z.infer<typeof TmxEtfCountriesQueryParams>;

/**
 * Fetcher for ETF country allocations from TMX Money.
 * Endpoint: GET /api/etf/{symbol}/countries
 */
export class TmxEtfCountriesFetcher extends AbstractFetcher<
  typeof TmxEtfCountriesQueryParams,
  typeof TmxEtfCountriesData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEtfCountriesQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxEtfCountriesQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchEtfCountries(query.symbol);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxEtfCountriesData.parse({
        country: row.country ?? row.name,
        weight: row.weight,
      }),
    );
  }
}
