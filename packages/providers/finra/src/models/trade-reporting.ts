import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { finraGetFetch, extractFinraData } from "../utils/api";

export const FINRATradeReportingQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

export const FINRATradeReportingData = z.object({
  symbol: z.string().nullish(),
  date: z.string().nullish(),
  tradeVolume: z.number().nullish(),
  tradeCount: z.number().nullish(),
  totalVolume: z.number().nullish(),
  highPrice: z.number().nullish(),
  lowPrice: z.number().nullish(),
  lastPrice: z.number().nullish(),
  market: z.string().nullish(),
  provider: z.literal("finra").default("finra"),
});

export type FINRATradeReportingData = z.infer<typeof FINRATradeReportingData>;

/**
 * Fetch Trade Reporting Facility (TRF) data from FINRA.
 * TRF data covers over-the-counter (OTC) equity trades reported to FINRA.
 */
export class FINRATradeReportingFetcher extends AbstractFetcher<
  typeof FINRATradeReportingQueryParams,
  typeof FINRATradeReportingData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof FINRATradeReportingQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 100,
    };
  }

  async extractData(
    query: z.infer<typeof FINRATradeReportingQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return finraGetFetch<unknown>("/group/OTCMarketMaking/name/otcTradeVolume", {
      symbol: query.symbol,
      limit: String(query.limit ?? 100),
    });
  }

  async transformData(raw: unknown): Promise<FINRATradeReportingData[]> {
    const rows = extractFinraData(raw, "data");

    return rows.map((r) => {
      const toNum = (val: unknown): number | null => {
        if (val == null) return null;
        const n = parseFloat(String(val));
        return isNaN(n) ? null : n;
      };

      return FINRATradeReportingData.parse({
        symbol: (r.symbol ?? r.Symbol ?? null) as string | null,
        date: (r.date ?? r.Date ?? r.tradeDate ?? null) as string | null,
        tradeVolume: toNum(r.tradeVolume ?? r.volume),
        tradeCount: toNum(r.tradeCount ?? r.count),
        totalVolume: toNum(r.totalVolume),
        highPrice: toNum(r.highPrice ?? r.high),
        lowPrice: toNum(r.lowPrice ?? r.low),
        lastPrice: toNum(r.lastPrice ?? r.close ?? r.last),
        market: (r.market ?? r.Market ?? null) as string | null,
      });
    });
  }
}
