import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { teFetch, parseTEValue } from "../utils/api";
import type { TEMarketData } from "../utils/api";

export const TEMarketsDataData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  country: z.string().nullish(),
  last: z.number().nullish(),
  date: z.string().nullish(),
  previous: z.number().nullish(),
  open: z.number().nullish(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  percentChange: z.number().nullish(),
  dailyChange: z.number().nullish(),
  weeklyChange: z.number().nullish(),
  monthlyChange: z.number().nullish(),
  yearlyChange: z.number().nullish(),
  provider: z.literal("tradingeconomics").default("tradingeconomics"),
});

export type TEMarketsDataData = z.infer<typeof TEMarketsDataData>;

export const TEMarketsDataQueryParams = z.object({
  symbol: z.string().optional(),
  market: z.enum(["bonds", "currencies", "commodities", "indexes"]).optional(),
});

export type TEMarketsDataQueryParams = z.infer<typeof TEMarketsDataQueryParams>;

/**
 * Fetch market data (bonds, currencies, commodities) from Trading Economics.
 */
export class TEMarketsDataFetcher extends AbstractFetcher<
  typeof TEMarketsDataQueryParams,
  typeof TEMarketsDataData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TEMarketsDataQueryParams>,
  ): Promise<z.input<typeof TEMarketsDataQueryParams>> {
    return {
      symbol: params.symbol,
      market: params.market,
    };
  }

  async extractData(
    query: z.infer<typeof TEMarketsDataQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.tradingeconomics_api_key;

    if (query.symbol) {
      return teFetch<TEMarketData[]>(`/markets/symbol/${query.symbol}`, apiKey);
    }

    if (query.market) {
      return teFetch<TEMarketData[]>(`/markets/${query.market}`, apiKey);
    }

    return teFetch<TEMarketData[]>("/markets", apiKey);
  }

  async transformData(
    raw: unknown,
  ): Promise<TEMarketsDataData[]> {
    const markets = raw as TEMarketData[];
    if (!markets || markets.length === 0) {
      throw new EmptyDataError("No Trading Economics market data returned");
    }
    return markets.map((m) =>
      TEMarketsDataData.parse({
        symbol: m.Symbol,
        name: m.Name ?? null,
        country: m.Country ?? null,
        last: parseTEValue(m.Last),
        date: m.Date ?? null,
        previous: parseTEValue(m.Previous),
        open: parseTEValue(m.Open),
        high: parseTEValue(m.High),
        low: parseTEValue(m.Low),
        percentChange: parseTEValue(m.PercentChange),
        dailyChange: parseTEValue(m.DailyChange),
        weeklyChange: parseTEValue(m.WeeklyChange),
        monthlyChange: parseTEValue(m.MonthlyChange),
        yearlyChange: parseTEValue(m.YearlyChange),
      }),
    );
  }
}
