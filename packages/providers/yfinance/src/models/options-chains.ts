import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchOptions } from "../utils/api";

export const YFinanceOptionsChainsQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  expiration: z.string().optional(),
});

export const YFinanceOptionsChainData = z.object({
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
  inTheMoney: z.boolean().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceOptionsChainData = z.infer<typeof YFinanceOptionsChainData>;

export class YFinanceOptionsChainsFetcher extends AbstractFetcher<
  typeof YFinanceOptionsChainsQueryParams,
  typeof YFinanceOptionsChainData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceOptionsChainsQueryParams>) {
    return { symbol: params.symbol.toUpperCase(), expiration: params.expiration };
  }

  async extractData(
    query: z.infer<typeof YFinanceOptionsChainsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const results = await fetchOptions(query.symbol, query.expiration);
    if (results.length === 0) throw new EmptyDataError();
    return results;
  }

  async transformData(raw: unknown): Promise<YFinanceOptionsChainData[]> {
    const results = raw as Array<any>;
    const allOptions: any[] = [];
    for (const result of results) {
      const expiration = result?.options?.[0]?.expiration ?? null;
      const expDate = expiration ? new Date(expiration * 1000) : null;
      const calls: any[] = result?.options?.[0]?.calls ?? [];
      const puts: any[] = result?.options?.[0]?.puts ?? [];
      for (const o of calls) {
        allOptions.push({ ...o, _type: "call", _expDate: expDate });
      }
      for (const o of puts) {
        allOptions.push({ ...o, _type: "put", _expDate: expDate });
      }
    }
    if (allOptions.length === 0) throw new EmptyDataError();
    return allOptions.map((o) =>
      YFinanceOptionsChainData.parse({
        contractSymbol: o.contractSymbol ?? "",
        expiration: o._expDate,
        strike: o.strike ?? 0,
        type: o._type,
        lastPrice: o.lastPrice ?? null,
        change: o.change ?? null,
        bid: o.bid ?? null,
        ask: o.ask ?? null,
        volume: o.volume ?? null,
        openInterest: o.openInterest ?? null,
        impliedVolatility: o.impliedVolatility ?? null,
        inTheMoney: o.inTheMoney ?? null,
      }),
    );
  }
}
