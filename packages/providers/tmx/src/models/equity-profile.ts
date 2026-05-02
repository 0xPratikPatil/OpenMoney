import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchCompanyProfile } from "../utils/api";

export const TmxEquityProfileData = z.object({
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
  marketCap: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEquityProfileData = z.infer<typeof TmxEquityProfileData>;

export const TmxEquityProfileQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxEquityProfileQueryParams = z.infer<typeof TmxEquityProfileQueryParams>;

/**
 * Fetcher for company profile data from TMX Money.
 * Endpoint: GET /api/company/{symbol}
 */
export class TmxEquityProfileFetcher extends AbstractFetcher<
  typeof TmxEquityProfileQueryParams,
  typeof TmxEquityProfileData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEquityProfileQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxEquityProfileQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchCompanyProfile(query.symbol);
  }

  async transformData(raw: unknown) {
    const profile = raw as Record<string, unknown>;
    if (!profile || Object.keys(profile).length === 0) return [];

    return [
      TmxEquityProfileData.parse({
        symbol: profile.symbol ?? profile.ticker,
        name: profile.name ?? profile.companyName,
        description: profile.description ?? profile.businessDescription,
        sector: profile.sector,
        industry: profile.industry,
        employees: profile.employees ?? profile.numberOfEmployees,
        website: profile.website,
        country: profile.country,
        city: profile.city,
        phone: profile.phone,
        exchange: profile.exchange ?? "TSX",
        currency: profile.currency ?? "CAD",
        marketCap: profile.marketCap,
      }),
    ];
  }
}
