import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchDeribit } from "../utils/api";

export const DeribitFuturesInfoData = z.object({
  symbol: z.string(),
  kind: z.string(),
  baseCurrency: z.string(),
  settlementPeriod: z.string().nullish(),
  contractSize: z.number().nullish(),
  tickSize: z.number().nullish(),
  futuresType: z.string().nullish(),
  provider: z.literal("deribit").default("deribit"),
});

export type DeribitFuturesInfoData = z.infer<typeof DeribitFuturesInfoData>;

export const DeribitFuturesInfoQueryParams = z.object({
  currency: z.enum(["BTC", "ETH", "SOL", "USDC"]).default("BTC"),
});

export type DeribitFuturesInfoQueryParams = z.infer<typeof DeribitFuturesInfoQueryParams>;

/**
 * Fetcher for Deribit futures instrument info.
 */
export class DeribitFuturesInfoFetcher extends AbstractFetcher<
  typeof DeribitFuturesInfoQueryParams,
  typeof DeribitFuturesInfoData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof DeribitFuturesInfoQueryParams>,
  ): Promise<z.input<typeof DeribitFuturesInfoQueryParams>> {
    const currency = (params.currency ?? "BTC").toUpperCase() as "BTC" | "ETH" | "SOL" | "USDC";
    return { currency };
  }

  async extractData(
    query: z.infer<typeof DeribitFuturesInfoQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const instruments = await fetchDeribit<any[]>("get_instruments", {
      currency: query.currency,
      kind: "future",
      expired: false,
    });
    return instruments;
  }

  async transformData(
    raw: unknown,
  ): Promise<DeribitFuturesInfoData[]> {
    const instruments = raw as Array<Record<string, unknown>>;
    if (instruments.length === 0) throw new EmptyDataError("No futures instruments found");

    return instruments.map((i) =>
      DeribitFuturesInfoData.parse({
        symbol: i.instrument_name ?? i.symbol,
        kind: i.kind ?? "future",
        baseCurrency: i.base_currency ?? i.currency,
        settlementPeriod: i.settlement_period ?? null,
        contractSize: i.contract_size ?? null,
        tickSize: i.tick_size ?? null,
        futuresType: i.futures_type ?? i.future_type ?? null,
      }),
    );
  }
}
