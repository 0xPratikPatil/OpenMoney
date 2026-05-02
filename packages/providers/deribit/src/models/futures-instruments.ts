import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchDeribit } from "../utils/api";

export const DeribitFuturesInstrumentsData = z.object({
  symbol: z.string(),
  kind: z.string(),
  baseCurrency: z.string(),
  quoteCurrency: z.string().nullish(),
  settlementPeriod: z.string().nullish(),
  contractSize: z.number().nullish(),
  tickSize: z.number().nullish(),
  isActive: z.boolean().nullish(),
  expiration: z.string().nullish(),
  provider: z.literal("deribit").default("deribit"),
});

export type DeribitFuturesInstrumentsData = z.infer<typeof DeribitFuturesInstrumentsData>;

export const DeribitFuturesInstrumentsQueryParams = z.object({
  currency: z.enum(["BTC", "ETH", "SOL", "USDC"]).default("BTC"),
  kind: z.enum(["future", "option"]).default("future"),
});

export type DeribitFuturesInstrumentsQueryParams = z.infer<typeof DeribitFuturesInstrumentsQueryParams>;

/**
 * Fetcher for detailed futures instrument information from Deribit.
 */
export class DeribitFuturesInstrumentsFetcher extends AbstractFetcher<
  typeof DeribitFuturesInstrumentsQueryParams,
  typeof DeribitFuturesInstrumentsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof DeribitFuturesInstrumentsQueryParams>,
  ) {
    const currency = (params.currency ?? "BTC").toUpperCase() as "BTC" | "ETH" | "SOL" | "USDC";
    const kind = params.kind ?? "future";
    return { currency, kind };
  }

  async extractData(
    query: z.infer<typeof DeribitFuturesInstrumentsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const instruments = await fetchDeribit<any[]>("get_instruments", {
      currency: query.currency,
      kind: query.kind,
      expired: false,
    });
    return instruments;
  }

  async transformData(
    raw: unknown,
  ) {
    const instruments = raw as Array<Record<string, unknown>>;
    if (instruments.length === 0) throw new EmptyDataError("No instruments found");

    return instruments.map((i) =>
      DeribitFuturesInstrumentsData.parse({
        symbol: i.instrument_name ?? i.symbol,
        kind: i.kind ?? "future",
        baseCurrency: i.base_currency ?? i.currency,
        quoteCurrency: i.quote_currency ?? null,
        settlementPeriod: i.settlement_period ?? null,
        contractSize: i.contract_size ?? null,
        tickSize: i.tick_size ?? null,
        isActive: i.is_active != null ? Boolean(i.is_active) : null,
        expiration: i.expiration_timestamp
          ? new Date((i.expiration_timestamp as number) * 1000).toISOString()
          : (i.expiration ?? null),
      }),
    );
  }
}
