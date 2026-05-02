import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch, type FmpFinancialStatement } from "../utils/api";

export const FMPIncomeStatementQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().positive().optional().default(4),
});

export type FMPIncomeStatementQueryParams = z.infer<typeof FMPIncomeStatementQueryParams>;

export const FMPIncomeStatementData = z.object({
  symbol: z.string(),
  date: z.string(),
  revenue: z.number().nullish(),
  costOfRevenue: z.number().nullish(),
  grossProfit: z.number().nullish(),
  grossProfitRatio: z.number().nullish(),
  researchAndDevelopmentExpenses: z.number().nullish(),
  sellingGeneralAndAdminExpenses: z.number().nullish(),
  operatingExpenses: z.number().nullish(),
  operatingIncome: z.number().nullish(),
  ebitda: z.number().nullish(),
  netIncome: z.number().nullish(),
  eps: z.number().nullish(),
  epsdiluted: z.number().nullish(),
  weightedAverageShsOut: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPIncomeStatementData = z.infer<typeof FMPIncomeStatementData>;

export class FMPIncomeStatementFetcher extends AbstractFetcher<
  typeof FMPIncomeStatementQueryParams,
  typeof FMPIncomeStatementData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPIncomeStatementQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 4,
    };
  }

  async extractData(
    query: z.infer<typeof FMPIncomeStatementQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const data = await fmpFetch<FmpFinancialStatement[]>(
      `/v3/income-statement/${encodeURIComponent(query.symbol)}`,
      apiKey,
      { limit: query.limit },
    );
    if (!data || data.length === 0) throw new EmptyDataError(`No income statement data for ${query.symbol}`);
    return data;
  }

  async transformData(raw: unknown) {
    const statements = raw as FmpFinancialStatement[];
    return statements
      .filter((s) => s.symbol)
      .map((s) =>
        FMPIncomeStatementData.parse({
          symbol: s.symbol,
          date: s.date,
          revenue: s.revenue ?? null,
          costOfRevenue: s.costOfRevenue ?? null,
          grossProfit: s.grossProfit ?? null,
          grossProfitRatio: s.grossProfitRatio ?? null,
          researchAndDevelopmentExpenses: s.researchAndDevelopmentExpenses ?? null,
          sellingGeneralAndAdminExpenses: s.sellingGeneralAndAdministrativeExpenses ?? null,
          operatingExpenses: s.operatingExpenses ?? null,
          operatingIncome: s.operatingIncome ?? null,
          ebitda: s.ebitda ?? null,
          netIncome: s.netIncome ?? null,
          eps: s.eps ?? null,
          epsdiluted: s.epsdiluted ?? null,
          weightedAverageShsOut: s.weightedAverageShsOut ?? null,
        }),
      );
  }
}
