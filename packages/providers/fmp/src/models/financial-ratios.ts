import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch, type FmpFinancialStatement } from "../utils/api";

export const FMPFinancialRatiosQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().positive().optional().default(1),
});

export type FMPFinancialRatiosQueryParams = z.infer<typeof FMPFinancialRatiosQueryParams>;

export const FMPFinancialRatiosData = z.object({
  symbol: z.string(),
  date: z.string(),
  currentRatio: z.number().nullish(),
  quickRatio: z.number().nullish(),
  daysOfSalesOutstanding: z.number().nullish(),
  daysOfInventoryOutstanding: z.number().nullish(),
  daysOfPayablesOutstanding: z.number().nullish(),
  grossProfitMargin: z.number().nullish(),
  operatingProfitMargin: z.number().nullish(),
  netProfitMargin: z.number().nullish(),
  returnOnAssets: z.number().nullish(),
  returnOnEquity: z.number().nullish(),
  debtRatio: z.number().nullish(),
  debtEquityRatio: z.number().nullish(),
  interestCoverage: z.number().nullish(),
  payoutRatio: z.number().nullish(),
  dividendYield: z.number().nullish(),
  priceToBook: z.number().nullish(),
  priceToSalesRatio: z.number().nullish(),
  priceToEarnings: z.number().nullish(),
  enterpriseValueMultiple: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPFinancialRatiosData = z.infer<typeof FMPFinancialRatiosData>;

export class FMPFinancialRatiosFetcher extends AbstractFetcher<
  typeof FMPFinancialRatiosQueryParams,
  typeof FMPFinancialRatiosData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPFinancialRatiosQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 1,
    };
  }

  async extractData(
    query: z.infer<typeof FMPFinancialRatiosQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const data = await fmpFetch<Array<FmpFinancialStatement & { ratios?: Record<string, unknown> }>>(
      `/v3/financial-ratios/${encodeURIComponent(query.symbol)}`,
      apiKey,
      { limit: query.limit },
    );
    if (!data || data.length === 0) throw new EmptyDataError(`No financial ratios for ${query.symbol}`);
    return data;
  }

  async transformData(raw: unknown) {
    const items = raw as Array<FmpFinancialStatement & { ratios?: Record<string, unknown> }>;
    return items
      .filter((item) => item.symbol)
      .map((item) => {
        const r = item.ratios ?? item;
        return FMPFinancialRatiosData.parse({
          symbol: item.symbol,
          date: item.date,
          currentRatio: r.currentRatio ?? null,
          quickRatio: r.quickRatio ?? null,
          daysOfSalesOutstanding: r.daysOfSalesOutstanding ?? null,
          daysOfInventoryOutstanding: r.daysOfInventoryOutstanding ?? null,
          daysOfPayablesOutstanding: r.daysOfPayablesOutstanding ?? null,
          grossProfitMargin: r.grossProfitMargin ?? null,
          operatingProfitMargin: r.operatingProfitMargin ?? null,
          netProfitMargin: r.netProfitMargin ?? null,
          returnOnAssets: r.returnOnAssets ?? null,
          returnOnEquity: r.returnOnEquity ?? null,
          debtRatio: r.debtRatio ?? null,
          debtEquityRatio: r.debtEquityRatio ?? null,
          interestCoverage: r.interestCoverage ?? null,
          payoutRatio: r.payoutRatio ?? null,
          dividendYield: r.dividendYield ?? null,
          priceToBook: r.priceToBook ?? null,
          priceToSalesRatio: r.priceToSalesRatio ?? null,
          priceToEarnings: r.priceToEarnings ?? null,
          enterpriseValueMultiple: r.enterpriseValueMultiple ?? null,
        });
      });
  }
}
