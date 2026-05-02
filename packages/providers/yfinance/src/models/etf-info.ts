import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchQuotes, fetchQuoteSummary } from "../utils/api";

/**
 * ETF Info fetcher.
 * Port of OpenBB's YFinanceEtfInfoFetcher.
 */
export const YFinanceEtfInfoQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceEtfInfoData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  fundFamily: z.string().nullish(),
  fundType: z.string().nullish(),
  category: z.string().nullish(),
  exchange: z.string().nullish(),
  exchangeTimezone: z.string().nullish(),
  currency: z.string().nullish(),
  navPrice: z.number().nullish(),
  totalAssets: z.number().nullish(),
  trailingPe: z.number().nullish(),
  dividendYield: z.number().nullish(),
  dividendRateTtm: z.number().nullish(),
  dividendYieldTtm: z.number().nullish(),
  yearHigh: z.number().nullish(),
  yearLow: z.number().nullish(),
  ma50d: z.number().nullish(),
  ma200d: z.number().nullish(),
  returnYtd: z.number().nullish(),
  return3yAvg: z.number().nullish(),
  return5yAvg: z.number().nullish(),
  beta3yAvg: z.number().nullish(),
  volumeAvg: z.number().nullish(),
  volumeAvg10d: z.number().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  open: z.number().nullish(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  volume: z.number().nullish(),
  prevClose: z.number().nullish(),
  description: z.string().nullish(),
  inceptionDate: z.string().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceEtfInfoData = z.infer<typeof YFinanceEtfInfoData>;

export class YFinanceEtfInfoFetcher extends AbstractFetcher<
  typeof YFinanceEtfInfoQueryParams,
  typeof YFinanceEtfInfoData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceEtfInfoQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceEtfInfoQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const [result, quotesRecord] = await Promise.all([
      fetchQuoteSummary(query.symbol, "summaryProfile,quoteType"),
      fetchQuotes([query.symbol]),
    ]);
    const quote = quotesRecord[query.symbol] ?? {};

    // Merge quote data on top of quoteSummary result
    const merged: Record<string, unknown> = {
      ...result,
      ...result.summaryProfile,
      ...result.quoteType,
      ...quote,
      symbol: query.symbol,
    };
    return merged;
  }

  async transformData(raw: unknown) {
    const d = raw as Record<string, unknown>;

    // Format inception date if present
    let inceptionDate: string | null = null;
    if (d.fundInceptionDate) {
      try {
        const ts = Number(d.fundInceptionDate);
        inceptionDate = new Date(ts * 1000).toISOString().split("T")[0] ?? null;
      } catch {
        inceptionDate = String(d.fundInceptionDate);
      }
    }

    return [
      YFinanceEtfInfoData.parse({
        symbol: d.symbol,
        name: d.longName ?? d.shortName,
        fundFamily: d.fundFamily,
        fundType: d.legalType,
        category: d.category,
        exchange: d.exchange,
        exchangeTimezone: d.timeZoneFullName,
        currency: d.currency,
        navPrice: d.navPrice,
        totalAssets: d.totalAssets,
        trailingPe: d.trailingPE,
        dividendYield: d.yield,
        dividendRateTtm: d.trailingAnnualDividendRate,
        dividendYieldTtm: d.trailingAnnualDividendYield,
        yearHigh: d.fiftyTwoWeekHigh,
        yearLow: d.fiftyTwoWeekLow,
        ma50d: d.fiftyDayAverage,
        ma200d: d.twoHundredDayAverage,
        returnYtd: d.ytdReturn,
        return3yAvg: d.threeYearAverageReturn,
        return5yAvg: d.fiveYearAverageReturn,
        beta3yAvg: d.beta3Year,
        volumeAvg: d.averageVolume,
        volumeAvg10d: d.averageDailyVolume10Day,
        bid: d.bid,
        ask: d.ask,
        open: d.regularMarketOpen,
        high: d.regularMarketDayHigh,
        low: d.regularMarketDayLow,
        volume: d.regularMarketVolume,
        prevClose: d.regularMarketPreviousClose,
        description: d.longBusinessSummary,
        inceptionDate,
      }),
    ];
  }
}
