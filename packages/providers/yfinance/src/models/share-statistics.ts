import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuotes } from "../utils/api";

/**
 * Share Statistics fetcher.
 * Port of OpenBB's YFinanceShareStatisticsFetcher.
 */
export const YFinanceShareStatisticsQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceShareStatisticsData = z.object({
  symbol: z.string(),
  outstandingShares: z.number().nullish(),
  floatShares: z.number().nullish(),
  impliedSharesOutstanding: z.number().nullish(),
  shortInterest: z.number().nullish(),
  shortPercentOfFloat: z.number().nullish(),
  daysToCover: z.number().nullish(),
  shortInterestPrevMonth: z.number().nullish(),
  shortInterestPrevDate: z.string().nullish(),
  insiderOwnership: z.number().nullish(),
  institutionOwnership: z.number().nullish(),
  institutionFloatOwnership: z.number().nullish(),
  institutionsCount: z.number().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceShareStatisticsData = z.infer<typeof YFinanceShareStatisticsData>;

export class YFinanceShareStatisticsFetcher extends AbstractFetcher<
  typeof YFinanceShareStatisticsQueryParams,
  typeof YFinanceShareStatisticsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceShareStatisticsQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceShareStatisticsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const quotes = await fetchQuotes([query.symbol]);
    const quote = quotes[query.symbol];
    if (!quote) throw new EmptyDataError(`No data for symbol: ${query.symbol}`);
    return quote;
  }

  async transformData(raw: unknown): Promise<YFinanceShareStatisticsData[]> {
    const quote = raw as Record<string, unknown>;
    const symbol = quote.symbol as string;
    if (!symbol) throw new EmptyDataError("No symbol in response");

    // Convert dateShortInterest from timestamp to date string
    let shortInterestPrevDate: string | null = null;
    if (quote.sharesShortPreviousMonthDate) {
      try {
        const ts = Number(quote.sharesShortPreviousMonthDate);
        shortInterestPrevDate = new Date(ts * 1000).toISOString().split("T")[0] ?? null;
      } catch {
        shortInterestPrevDate = String(quote.sharesShortPreviousMonthDate);
      }
    }
    return [
      YFinanceShareStatisticsData.parse({
        symbol,
        outstandingShares: quote.sharesOutstanding ?? null,
        floatShares: quote.floatShares ?? null,
        impliedSharesOutstanding: quote.impliedSharesOutstanding ?? null,
        shortInterest: quote.sharesShort ?? null,
        shortPercentOfFloat: quote.shortPercentOfFloat ?? null,
        daysToCover: quote.shortRatio ?? null,
        shortInterestPrevMonth: quote.sharesShortPriorMonth ?? null,
        shortInterestPrevDate,
        insiderOwnership: quote.heldPercentInsiders ?? null,
        institutionOwnership: quote.heldPercentInstitutions ?? null,
        institutionFloatOwnership: quote.institutionsFloatPercentHeld ?? null,
        institutionsCount: quote.institutionsCount ?? null,
      }),
    ];
  }
}
