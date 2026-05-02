import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchEtfList } from "../utils/api";

export const TmxEtfInfoData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  issuer: z.string().nullish(),
  category: z.string().nullish(),
  managementFee: z.number().nullish(),
  mer: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEtfInfoData = z.infer<typeof TmxEtfInfoData>;

export const TmxEtfInfoQueryParams = z.object({
  // No required params — returns full ETF list
  symbol: z.string().optional(),
});

export type TmxEtfInfoQueryParams = z.infer<typeof TmxEtfInfoQueryParams>;

/**
 * Fetcher for ETF information from TMX.
 * Endpoint: GET /etfs/etfs.json (cloudfront)
 */
export class TmxEtfInfoFetcher extends AbstractFetcher<
  typeof TmxEtfInfoQueryParams,
  typeof TmxEtfInfoData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEtfInfoQueryParams>,
  ): Promise<z.input<typeof TmxEtfInfoQueryParams>> {
    return { ...params };
  }

  async extractData(
    query: z.infer<typeof TmxEtfInfoQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const etfs = await fetchEtfList();
    if (query.symbol) {
      const upper = query.symbol.toUpperCase();
      return (etfs as Array<Record<string, unknown>>).filter(
        (e) => (e.symbol as string)?.toUpperCase() === upper,
      );
    }
    return etfs;
  }

  async transformData(raw: unknown): Promise<TmxEtfInfoData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxEtfInfoData.parse({
        symbol: row.symbol ?? row.ticker,
        name: row.name ?? row.etfName,
        issuer: row.issuer ?? row.provider,
        category: row.category,
        managementFee: row.managementFee ?? row.managementFees,
        mer: row.mer ?? row.expenseRatio,
      }),
    );
  }
}
