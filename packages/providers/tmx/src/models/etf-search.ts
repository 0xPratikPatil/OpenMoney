import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchEtfList } from "../utils/api";

export const TmxEtfSearchData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  exchange: z.string().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEtfSearchData = z.infer<typeof TmxEtfSearchData>;

export const TmxEtfSearchQueryParams = z.object({
  query: z.string().min(1, "Query is required"),
});

export type TmxEtfSearchQueryParams = z.infer<typeof TmxEtfSearchQueryParams>;

/**
 * Fetcher for ETF search on TMX.
 * Searches the full ETF list from cloudfront and filters by query.
 * Endpoint: GET /etfs/etfs.json
 */
export class TmxEtfSearchFetcher extends AbstractFetcher<
  typeof TmxEtfSearchQueryParams,
  typeof TmxEtfSearchData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEtfSearchQueryParams>,
  ) {
    return { query: params.query };
  }

  async extractData(
    query: z.infer<typeof TmxEtfSearchQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const etfs = await fetchEtfList();
    const q = query.query.toLowerCase();
    return (etfs as Array<Record<string, unknown>>).filter(
      (e) =>
        (e.symbol as string)?.toLowerCase().includes(q) ||
        (e.name as string)?.toLowerCase().includes(q),
    );
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxEtfSearchData.parse({
        symbol: row.symbol ?? row.ticker,
        name: row.name ?? row.etfName,
        exchange: row.exchange ?? "TSX",
      }),
    );
  }
}
