import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchEtfHoldings } from "../utils/api";

export const TmxEtfHoldingsData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  weight: z.number().nullish(),
  sector: z.string().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEtfHoldingsData = z.infer<typeof TmxEtfHoldingsData>;

export const TmxEtfHoldingsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxEtfHoldingsQueryParams = z.infer<typeof TmxEtfHoldingsQueryParams>;

/**
 * Fetcher for ETF holdings from TMX Money.
 * Endpoint: GET /api/etf/{symbol}/holdings
 */
export class TmxEtfHoldingsFetcher extends AbstractFetcher<
  typeof TmxEtfHoldingsQueryParams,
  typeof TmxEtfHoldingsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEtfHoldingsQueryParams>,
  ): Promise<z.input<typeof TmxEtfHoldingsQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxEtfHoldingsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchEtfHoldings(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxEtfHoldingsData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxEtfHoldingsData.parse({
        symbol: row.symbol ?? row.ticker,
        name: row.name ?? row.holdingName,
        weight: row.weight,
        sector: row.sector,
      }),
    );
  }
}
