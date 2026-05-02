import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBond } from "../utils/api";

export const TmxBondPricesData = z.object({
  symbol: z.string(),
  price: z.number().nullish(),
  yield: z.number().nullish(),
  maturity: z.string().nullish(),
  coupon: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxBondPricesData = z.infer<typeof TmxBondPricesData>;

export const TmxBondPricesQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxBondPricesQueryParams = z.infer<typeof TmxBondPricesQueryParams>;

/**
 * Fetcher for bond prices from TMX Money.
 * Endpoint: GET /api/bonds/{symbol}
 */
export class TmxBondPricesFetcher extends AbstractFetcher<
  typeof TmxBondPricesQueryParams,
  typeof TmxBondPricesData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxBondPricesQueryParams>,
  ): Promise<z.input<typeof TmxBondPricesQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxBondPricesQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchBond(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxBondPricesData[]> {
    const bond = raw as Record<string, unknown>;
    if (!bond || Object.keys(bond).length === 0) return [];

    return [
      TmxBondPricesData.parse({
        symbol: bond.symbol ?? bond.ticker,
        price: bond.price ?? bond.lastPrice,
        yield: bond.yield,
        maturity: bond.maturity ?? bond.maturityDate,
        coupon: bond.coupon ?? bond.couponRate,
      }),
    ];
  }
}
