import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { avFetch, parseNumber, parseString } from "../utils/api";

export const AVEquityProfileData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  exchange: z.string().nullish(),
  currency: z.string().nullish(),
  country: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  marketCap: z.number().nullish(),
  sharesOutstanding: z.number().nullish(),
  employees: z.number().nullish(),
  beta: z.number().nullish(),
  dividendYield: z.number().nullish(),
  website: z.string().nullish(),
  phone: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVEquityProfileData = z.infer<typeof AVEquityProfileData>;

export const AVEquityProfileQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type AVEquityProfileQueryParams = z.infer<typeof AVEquityProfileQueryParams>;

export class AVEquityProfileFetcher extends AbstractFetcher<
  typeof AVEquityProfileQueryParams,
  typeof AVEquityProfileData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof AVEquityProfileQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof AVEquityProfileQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    return avFetch("OVERVIEW", apiKey, { symbol: query.symbol });
  }

  async transformData(
    raw: unknown,
  ) {
    const profile = raw as Record<string, unknown>;
    if (!profile || !profile.Symbol) throw new EmptyDataError("No company overview data returned");

    return [
      AVEquityProfileData.parse({
        symbol: String(profile.Symbol),
        name: parseString(profile.Name),
        description: parseString(profile.Description),
        exchange: parseString(profile.Exchange),
        currency: parseString(profile.Currency),
        country: parseString(profile.Country),
        sector: parseString(profile.Sector),
        industry: parseString(profile.Industry),
        marketCap: parseNumber(profile.MarketCapitalization),
        sharesOutstanding: parseNumber(profile.SharesOutstanding),
        employees: parseNumber(profile.FullTimeEmployees),
        beta: parseNumber(profile.Beta),
        dividendYield: parseNumber(profile.DividendYield),
        website: parseString(profile.Website) ?? parseString(profile.OfficialSite) ?? undefined,
        phone: parseString(profile.Phone),
        city: parseString(profile.City),
        state: parseString(profile.State),
        zip: parseString(profile.Zip),
      }),
    ];
  }
}
