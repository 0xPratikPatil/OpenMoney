import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchTreasury } from "../utils/api";

export const TmxTreasuryPricesData = z.object({
  symbol: z.string(),
  price: z.number().nullish(),
  yield: z.number().nullish(),
  maturity: z.string().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxTreasuryPricesData = z.infer<typeof TmxTreasuryPricesData>;

export const TmxTreasuryPricesQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxTreasuryPricesQueryParams = z.infer<typeof TmxTreasuryPricesQueryParams>;

/**
 * Fetcher for treasury prices from TMX Money.
 * Endpoint: GET /api/treasury/{symbol}
 */
export class TmxTreasuryPricesFetcher extends AbstractFetcher<
  typeof TmxTreasuryPricesQueryParams,
  typeof TmxTreasuryPricesData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxTreasuryPricesQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxTreasuryPricesQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchTreasury(query.symbol);
  }

  async transformData(raw: unknown) {
    const treasury = raw as Record<string, unknown>;
    if (!treasury || Object.keys(treasury).length === 0) return [];

    return [
      TmxTreasuryPricesData.parse({
        symbol: treasury.symbol ?? treasury.ticker,
        price: treasury.price ?? treasury.lastPrice,
        yield: treasury.yield,
        maturity: treasury.maturity ?? treasury.maturityDate,
      }),
    ];
  }
}
