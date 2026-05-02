import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { searchCompanies } from "../utils/api";

export const TmxEquitySearchData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  exchange: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEquitySearchData = z.infer<typeof TmxEquitySearchData>;

export const TmxEquitySearchQueryParams = z.object({
  query: z.string().min(1, "Query is required"),
  exchange: z.enum(["tsx", "tsxv"]).default("tsx"),
});

export type TmxEquitySearchQueryParams = z.infer<typeof TmxEquitySearchQueryParams>;

/**
 * Fetcher for equity search on TSX and TSXV exchanges.
 * Endpoint: GET /json/company-directory/search/{exchange}/{query}
 */
export class TmxEquitySearchFetcher extends AbstractFetcher<
  typeof TmxEquitySearchQueryParams,
  typeof TmxEquitySearchData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEquitySearchQueryParams>,
  ) {
    return {
      query: params.query,
      exchange: params.exchange ?? "tsx",
    };
  }

  async extractData(
    query: z.infer<typeof TmxEquitySearchQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return searchCompanies(query.exchange, query.query);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxEquitySearchData.parse({
        symbol: row.symbol ?? row.ticker,
        name: row.name ?? row.companyName,
        exchange: row.exchange ?? "TSX",
        sector: row.sector,
        industry: row.industry,
      }),
    );
  }
}
