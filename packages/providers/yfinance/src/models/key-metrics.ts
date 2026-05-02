import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchQuoteSummary } from "../utils/api";

/**
 * Key Metrics fetcher.
 * Retrieves key financial metrics via quoteSummary (defaultKeyStatistics + financialData).
 */
export const YFinanceKeyMetricsQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceKeyMetricsData = z.object({
  symbol: z.string(),
  marketCap: z.number().nullish(),
  enterpriseValue: z.number().nullish(),
  peRatio: z.number().nullish(),
  forwardPe: z.number().nullish(),
  pegRatio: z.number().nullish(),
  psRatio: z.number().nullish(),
  pbRatio: z.number().nullish(),
  earningsPerShare: z.number().nullish(),
  dividendYield: z.number().nullish(),
  beta: z.number().nullish(),
  high52Week: z.number().nullish(),
  low52Week: z.number().nullish(),
  ma50d: z.number().nullish(),
  ma200d: z.number().nullish(),
  volume: z.number().nullish(),
  avgVolume: z.number().nullish(),
  sharesOutstanding: z.number().nullish(),
  floatShares: z.number().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceKeyMetricsData = z.infer<typeof YFinanceKeyMetricsData>;

export class YFinanceKeyMetricsFetcher extends AbstractFetcher<
  typeof YFinanceKeyMetricsQueryParams,
  typeof YFinanceKeyMetricsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceKeyMetricsQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceKeyMetricsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const result = await fetchQuoteSummary(query.symbol, "defaultKeyStatistics,financialData");
    const stats = result?.defaultKeyStatistics ?? {};
    const finData = result?.financialData ?? {};
    const merged = { symbol: query.symbol, ...stats, ...finData };
    return merged;
  }

  async transformData(raw: unknown) {
    const d = raw as Record<string, unknown>;
    return [
      YFinanceKeyMetricsData.parse({
        symbol: d.symbol,
        marketCap: (d as any).marketCap?.raw ?? d.marketCap ?? null,
        enterpriseValue: (d as any).enterpriseValue?.raw ?? null,
        peRatio: (d as any).trailingPE?.raw ?? d.trailingPE ?? null,
        forwardPe: (d as any).forwardPE?.raw ?? d.forwardPE ?? null,
        pegRatio: (d as any).pegRatio?.raw ?? null,
        psRatio: (d as any).priceToSalesTrailing12Months?.raw ?? null,
        pbRatio: (d as any).priceToBook?.raw ?? null,
        earningsPerShare: (d as any).epsTrailingTwelveMonths?.raw ?? null,
        dividendYield: (d as any).dividendYield?.raw ?? d.yield ?? null,
        beta: (d as any).beta?.raw ?? d.beta ?? null,
        high52Week: (d as any).fiftyTwoWeekHigh?.raw ?? null,
        low52Week: (d as any).fiftyTwoWeekLow?.raw ?? null,
        ma50d: (d as any).fiftyDayAverage?.raw ?? null,
        ma200d: (d as any).twoHundredDayAverage?.raw ?? null,
        volume: (d as any).regularMarketVolume ?? null,
        avgVolume: (d as any).averageVolume ?? null,
        sharesOutstanding: (d as any).sharesOutstanding?.raw ?? null,
        floatShares: (d as any).floatShares?.raw ?? null,
      }),
    ];
  }
}
