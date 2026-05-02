import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";

const YAHOO_FINANCE_BASE = "https://query1.finance.yahoo.com";

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
  ): Promise<unknown> {
    // Use the chart API with range=max to get dividend events
    const url = `${YAHOO_FINANCE_BASE}/v8/finance/chart/${encodeURIComponent(query.symbol)}?interval=1d&range=max`;
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error(`Yahoo Finance error: ${response.status}`);
    const data = (await response.json()) as any;
    const events = data?.chart?.result?.[0]?.events?.dividends;
    if (!events) throw new EmptyDataError("No dividend data found");
    // events is a dict of { timestamp: { amount, date } }
    const dividends: Array<{ date: Date; dividend: number }> = [];
    for (const key of Object.keys(events)) {
      const ev = events[key] as { amount: number; date: number };
      if (ev && ev.amount && ev.date) {
        dividends.push({
          date: new Date(ev.date * 1000),
          dividend: ev.amount,
        });
      }
    }
    if (dividends.length === 0) throw new EmptyDataError("No dividend data found");
    return dividends;
  }

  async transformData(raw: unknown): Promise<YFinanceHistoricalDividendsData[]> {
    const dividends = raw as Array<{ date: Date; dividend: number }>;
    return dividends.map((d) =>
      YFinanceHistoricalDividendsData.parse({
        date: d.date,
        dividend: d.dividend,
      }),
    );
  }
}
