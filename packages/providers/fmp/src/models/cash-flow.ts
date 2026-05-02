import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch, type FmpFinancialStatement } from "../utils/api";

export const FMPCashFlowQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().positive().optional().default(4),
});

export type FMPCashFlowQueryParams = z.infer<typeof FMPCashFlowQueryParams>;

export const FMPCashFlowData = z.object({
  symbol: z.string(),
  date: z.string(),
  netIncome: z.number().nullish(),
  depreciationAndAmortization: z.number().nullish(),
  stockBasedCompensation: z.number().nullish(),
  accountsReceivables: z.number().nullish(),
  inventory: z.number().nullish(),
  accountsPayables: z.number().nullish(),
  netCashProvidedByOperatingActivities: z.number().nullish(),
  investmentsInPropertyPlantAndEquipment: z.number().nullish(),
  netCashUsedForInvestingActivites: z.number().nullish(),
  debtRepayment: z.number().nullish(),
  commonStockRepurchased: z.number().nullish(),
  dividendsPaid: z.number().nullish(),
  netCashUsedProvidedByFinancingActivities: z.number().nullish(),
  operatingCashFlow: z.number().nullish(),
  capitalExpenditure: z.number().nullish(),
  freeCashFlow: z.number().nullish(),
  cashAtEndOfPeriod: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPCashFlowData = z.infer<typeof FMPCashFlowData>;

export class FMPCashFlowFetcher extends AbstractFetcher<
  typeof FMPCashFlowQueryParams,
  typeof FMPCashFlowData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPCashFlowQueryParams>,
  ): Promise<z.input<typeof FMPCashFlowQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 4,
    };
  }

  async extractData(
    query: z.infer<typeof FMPCashFlowQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const data = await fmpFetch<FmpFinancialStatement[]>(
      `/v3/cash-flow-statement/${encodeURIComponent(query.symbol)}`,
      apiKey,
      { limit: query.limit },
    );
    if (!data || data.length === 0) throw new EmptyDataError(`No cash flow data for ${query.symbol}`);
    return data;
  }

  async transformData(raw: unknown): Promise<FMPCashFlowData[]> {
    const statements = raw as FmpFinancialStatement[];
    return statements
      .filter((s) => s.symbol)
      .map((s) =>
        FMPCashFlowData.parse({
          symbol: s.symbol,
          date: s.date,
          netIncome: s.netIncome ?? null,
          depreciationAndAmortization: s.depreciationAndAmortization ?? null,
          stockBasedCompensation: s.stockBasedCompensation ?? null,
          accountsReceivables: s.accountsReceivables ?? null,
          inventory: s.inventory ?? null,
          accountsPayables: s.accountsPayables ?? null,
          netCashProvidedByOperatingActivities: s.netCashProvidedByOperatingActivities ?? null,
          investmentsInPropertyPlantAndEquipment: s.investmentsInPropertyPlantAndEquipment ?? null,
          netCashUsedForInvestingActivites: s.netCashUsedForInvestingActivites ?? null,
          debtRepayment: s.debtRepayment ?? null,
          commonStockRepurchased: s.commonStockRepurchased ?? null,
          dividendsPaid: s.dividendsPaid ?? null,
          netCashUsedProvidedByFinancingActivities: s.netCashUsedProvidedByFinancingActivities ?? null,
          operatingCashFlow: s.operatingCashFlow ?? null,
          capitalExpenditure: s.capitalExpenditure ?? null,
          freeCashFlow: s.freeCashFlow ?? null,
          cashAtEndOfPeriod: s.cashAtEndOfPeriod ?? null,
        }),
      );
  }
}
