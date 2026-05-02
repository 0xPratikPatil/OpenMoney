import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistoricalData } from "../utils/api";

export const IntrinioIncomeStatementData = z.object({
  symbol: z.string(),
  date: z.coerce.date().nullish(),
  totalRevenue: z.number().nullish(),
  costOfRevenue: z.number().nullish(),
  grossProfit: z.number().nullish(),
  operatingIncome: z.number().nullish(),
  operatingExpenses: z.number().nullish(),
  pretaxIncome: z.number().nullish(),
  incomeBeforeTax: z.number().nullish(),
  netIncome: z.number().nullish(),
  netIncomeToCommon: z.number().nullish(),
  ebitda: z.number().nullish(),
  ebit: z.number().nullish(),
  researchAndDevelopment: z.number().nullish(),
  sellingGeneralAndAdmin: z.number().nullish(),
  interestExpense: z.number().nullish(),
  incomeTaxExpense: z.number().nullish(),
  weightedAverageShares: z.number().nullish(),
  basicEarningsPerShare: z.number().nullish(),
  dilutedEarningsPerShare: z.number().nullish(),
  provider: z.literal("intrinio").default("intrinio"),
});

export type IntrinioIncomeStatementData = z.infer<typeof IntrinioIncomeStatementData>;

export const IntrinioIncomeStatementQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  frequency: z.enum(["annual", "quarterly", "ttm"]).default("annual"),
});

export type IntrinioIncomeStatementQueryParams = z.infer<typeof IntrinioIncomeStatementQueryParams>;

/**
 * Fetcher for income statement data from Intrinio.
 * Uses /companies/{symbol}/historical_data for multiple items.
 */
export class IntrinioIncomeStatementFetcher extends AbstractFetcher<
  typeof IntrinioIncomeStatementQueryParams,
  typeof IntrinioIncomeStatementData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof IntrinioIncomeStatementQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: params.frequency ?? "annual",
    };
  }

  async extractData(
    query: z.infer<typeof IntrinioIncomeStatementQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const startStr = query.startDate
      ? (query.startDate as Date).toISOString().split("T")[0]
      : undefined;
    const endStr = query.endDate
      ? (query.endDate as Date).toISOString().split("T")[0]
      : undefined;

    // Fetch multiple income statement items
    const [totalRevenue, netIncome, ebitda, operatingIncome, grossProfit, basicEps, dilutedEps] =
      await Promise.all([
        fetchHistoricalData(query.symbol, "totalrevenue", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "netincome", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "ebitda", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "operatingincome", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "grossprofit", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "basiceps", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "dilutedeps", credentials, startStr, endStr, query.frequency),
      ]);

    return {
      totalRevenue, netIncome, ebitda, operatingIncome, grossProfit, basicEps, dilutedEps,
    };
  }

  async transformData(raw: unknown): Promise<IntrinioIncomeStatementData[]> {
    const d = raw as Record<string, Array<Record<string, unknown>>>;

    // Merge all data series by date
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
        IntrinioIncomeStatementData.parse({
          symbol: row.symbol ?? "",
          date: row.date,
          totalRevenue: row.totalRevenue ?? null,
          netIncome: row.netIncome ?? null,
          ebitda: row.ebitda ?? null,
          operatingIncome: row.operatingIncome ?? null,
          grossProfit: row.grossProfit ?? null,
          basicEarningsPerShare: row.basicEps ?? null,
          dilutedEarningsPerShare: row.dilutedEps ?? null,
          interestExpense: null,
          incomeTaxExpense: null,
          weightedAverageShares: null,
          costOfRevenue: null,
          operatingExpenses: null,
          pretaxIncome: null,
          incomeBeforeTax: null,
          netIncomeToCommon: null,
          ebit: null,
          researchAndDevelopment: null,
          sellingGeneralAndAdmin: null,
        }),
      );
  }
}
