import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchDividends } from "../utils/api";

export const YFinanceHistoricalDividendsQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceHistoricalDividendsData = z.object({
  date: z.coerce.date(),
  dividend: z.number(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceHistoricalDividendsData = z.infer<typeof YFinanceHistoricalDividendsData>;

export class YFinanceHistoricalDividendsFetcher extends AbstractFetcher<
  typeof YFinanceHistoricalDividendsQueryParams,
  typeof YFinanceHistoricalDividendsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceHistoricalDividendsQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceHistoricalDividendsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const dividends = await fetchDividends(query.symbol);
    if (dividends.length === 0) throw new EmptyDataError("No dividend data found");
    return dividends;
  }

  async transformData(raw: unknown) {
    const dividends = raw as Array<{ date: Date; dividend: number }>;
    return dividends.map((d) =>
      YFinanceHistoricalDividendsData.parse({
        date: d.date,
        dividend: d.dividend,
      }),
    );
  }
}
