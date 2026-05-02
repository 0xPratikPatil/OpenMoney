import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchCashFlowStatements } from "../utils/api";

export const YFinanceCashFlowQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceCashFlowData = z.object({
  symbol: z.string(),
  date: z.coerce.date().nullish(),
  operatingCashFlow: z.number().nullish(),
  capitalExpenditures: z.number().nullish(),
  freeCashFlow: z.number().nullish(),
  investingCashFlow: z.number().nullish(),
  financingCashFlow: z.number().nullish(),
  netIncome: z.number().nullish(),
  depreciationAndAmortization: z.number().nullish(),
  dividendsPaid: z.number().nullish(),
  stockRepurchased: z.number().nullish(),
  issuanceOfDebt: z.number().nullish(),
  repaymentOfDebt: z.number().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceCashFlowData = z.infer<typeof YFinanceCashFlowData>;

export class YFinanceCashFlowFetcher extends AbstractFetcher<
  typeof YFinanceCashFlowQueryParams,
  typeof YFinanceCashFlowData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceCashFlowQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceCashFlowQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const statements = await fetchCashFlowStatements(query.symbol);
    if (statements.length === 0) throw new EmptyDataError();
    return statements;
  }

  async transformData(raw: unknown) {
    const statements = raw as Array<Record<string, unknown>>;
    return statements.map((s) =>
      YFinanceCashFlowData.parse({
        symbol: (s as any).symbol ?? "",
        date: (s as any).endDate?.fmt ?? null,
        operatingCashFlow: (s as any).totalCashFromOperatingActivities?.raw ?? null,
        capitalExpenditures: (s as any).capitalExpenditures?.raw ?? null,
        freeCashFlow: (s as any).freeCashFlow?.raw ?? null,
        investingCashFlow: (s as any).totalCashFromInvestingActivities?.raw ?? null,
        financingCashFlow: (s as any).totalCashFromFinancingActivities?.raw ?? null,
        netIncome: (s as any).netIncome?.raw ?? null,
        depreciationAndAmortization: (s as any).depreciation?.raw ?? null,
        dividendsPaid: (s as any).dividendsPaid?.raw ?? null,
        stockRepurchased: (s as any).repurchaseOfStock?.raw ?? null,
        issuanceOfDebt: (s as any).issuanceOfDebt?.raw ?? null,
        repaymentOfDebt: (s as any).repaymentOfDebt?.raw ?? null,
      }),
    );
  }
}
