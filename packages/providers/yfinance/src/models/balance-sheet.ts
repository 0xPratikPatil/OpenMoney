import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchBalanceSheets } from "../utils/api";

export const YFinanceBalanceSheetQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceBalanceSheetData = z.object({
  symbol: z.string(),
  date: z.coerce.date().nullish(),
  totalAssets: z.number().nullish(),
  totalCurrentAssets: z.number().nullish(),
  cashAndCashEquivalents: z.number().nullish(),
  totalLiabilities: z.number().nullish(),
  totalCurrentLiabilities: z.number().nullish(),
  longTermDebt: z.number().nullish(),
  shortTermDebt: z.number().nullish(),
  totalShareholderEquity: z.number().nullish(),
  retainedEarnings: z.number().nullish(),
  treasuryStock: z.number().nullish(),
  netTangibleAssets: z.number().nullish(),
  workingCapital: z.number().nullish(),
  inventory: z.number().nullish(),
  receivables: z.number().nullish(),
  payables: z.number().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceBalanceSheetData = z.infer<typeof YFinanceBalanceSheetData>;

export class YFinanceBalanceSheetFetcher extends AbstractFetcher<
  typeof YFinanceBalanceSheetQueryParams,
  typeof YFinanceBalanceSheetData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceBalanceSheetQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceBalanceSheetQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const sheets = await fetchBalanceSheets(query.symbol);
    if (sheets.length === 0) throw new EmptyDataError();
    return sheets;
  }

  async transformData(raw: unknown): Promise<YFinanceBalanceSheetData[]> {
    const sheets = raw as Array<Record<string, unknown>>;
    return sheets.map((s) =>
      YFinanceBalanceSheetData.parse({
        symbol: (s as any).symbol ?? "",
        date: (s as any).endDate?.fmt ?? null,
        totalAssets: (s as any).totalAssets?.raw ?? null,
        totalCurrentAssets: (s as any).totalCurrentAssets?.raw ?? null,
        cashAndCashEquivalents: (s as any).cashAndCashEquivalents?.raw ?? null,
        totalLiabilities: (s as any).totalLiabilities?.raw ?? null,
        totalCurrentLiabilities: (s as any).totalCurrentLiabilities?.raw ?? null,
        longTermDebt: (s as any).longTermDebt?.raw ?? null,
        shortTermDebt: (s as any).shortLongTermDebt?.raw ?? null,
        totalShareholderEquity: (s as any).totalStockholderEquity?.raw ?? null,
        retainedEarnings: (s as any).retainedEarnings?.raw ?? null,
        treasuryStock: (s as any).treasuryStock?.raw ?? null,
        netTangibleAssets: (s as any).netTangibleAssets?.raw ?? null,
        workingCapital: (s as any).workingCapital?.raw ?? null,
        inventory: (s as any).inventory?.raw ?? null,
        receivables: (s as any).netReceivables?.raw ?? null,
        payables: (s as any).accountsPayable?.raw ?? null,
      }),
    );
  }
}
