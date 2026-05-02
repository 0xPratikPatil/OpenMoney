import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchOptionsChain } from "../utils/api";

export const PolygonOptionsChainsQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  expiration: z.string().optional(),
  strikePrice: z.number().optional(),
  contractType: z.enum(["call", "put"]).optional(),
});

export const PolygonOptionsChainData = z.object({
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
  provider: z.literal("polygon").default("polygon"),
});

export type PolygonOptionsChainData = z.infer<typeof PolygonOptionsChainData>;

/**
 * Fetcher for options chains from Polygon.io.
 * Uses /v3/snapshot/options/{underlyingAsset}.
 */
export class PolygonOptionsChainsFetcher extends AbstractFetcher<
  typeof PolygonOptionsChainsQueryParams,
  typeof PolygonOptionsChainData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof PolygonOptionsChainsQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      expiration: params.expiration,
      strikePrice: params.strikePrice,
      contractType: params.contractType,
    };
  }

  async extractData(
    query: z.infer<typeof PolygonOptionsChainsQueryParams>,
    credentials: Record<string, string>,
  ) {
    return fetchOptionsChain(query.symbol, credentials);
  }

  async transformData(raw: unknown) {
    const results = raw as any[];
    if (results.length === 0) throw new EmptyDataError();

    return results.map((o: any) =>
      PolygonOptionsChainData.parse({
        contractSymbol: o?.details?.contract_type
          ? `${o.underlyingAsset ?? ""}_${o.strike ?? ""}_${o?.details?.expiration ?? ""}_${o?.details?.contract_type ?? ""}`
          : String(o?.underlyingAsset ?? ""),
        expiration: o?.details?.expiration ?? null,
        strike: o.strike ?? 0,
        type: o?.details?.contract_type ?? "call",
        lastPrice: o?.day?.c ?? null,
        change: o?.day?.c && o?.prevDay?.c
          ? o.day.c - o.prevDay.c
          : null,
        bid: o.bid ?? null,
        ask: o.ask ?? null,
        volume: o?.day?.v ?? null,
        openInterest: o.openInterest ?? null,
        impliedVolatility: o.impliedVolatility ?? null,
        delta: o?.greeks?.delta ?? null,
        gamma: o?.greeks?.gamma ?? null,
        theta: o?.greeks?.theta ?? null,
        vega: o?.greeks?.vega ?? null,
        inTheMoney: o.inTheMoney ?? null,
      }),
    );
  }
}
