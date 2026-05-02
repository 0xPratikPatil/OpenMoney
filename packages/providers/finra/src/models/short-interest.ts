import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { finraGetFetch, extractFinraData } from "../utils/api";

export const FINRAShortInterestQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

export const FINRAShortInterestData = z.object({
  symbol: z.string().nullish(),
  date: z.string().nullish(),
  shortVolume: z.number().nullish(),
  totalVolume: z.number().nullish(),
  shortPercent: z.number().nullish(),
  market: z.string().nullish(),
  provider: z.literal("finra").default("finra"),
});

export type FINRAShortInterestData = z.infer<typeof FINRAShortInterestData>;

/**
 * Fetch short interest / short volume data from FINRA.
 * FINRA publishes daily short sale volume for all equity securities.
 */
export class FINRAShortInterestFetcher extends AbstractFetcher<
  typeof FINRAShortInterestQueryParams,
  typeof FINRAShortInterestData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof FINRAShortInterestQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 100,
    };
  }

  async extractData(
    query: z.infer<typeof FINRAShortInterestQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return finraGetFetch<unknown>("/group/OTCMarketMaking/name/shortSaleVolume", {
      symbol: query.symbol,
      limit: String(query.limit ?? 100),
    });
  }

  async transformData(raw: unknown): Promise<FINRAShortInterestData[]> {
    const rows = extractFinraData(raw, "data");

    return rows.map((r) => {
      const shortVol = parseFloat(String(r.shortVolume ?? 0));
      const totVol = parseFloat(String(r.totalVolume ?? 0));

      return FINRAShortInterestData.parse({
        symbol: (r.symbol ?? r.Symbol ?? null) as string | null,
        date: (r.date ?? r.Date ?? r.tradeDate ?? null) as string | null,
        shortVolume: isNaN(shortVol) ? null : shortVol,
        totalVolume: isNaN(totVol) ? null : totVol,
        shortPercent: totVol > 0 && !isNaN(shortVol) ? (shortVol / totVol) * 100 : null,
        market: (r.market ?? r.Market ?? null) as string | null,
      });
    });
  }
}
