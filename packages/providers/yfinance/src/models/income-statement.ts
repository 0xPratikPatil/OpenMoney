import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchIncomeStatements } from "../utils/api";

export const YFinanceIncomeStatementQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceIncomeStatementData = z.object({
  symbol: z.string(),
  date: z.coerce.date().nullish(),
  totalRevenue: z.number().nullish(),
  costOfRevenue: z.number().nullish(),
  grossProfit: z.number().nullish(),
  operatingIncome: z.number().nullish(),
  pretaxIncome: z.number().nullish(),
  incomeBeforeTax: z.number().nullish(),
  netIncome: z.number().nullish(),
  ebitda: z.number().nullish(),
  ebit: z.number().nullish(),
  totalOperatingExpenses: z.number().nullish(),
  researchAndDevelopment: z.number().nullish(),
  sellingGeneralAndAdmin: z.number().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceIncomeStatementData = z.infer<typeof YFinanceIncomeStatementData>;

export class YFinanceIncomeStatementFetcher extends AbstractFetcher<
  typeof YFinanceIncomeStatementQueryParams,
  typeof YFinanceIncomeStatementData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceIncomeStatementQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceIncomeStatementQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const statements = await fetchIncomeStatements(query.symbol);
    if (statements.length === 0) throw new EmptyDataError();
    return statements;
  }

  async transformData(raw: unknown) {
    const statements = raw as Array<Record<string, unknown>>;
    return statements.map((s) =>
      YFinanceIncomeStatementData.parse({
        symbol: (s as any).symbol ?? "",
        date: (s as any).endDate?.fmt ?? null,
        totalRevenue: (s as any).totalRevenue?.raw ?? null,
        costOfRevenue: (s as any).costOfRevenue?.raw ?? null,
        grossProfit: (s as any).grossProfit?.raw ?? null,
        operatingIncome: (s as any).operatingIncome?.raw ?? null,
        pretaxIncome: (s as any).pretaxIncome?.raw ?? null,
        incomeBeforeTax: (s as any).incomeBeforeTax?.raw ?? null,
        netIncome: (s as any).netIncome?.raw ?? null,
        ebitda: (s as any).ebitda?.raw ?? null,
        ebit: (s as any).ebit?.raw ?? null,
        totalOperatingExpenses: (s as any).totalOperatingExpenses?.raw ?? null,
        researchAndDevelopment: (s as any).researchAndDevelopment?.raw ?? null,
        sellingGeneralAndAdmin: (s as any).sellingGeneralAndAdministrative?.raw ?? null,
      }),
    );
  }
}
