import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { finraGetFetch, extractFinraData } from "../utils/api";

export const FINRAOtcDataQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

export const FINRAOtcData = z.object({
  symbol: z.string().nullish(),
  date: z.string().nullish(),
  otcVolume: z.number().nullish(),
  otcTrades: z.number().nullish(),
  otcShareVolume: z.number().nullish(),
  market: z.string().nullish(),
  provider: z.literal("finra").default("finra"),
});

export type FINRAOtcData = z.infer<typeof FINRAOtcData>;

/**
 * Fetch OTC (Over-the-Counter) transparency data from FINRA.
 * Provides transparency data on OTC equity securities including
 * trade reporting statistics.
 */
export class FINRAOtcDataFetcher extends AbstractFetcher<
  typeof FINRAOtcDataQueryParams,
  typeof FINRAOtcData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof FINRAOtcDataQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 100,
    };
  }

  async extractData(
    query: z.infer<typeof FINRAOtcDataQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return finraGetFetch<unknown>("/group/OTCMarketMaking/name/otcDaily", {
      symbol: query.symbol,
      limit: String(query.limit ?? 100),
    });
  }

  async transformData(raw: unknown) {
    const rows = extractFinraData(raw, "data");

    return rows.map((r) => {
      const toNum = (val: unknown): number | null => {
        if (val == null) return null;
        const n = parseFloat(String(val));
        return isNaN(n) ? null : n;
      };

      return FINRAOtcData.parse({
        symbol: (r.symbol ?? r.Symbol ?? null) as string | null,
        date: (r.date ?? r.Date ?? r.tradeDate ?? null) as string | null,
        otcVolume: toNum(r.otcVolume ?? r.volume ?? r.OTCVolume),
        otcTrades: toNum(r.otcTrades ?? r.trades ?? r.OTCTrades),
        otcShareVolume: toNum(r.otcShareVolume ?? r.shareVolume),
        market: (r.market ?? r.Market ?? null) as string | null,
      });
    });
  }
}
