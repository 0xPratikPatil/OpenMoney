import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchOptions } from "../utils/api";

export const TmxOptionsChainsData = z.object({
  contractSymbol: z.string().nullish(),
  expiration: z.string().nullish(),
  strike: z.number().nullish(),
  type: z.enum(["call", "put"]).nullish(),
  lastPrice: z.number().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  volume: z.number().nullish(),
  openInterest: z.number().nullish(),
  impliedVolatility: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxOptionsChainsData = z.infer<typeof TmxOptionsChainsData>;

export const TmxOptionsChainsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxOptionsChainsQueryParams = z.infer<typeof TmxOptionsChainsQueryParams>;

/**
 * Fetcher for options chains from Montreal Exchange.
 * Endpoint: GET /en/trading/data/options-list?symbol={symbol}
 */
export class TmxOptionsChainsFetcher extends AbstractFetcher<
  typeof TmxOptionsChainsQueryParams,
  typeof TmxOptionsChainsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxOptionsChainsQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxOptionsChainsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchOptions(query.symbol);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxOptionsChainsData.parse({
        contractSymbol: row.contractSymbol ?? row.symbol,
        expiration: row.expiration ?? row.expiryDate,
        strike: row.strike ?? row.strikePrice,
        type: (row.type as "call" | "put") ?? row.optionType,
        lastPrice: row.lastPrice ?? row.price,
        bid: row.bid,
        ask: row.ask,
        volume: row.volume,
        openInterest: row.openInterest,
        impliedVolatility: row.impliedVolatility ?? row.iv,
      }),
    );
  }
}
