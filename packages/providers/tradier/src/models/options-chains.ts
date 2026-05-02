import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchOptionsChains } from "../utils/api";

export const TradierOptionsChainsQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  expiration: z.string().optional(),
});

export const TradierOptionsChainData = z.object({
  contractSymbol: z.string(),
  expiration: z.coerce.date().nullish(),
  strike: z.number(),
  type: z.enum(["call", "put"]),
  lastPrice: z.number().nullish(),
  change: z.number().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  volume: z.number().nullish(),
  openInterest: z.number().nullish(),
  impliedVolatility: z.number().nullish(),
  delta: z.number().nullish(),
  gamma: z.number().nullish(),
  theta: z.number().nullish(),
  vega: z.number().nullish(),
  inTheMoney: z.boolean().nullish(),
  provider: z.literal("tradier").default("tradier"),
});

export type TradierOptionsChainData = z.infer<typeof TradierOptionsChainData>;

/**
 * Fetcher for options chains from Tradier.
 * Uses /markets/options/chains.
 */
export class TradierOptionsChainsFetcher extends AbstractFetcher<
  typeof TradierOptionsChainsQueryParams,
  typeof TradierOptionsChainData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof TradierOptionsChainsQueryParams>) {
    return { symbol: params.symbol.toUpperCase(), expiration: params.expiration };
  }

  async extractData(
    query: z.infer<typeof TradierOptionsChainsQueryParams>,
    credentials: Record<string, string>,
  ) {
    return fetchOptionsChains(query.symbol, credentials, query.expiration);
  }

  async transformData(raw: unknown) {
    const options = raw as Array<Record<string, unknown>>;
    if (options.length === 0) throw new EmptyDataError();

    return options.map((o) =>
      TradierOptionsChainData.parse({
        contractSymbol: o.symbol ?? "",
        expiration: o.expiration_date ?? null,
        strike: o.strike ?? 0,
        type: o.option_type ?? "call",
        lastPrice: o.last ?? null,
        change: o.change ?? null,
        bid: o.bid ?? null,
        ask: o.ask ?? null,
        volume: o.volume ?? null,
        openInterest: o.open_interest ?? null,
        impliedVolatility: o.iv ?? null,
        delta: o.delta ?? null,
        gamma: o.gamma ?? null,
        theta: o.theta ?? null,
        vega: o.vega ?? null,
        inTheMoney: (o as any).in_the_money ?? null,
      }),
    );
  }
}
