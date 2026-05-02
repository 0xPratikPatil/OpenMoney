import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchHistoricalData } from "../utils/api";

export const IntrinioBalanceSheetData = z.object({
  symbol: z.string(),
  date: z.coerce.date().nullish(),
  totalAssets: z.number().nullish(),
  currentAssets: z.number().nullish(),
  cashAndCashEquivalents: z.number().nullish(),
  totalLiabilities: z.number().nullish(),
  currentLiabilities: z.number().nullish(),
  longTermDebt: z.number().nullish(),
  shortTermDebt: z.number().nullish(),
  totalShareholderEquity: z.number().nullish(),
  retainedEarnings: z.number().nullish(),
  inventory: z.number().nullish(),
  netReceivables: z.number().nullish(),
  accountsPayable: z.number().nullish(),
  goodwill: z.number().nullish(),
  intangibleAssets: z.number().nullish(),
  propertyPlantEquipment: z.number().nullish(),
  provider: z.literal("intrinio").default("intrinio"),
});

export type IntrinioBalanceSheetData = z.infer<typeof IntrinioBalanceSheetData>;

export const IntrinioBalanceSheetQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  frequency: z.enum(["annual", "quarterly"]).default("annual"),
});

export type IntrinioBalanceSheetQueryParams = z.infer<typeof IntrinioBalanceSheetQueryParams>;

/**
 * Fetcher for balance sheet data from Intrinio.
 * Uses /companies/{symbol}/historical_data for balance sheet items.
 */
export class IntrinioBalanceSheetFetcher extends AbstractFetcher<
  typeof IntrinioBalanceSheetQueryParams,
  typeof IntrinioBalanceSheetData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof IntrinioBalanceSheetQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: params.frequency ?? "annual",
    };
  }

  async extractData(
    query: z.infer<typeof IntrinioBalanceSheetQueryParams>,
    credentials: Record<string, string>,
  ) {
    const startStr = query.startDate
      ? (query.startDate as Date).toISOString().split("T")[0]
      : undefined;
    const endStr = query.endDate
      ? (query.endDate as Date).toISOString().split("T")[0]
      : undefined;

    const [totalAssets, totalLiabilities, shareholdersEquity, cashAndEquivalents, longTermDebt] =
      await Promise.all([
        fetchHistoricalData(query.symbol, "totalassets", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "totalliabilities", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "totalstockholdersequity", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "cashandcashequivalents", credentials, startStr, endStr, query.frequency),
        fetchHistoricalData(query.symbol, "longtermdebt", credentials, startStr, endStr, query.frequency),
      ]);

    return { totalAssets, totalLiabilities, shareholdersEquity, cashAndEquivalents, longTermDebt };
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
        IntrinioBalanceSheetData.parse({
          symbol: row.symbol ?? "",
          date: row.date,
          totalAssets: row.totalAssets ?? null,
          totalLiabilities: row.totalLiabilities ?? null,
          totalShareholderEquity: row.shareholdersEquity ?? null,
          cashAndCashEquivalents: row.cashAndEquivalents ?? null,
          longTermDebt: row.longTermDebt ?? null,
          currentAssets: null,
          currentLiabilities: null,
          shortTermDebt: null,
          retainedEarnings: null,
          inventory: null,
          netReceivables: null,
          accountsPayable: null,
          goodwill: null,
          intangibleAssets: null,
          propertyPlantEquipment: null,
        }),
      );
  }
}
