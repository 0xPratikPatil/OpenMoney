import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch } from "../utils/api";

interface FmpKeyMetricsResponse {
  symbol?: string;
  revenueTTM?: number;
  grossProfitTTM?: number;
  ebitdaTTM?: number;
  netIncomeTTM?: number;
  freeCashFlowTTM?: number;
  marketCapTTM?: number;
  enterpriseValueTTM?: number;
  peRatioTTM?: number;
  psRatioTTM?: number;
  pbRatioTTM?: number;
  revenuePerShareTTM?: number;
  netIncomePerShareTTM?: number;
  freeCashFlowPerShareTTM?: number;
  dividendYieldTTM?: number;
  dividendPerShareTTM?: number;
}

export const FMPKeyMetricsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type FMPKeyMetricsQueryParams = z.infer<typeof FMPKeyMetricsQueryParams>;

export const FMPKeyMetricsData = z.object({
  symbol: z.string(),
  revenueTtm: z.number().nullish(),
  grossProfitTtm: z.number().nullish(),
  ebitdaTtm: z.number().nullish(),
  netIncomeTtm: z.number().nullish(),
  freeCashFlowTtm: z.number().nullish(),
  marketCapTtm: z.number().nullish(),
  enterpriseValueTtm: z.number().nullish(),
  peRatioTtm: z.number().nullish(),
  psRatioTtm: z.number().nullish(),
  pbRatioTtm: z.number().nullish(),
  revenuePerShareTtm: z.number().nullish(),
  netIncomePerShareTtm: z.number().nullish(),
  freeCashFlowPerShareTtm: z.number().nullish(),
  dividendYieldTtm: z.number().nullish(),
  dividendPerShareTtm: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPKeyMetricsData = z.infer<typeof FMPKeyMetricsData>;

export class FMPKeyMetricsFetcher extends AbstractFetcher<
  typeof FMPKeyMetricsQueryParams,
  typeof FMPKeyMetricsData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPKeyMetricsQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof FMPKeyMetricsQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const data = await fmpFetch<FmpKeyMetricsResponse[]>(
      `/v3/key-metrics-ttm/${encodeURIComponent(query.symbol)}`,
      apiKey,
    );
    if (!data || data.length === 0) throw new EmptyDataError(`No key metrics for ${query.symbol}`);
    return data;
  }

  async transformData(raw: unknown) {
    const items = raw as FmpKeyMetricsResponse[];
    return items
      .filter((item) => item.symbol)
      .map((item) =>
        FMPKeyMetricsData.parse({
          symbol: item.symbol,
          revenueTtm: item.revenueTTM ?? null,
          grossProfitTtm: item.grossProfitTTM ?? null,
          ebitdaTtm: item.ebitdaTTM ?? null,
          netIncomeTtm: item.netIncomeTTM ?? null,
          freeCashFlowTtm: item.freeCashFlowTTM ?? null,
          marketCapTtm: item.marketCapTTM ?? null,
          enterpriseValueTtm: item.enterpriseValueTTM ?? null,
          peRatioTtm: item.peRatioTTM ?? null,
          psRatioTtm: item.psRatioTTM ?? null,
          pbRatioTtm: item.pbRatioTTM ?? null,
          revenuePerShareTtm: item.revenuePerShareTTM ?? null,
          netIncomePerShareTtm: item.netIncomePerShareTTM ?? null,
          freeCashFlowPerShareTtm: item.freeCashFlowPerShareTTM ?? null,
          dividendYieldTtm: item.dividendYieldTTM ?? null,
          dividendPerShareTtm: item.dividendPerShareTTM ?? null,
        }),
      );
  }
}
