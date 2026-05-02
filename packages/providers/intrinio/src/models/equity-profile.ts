import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchCompanyProfile } from "../utils/api";

export const IntrinioEquityProfileData = z.object({
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
  ticker: z.string().nullish(),
  provider: z.literal("intrinio").default("intrinio"),
});

export type IntrinioEquityProfileData = z.infer<typeof IntrinioEquityProfileData>;

export const IntrinioEquityProfileQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export type IntrinioEquityProfileQueryParams = z.infer<typeof IntrinioEquityProfileQueryParams>;

/**
 * Fetcher for company profile data from Intrinio.
 * Uses /companies/{symbol}.
 */
export class IntrinioEquityProfileFetcher extends AbstractFetcher<
  typeof IntrinioEquityProfileQueryParams,
  typeof IntrinioEquityProfileData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof IntrinioEquityProfileQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof IntrinioEquityProfileQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const profile = await fetchCompanyProfile(query.symbol, credentials);
    if (!profile) throw new EmptyDataError(`No profile data for ${query.symbol}`);
    return profile;
  }

  async transformData(raw: unknown): Promise<IntrinioEquityProfileData[]> {
    const p = raw as Record<string, unknown>;
    return [
      IntrinioEquityProfileData.parse({
        symbol: p.ticker ?? p.symbol,
        name: p.company_name ?? p.name ?? null,
        description: p.short_description ?? p.description ?? null,
        sector: p.sector ?? null,
        industry: p.industry_category ?? null,
        employees: p.total_employees ?? null,
        website: p.company_url ?? null,
        country: p.country ?? null,
        city: p.city ?? null,
        phone: p.phone ?? null,
        exchange: p.exchange ?? null,
        currency: p.currency ?? null,
        ticker: p.ticker ?? null,
      }),
    ];
  }
}
