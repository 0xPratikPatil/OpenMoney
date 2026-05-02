import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fmpFetch, type FmpProfile } from "../utils/api";

export const FMPEquityProfileQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type FMPEquityProfileQueryParams = z.infer<typeof FMPEquityProfileQueryParams>;

export const FMPEquityProfileData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  employees: z.number().nullish(),
  website: z.string().nullish(),
  description: z.string().nullish(),
  exchange: z.string().nullish(),
  currency: z.string().nullish(),
  country: z.string().nullish(),
  city: z.string().nullish(),
  phone: z.string().nullish(),
  ipoDate: z.string().nullish(),
  marketCap: z.number().nullish(),
  provider: z.literal("fmp").default("fmp"),
});

export type FMPEquityProfileData = z.infer<typeof FMPEquityProfileData>;

export class FMPEquityProfileFetcher extends AbstractFetcher<
  typeof FMPEquityProfileQueryParams,
  typeof FMPEquityProfileData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof FMPEquityProfileQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof FMPEquityProfileQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["fmp_api_key"];
    if (!apiKey) throw new Error("FMP API key is required");
    const data = await fmpFetch<FmpProfile[]>(
      `/v3/profile/${encodeURIComponent(query.symbol)}`,
      apiKey,
    );
    if (!data || data.length === 0) throw new EmptyDataError(`No profile data for ${query.symbol}`);
    return data;
  }

  async transformData(raw: unknown) {
    const profiles = raw as FmpProfile[];
    return profiles
      .filter((p) => p.symbol)
      .map((p) =>
        FMPEquityProfileData.parse({
          symbol: p.symbol,
          name: p.companyName ?? null,
          sector: p.sector ?? null,
          industry: p.industry ?? null,
          employees: p.employees ?? null,
          website: p.website ?? null,
          description: p.description ?? null,
          exchange: p.exchangeShortName ?? null,
          currency: p.currency ?? null,
          country: p.country ?? null,
          city: p.city ?? null,
          phone: p.phone ?? null,
          ipoDate: p.ipoDate ?? null,
          marketCap: p.mktCap ?? null,
        }),
      );
  }
}
