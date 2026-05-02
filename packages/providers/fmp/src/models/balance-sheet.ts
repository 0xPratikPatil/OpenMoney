import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch, type FmpFinancialStatement } from "../utils/api";

export const FMPBalanceSheetQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().positive().optional().default(4),
});

export type FMPBalanceSheetQueryParams = z.infer<typeof FMPBalanceSheetQueryParams>;

export const FMPBalanceSheetData = z.object({
  symbol: z.string(),
  date: z.string(),
  cashAndCashEquivalents: z.number().nullish(),
  shortTermInvestments: z.number().nullish(),
  netReceivables: z.number().nullish(),
  inventory: z.number().nullish(),
  totalCurrentAssets: z.number().nullish(),
  propertyPlantEquipmentNet: z.number().nullish(),
  goodwill: z.number().nullish(),
  totalAssets: z.number().nullish(),
  accountsPayable: z.number().nullish(),
  shortTermDebt: z.number().nullish(),
  totalCurrentLiabilities: z.number().nullish(),
  longTermDebt: z.number().nullish(),
  totalLiabilities: z.number().nullish(),
  totalStockholdersEquity: z.number().nullish(),
  retainedEarnings: z.number().nullish(),
  totalDebt: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPBalanceSheetData = z.infer<typeof FMPBalanceSheetData>;

export class FMPBalanceSheetFetcher extends AbstractFetcher<
  typeof FMPBalanceSheetQueryParams,
  typeof FMPBalanceSheetData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPBalanceSheetQueryParams>,
  ): Promise<z.input<typeof FMPBalanceSheetQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 4,
    };
  }

  async extractData(
    query: z.infer<typeof FMPBalanceSheetQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const data = await fmpFetch<FmpFinancialStatement[]>(
      `/v3/balance-sheet-statement/${encodeURIComponent(query.symbol)}`,
      apiKey,
      { limit: query.limit },
    );
    if (!data || data.length === 0) throw new EmptyDataError(`No balance sheet data for ${query.symbol}`);
    return data;
  }

  async transformData(raw: unknown): Promise<FMPBalanceSheetData[]> {
    const statements = raw as FmpFinancialStatement[];
    return statements
      .filter((s) => s.symbol)
      .map((s) =>
        FMPBalanceSheetData.parse({
          symbol: s.symbol,
          date: s.date,
          cashAndCashEquivalents: s.cashAndCashEquivalents ?? null,
          shortTermInvestments: s.shortTermInvestments ?? null,
          netReceivables: s.netReceivables ?? null,
          inventory: s.inventory ?? null,
          totalCurrentAssets: s.totalCurrentAssets ?? null,
          propertyPlantEquipmentNet: s.propertyPlantEquipmentNet ?? null,
          goodwill: s.goodwill ?? null,
          totalAssets: s.totalAssets ?? null,
          accountsPayable: s.accountsPayable ?? null,
          shortTermDebt: s.shortTermDebt ?? null,
          totalCurrentLiabilities: s.totalCurrentLiabilities ?? null,
          longTermDebt: s.longTermDebt ?? null,
          totalLiabilities: s.totalLiabilities ?? null,
          totalStockholdersEquity: s.totalStockholdersEquity ?? null,
          retainedEarnings: s.retainedEarnings ?? null,
          totalDebt: s.totalDebt ?? null,
        }),
      );
  }
}
