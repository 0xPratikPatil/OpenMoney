import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistoricalData } from "../utils/api";

export const IntrinioFinancialRatiosData = z.object({
  symbol: z.string(),
  date: z.coerce.date().nullish(),
  returnOnAssets: z.number().nullish(),
  returnOnEquity: z.number().nullish(),
  returnOnInvestedCapital: z.number().nullish(),
  profitMargin: z.number().nullish(),
  grossMargin: z.number().nullish(),
  operatingMargin: z.number().nullish(),
  ebitMargin: z.number().nullish(),
  ebitdaMargin: z.number().nullish(),
  currentRatio: z.number().nullish(),
  quickRatio: z.number().nullish(),
  debtToEquity: z.number().nullish(),
  debtToAssets: z.number().nullish(),
  interestCoverage: z.number().nullish(),
  assetTurnover: z.number().nullish(),
  inventoryTurnover: z.number().nullish(),
  daysSalesOutstanding: z.number().nullish(),
  dividendYield: z.number().nullish(),
  payoutRatio: z.number().nullish(),
  priceToEarnings: z.number().nullish(),
  priceToBook: z.number().nullish(),
  priceToSales: z.number().nullish(),
  enterpriseValueToEbitda: z.number().nullish(),
  enterpriseValueToRevenue: z.number().nullish(),
  provider: z.literal("intrinio").default("intrinio"),
});

export type IntrinioFinancialRatiosData = z.infer<typeof IntrinioFinancialRatiosData>;

export const IntrinioFinancialRatiosQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  frequency: z.enum(["annual", "quarterly", "ttm"]).default("annual"),
});

export type IntrinioFinancialRatiosQueryParams = z.infer<typeof IntrinioFinancialRatiosQueryParams>;

/**
 * Fetcher for financial ratios from Intrinio.
 * Uses /companies/{symbol}/historical_data for ratio items.
 */
export class IntrinioFinancialRatiosFetcher extends AbstractFetcher<
  typeof IntrinioFinancialRatiosQueryParams,
  typeof IntrinioFinancialRatiosData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof IntrinioFinancialRatiosQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: params.frequency ?? "annual",
    };
  }

  async extractData(
    query: z.infer<typeof IntrinioFinancialRatiosQueryParams>,
    credentials: Record<string, string>,
  ) {
    const startStr = query.startDate
      ? (query.startDate as Date).toISOString().split("T")[0]
      : undefined;
    const endStr = query.endDate
      ? (query.endDate as Date).toISOString().split("T")[0]
      : undefined;

    const [returnOnEquity, returnOnAssets, debtToEquity, currentRatio, priceToEarnings, priceToBook] =
      await Promise.all([
        fetchHistoricalData(query.symbol, "roe", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "roa", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "debttototalequity", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "currentratio", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "pricetoearnings", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "pricetobook", credentials, startStr, endStr, query.frequency),
      ]);

    return { returnOnEquity, returnOnAssets, debtToEquity, currentRatio, priceToEarnings, priceToBook };
  }

  async transformData(raw: unknown) {
    const d = raw as Record<string, Array<Record<string, unknown>>>;

    const dateMap = new Map<string, Record<string, unknown>>();

    for (const [key, rows] of Object.entries(d)) {
      for (const row of rows) {
        const date = row.date as string;
        if (!dateMap.has(date)) dateMap.set(date, { date });
        const entry = dateMap.get(date)!;
        entry[key] = row.value;
      }
    }

    const results = Array.from(dateMap.values());
    if (results.length === 0) throw new EmptyDataError();

    return results
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .map((row) =>
        IntrinioFinancialRatiosData.parse({
          symbol: row.symbol ?? "",
          date: row.date,
          returnOnEquity: row.returnOnEquity ?? null,
          returnOnAssets: row.returnOnAssets ?? null,
          debtToEquity: row.debtToEquity ?? null,
          currentRatio: row.currentRatio ?? null,
          priceToEarnings: row.priceToEarnings ?? null,
          priceToBook: row.priceToBook ?? null,
          returnOnInvestedCapital: null,
          profitMargin: null,
          grossMargin: null,
          operatingMargin: null,
          ebitMargin: null,
          ebitdaMargin: null,
          quickRatio: null,
          debtToAssets: null,
          interestCoverage: null,
          assetTurnover: null,
          inventoryTurnover: null,
          daysSalesOutstanding: null,
          dividendYield: null,
          payoutRatio: null,
          priceToSales: null,
          enterpriseValueToEbitda: null,
          enterpriseValueToRevenue: null,
        }),
      );
  }
}
