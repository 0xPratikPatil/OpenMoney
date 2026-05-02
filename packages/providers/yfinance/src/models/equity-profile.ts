import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuoteSummary } from "../utils/api";

/**
 * Equity Profile fetcher.
 * Retrieves company profile information via quoteSummary.
 */
export const YFinanceEquityProfileQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const YFinanceEquityProfileData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  employees: z.number().nullish(),
  website: z.string().nullish(),
  country: z.string().nullish(),
  city: z.string().nullish(),
  phone: z.string().nullish(),
  exchange: z.string().nullish(),
  currency: z.string().nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceEquityProfileData = z.infer<typeof YFinanceEquityProfileData>;

export class YFinanceEquityProfileFetcher extends AbstractFetcher<
  typeof YFinanceEquityProfileQueryParams,
  typeof YFinanceEquityProfileData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceEquityProfileQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof YFinanceEquityProfileQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const result = await fetchQuoteSummary(query.symbol, "assetProfile");
    const profile = result?.assetProfile;
    if (!profile) throw new EmptyDataError("No profile data found");
    return { symbol: query.symbol, ...profile };
  }

  async transformData(raw: unknown) {
    const d = raw as Record<string, unknown>;
    return [
      YFinanceEquityProfileData.parse({
        symbol: d.symbol,
        name: d.longBusinessSummary ? (d as any).companyName ?? null : null,
        description: d.longBusinessSummary,
        sector: d.sector,
        industry: d.industry,
        employees: d.fullTimeEmployees,
        website: d.website,
        country: d.country,
        city: d.city,
        phone: d.phone,
        exchange: d.exchange,
        currency: d.currency,
      }),
    ];
  }
}
