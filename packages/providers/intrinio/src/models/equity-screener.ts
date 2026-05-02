import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { searchSecurities } from "../utils/api";

export const IntrinioEquityScreenerData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  exchange: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  securityType: z.string().nullish(),
  provider: z.literal("intrinio").default("intrinio"),
});

export type IntrinioEquityScreenerData = z.infer<typeof IntrinioEquityScreenerData>;

export const IntrinioEquityScreenerQueryParams = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().int().min(1).max(1000).default(50),
});

export type IntrinioEquityScreenerQueryParams = z.infer<typeof IntrinioEquityScreenerQueryParams>;

/**
 * Fetcher for security screening/serach from Intrinio.
 * Uses /securities/search.
 */
export class IntrinioEquityScreenerFetcher extends AbstractFetcher<
  typeof IntrinioEquityScreenerQueryParams,
  typeof IntrinioEquityScreenerData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof IntrinioEquityScreenerQueryParams>) {
    return { query: params.query, limit: params.limit ?? 50 };
  }

  async extractData(
    query: z.infer<typeof IntrinioEquityScreenerQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const results = await searchSecurities(query.query, credentials);
    if (results.length === 0) throw new EmptyDataError("No matching securities found");
    return results;
  }

  async transformData(raw: unknown): Promise<IntrinioEquityScreenerData[]> {
    const securities = raw as Array<Record<string, unknown>>;
    return securities.map((s) =>
      IntrinioEquityScreenerData.parse({
        symbol: s.ticker ?? s.symbol,
        name: s.name ?? s.company_name ?? null,
        exchange: s.exchange ?? s.mic ?? null,
        sector: s.sector ?? null,
        industry: s.industry ?? s.industry_category ?? null,
        securityType: s.security_type ?? s.type ?? null,
      }),
    );
  }
}
