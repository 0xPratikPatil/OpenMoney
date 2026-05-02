import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchChartData } from "../utils/api";

const MONTH_MAP: Record<string, string> = {
  F: "01", G: "02", H: "03", J: "04", K: "05", M: "06",
  N: "07", Q: "08", U: "09", V: "10", X: "11", Z: "12",
};

/**
 * Futures Curve fetcher.
 * Port of OpenBB's YFinanceFuturesCurveFetcher.
 */
export const YFinanceFuturesCurveQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  date: z.string().optional(),
});

export const YFinanceFuturesCurveData = z.object({
  expiration: z.string(),
  price: z.number().nullish(),
  date: z.string().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceFuturesCurveData = z.infer<typeof YFinanceFuturesCurveData>;

export class YFinanceFuturesCurveFetcher extends AbstractFetcher<
  typeof YFinanceFuturesCurveQueryParams,
  typeof YFinanceFuturesCurveData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceFuturesCurveQueryParams>) {
    return { symbol: params.symbol.toUpperCase(), date: params.date };
  }

  async extractData(
    query: z.infer<typeof YFinanceFuturesCurveQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    // Fetch futures chain to get available contract symbols
    const chainUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(query.symbol + "=F")}?modules=futuresChain`;
    const response = await fetch(chainUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error(`Yahoo Finance futures chain error: ${response.status}`);

    const data = (await response.json()) as any;
    const futures: string[] = data?.quoteSummary?.result?.[0]?.futuresChain?.futures ?? [];
    if (futures.length === 0) throw new EmptyDataError("No futures chain found");

    // Take first 24 contracts
    const contracts = futures.slice(0, 24);

    // Fetch current quotes for all contracts
    const symbols = contracts.join(",");
    const quotesUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    const quotesResponse = await fetch(quotesUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!quotesResponse.ok) throw new Error(`Yahoo Finance quotes error: ${quotesResponse.status}`);

    const quotesData = (await quotesResponse.json()) as any;
    const quotes = quotesData?.quoteResponse?.result ?? [];

    // Extract expiration from contract symbol
    const results: Array<{ expiration: string; price: number | null }> = [];
    for (const q of quotes) {
      const sym = q.symbol as string;
      // Parse expiration from symbol like "ESM26.NYM" -> month=M, year=26
      const match = sym.match(/[A-Z]{2}([FGHJKMNQUVXZ])(\d{2})/);
      if (match && match[1] && match[2]) {
        const monthCode = match[1];
        const year = "20" + match[2];
        const month = MONTH_MAP[monthCode] ?? "01";
        results.push({ expiration: `${year}-${month}`, price: q.regularMarketPrice ?? null });
      } else {
        results.push({ expiration: sym, price: q.regularMarketPrice ?? null });
      }
    }

    // For historical dates
    if (query.date && results.length === 0) {
      // Simplified: fetch historical close for the symbol
      const rows = await fetchChartData(query.symbol + "=F", "1d");
      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        results.push({ expiration: query.date, price: lastRow?.close ?? null });
      }
    }

    return results;
  }

  async transformData(raw: unknown): Promise<YFinanceFuturesCurveData[]> {
    const items = raw as Array<{ expiration: string; price: number | null }>;
    if (items.length === 0) throw new EmptyDataError("No futures curve data found");
    return items.map((item) =>
      YFinanceFuturesCurveData.parse({
        expiration: item.expiration,
        price: item.price,
      }),
    );
  }
}
