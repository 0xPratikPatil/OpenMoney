import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchIndexConstituents } from "../utils/api";

export const TmxIndexConstituentsData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  weight: z.number().nullish(),
  sector: z.string().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxIndexConstituentsData = z.infer<typeof TmxIndexConstituentsData>;

export const TmxIndexConstituentsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxIndexConstituentsQueryParams = z.infer<typeof TmxIndexConstituentsQueryParams>;

/**
 * Fetcher for index constituents from TMX Money.
 * Endpoint: GET /api/index/{symbol}/constituents
 */
export class TmxIndexConstituentsFetcher extends AbstractFetcher<
  typeof TmxIndexConstituentsQueryParams,
  typeof TmxIndexConstituentsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxIndexConstituentsQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxIndexConstituentsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchIndexConstituents(query.symbol);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxIndexConstituentsData.parse({
        symbol: row.symbol ?? row.ticker,
        name: row.name ?? row.companyName,
        weight: row.weight,
        sector: row.sector,
      }),
    );
  }
}
