import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchOptionsChain } from "../utils/api";

export const CboeOptionsChainData = z.object({
  contractSymbol: z.string(),
  expiration: z.string().nullish(),
  strike: z.number(),
  type: z.enum(["call", "put"]),
  lastPrice: z.number().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  volume: z.number().nullish(),
  openInterest: z.number().nullish(),
  impliedVolatility: z.number().nullish(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeOptionsChainData = z.infer<typeof CboeOptionsChainData>;

export const CboeOptionsChainQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase().replace("^", "")),
});

export type CboeOptionsChainQueryParams = z.infer<typeof CboeOptionsChainQueryParams>;

/**
 * Fetcher for options chains from CBOE.
 */
export class CboeOptionsChainFetcher extends AbstractFetcher<
  typeof CboeOptionsChainQueryParams,
  typeof CboeOptionsChainData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeOptionsChainQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase().replace("^", "") };
  }

  async extractData(
    query: z.infer<typeof CboeOptionsChainQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchOptionsChain(query.symbol);
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as any;
    const options = data?.data?.options ?? [];

    if (options.length === 0) {
      // Try alternative response format
      const altOptions = data?.options ?? [];
      if (altOptions.length === 0) {
        throw new EmptyDataError("No options chain data returned from CBOE");
      }
      return mapOptions(altOptions);
    }

    return mapOptions(options);
  }
}

/**
 * Map raw CBOE option records to the standard schema.
 */
function mapOptions(options: Array<Record<string, unknown>>): CboeOptionsChainData[] {
  return options.map((o) =>
    CboeOptionsChainData.parse({
      contractSymbol: o.option ?? o.contract_symbol ?? o.symbol ?? "",
      expiration: o.expiration ?? o.expiry_date ?? o.expiry ?? null,
      strike: o.strike ?? o.strike_price ?? 0,
      type: (o.option_type ?? o.type ?? "call").toString().toLowerCase() as "call" | "put",
      lastPrice: o.last ?? o.last_price ?? null,
      bid: o.bid ?? null,
      ask: o.ask ?? null,
      volume: o.volume ?? null,
      openInterest: o.open_interest ?? o.oi ?? null,
      impliedVolatility: o.iv ?? o.implied_volatility ?? null,
    }),
  );
}
