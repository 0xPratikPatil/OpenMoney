import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchDeribit } from "../utils/api";

export const DeribitOptionsChainData = z.object({
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
  provider: z.literal("deribit").default("deribit"),
});

export type DeribitOptionsChainData = z.infer<typeof DeribitOptionsChainData>;

export const DeribitOptionsChainQueryParams = z.object({
  symbol: z.string().min(1, "Instrument name is required"),
});

export type DeribitOptionsChainQueryParams = z.infer<typeof DeribitOptionsChainQueryParams>;

/**
 * Fetcher for options chain data from Deribit.
 */
export class DeribitOptionsChainFetcher extends AbstractFetcher<
  typeof DeribitOptionsChainQueryParams,
  typeof DeribitOptionsChainData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof DeribitOptionsChainQueryParams>,
  ): Promise<z.input<typeof DeribitOptionsChainQueryParams>> {
    return { symbol: params.symbol };
  }

  async extractData(
    query: z.infer<typeof DeribitOptionsChainQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    // Get book summary for the option
    const summaries = await fetchDeribit<any[]>("get_book_summary_by_instrument", {
      instrument_name: query.symbol,
    });
    return summaries;
  }

  async transformData(
    raw: unknown,
  ): Promise<DeribitOptionsChainData[]> {
    const summaries = raw as Array<Record<string, unknown>>;
    if (summaries.length === 0) throw new EmptyDataError("No options chain data returned");

    return summaries.map((s) => {
      const instrumentName = (s.instrument_name ?? "") as string;
      // Deribit option instrument names: BTC-24JUN25-80000-C
      const parts = instrumentName.split("-");
      const typeStr = parts.length >= 4 ? (parts[parts.length - 1] as string).toLowerCase() : "call";
      const strike = parts.length >= 3 ? parseFloat(parts[parts.length - 2] ?? "0") : 0;

      return DeribitOptionsChainData.parse({
        contractSymbol: instrumentName,
        expiration: s.expiration_timestamp
          ? new Date((s.expiration_timestamp as number) * 1000).toISOString()
          : null,
        strike,
        type: (typeStr === "p" ? "put" : "call") as "call" | "put",
        lastPrice: (s.last_price as number) ?? null,
        bid: (s.bid_price as number) ?? null,
        ask: (s.ask_price as number) ?? null,
        volume: (s.volume as number) ?? null,
        openInterest: (s.open_interest as number) ?? null,
        impliedVolatility: (s.iv as number) ?? null,
      });
    });
  }
}
