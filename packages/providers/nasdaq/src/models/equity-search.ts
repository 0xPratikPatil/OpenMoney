import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqPublicFetch } from "../utils/api";

export const NasdaqEquitySearchQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
});

export const NasdaqEquitySearchData = z.object({
  symbol: z.string().nullish(),
  name: z.string().nullish(),
  exchange: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqEquitySearchData = z.infer<typeof NasdaqEquitySearchData>;

/**
 * Search for equity information on Nasdaq public API.
 */
export class NasdaqEquitySearchFetcher extends AbstractFetcher<
  typeof NasdaqEquitySearchQueryParams,
  typeof NasdaqEquitySearchData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqEquitySearchQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof NasdaqEquitySearchQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return nasdaqPublicFetch<unknown>(`/api/quote/${encodeURIComponent(query.symbol)}/info`);
  }

  async transformData(raw: unknown): Promise<NasdaqEquitySearchData[]> {
    const data = raw as Record<string, unknown>;
    const info = (data as any)?.data ?? data;

    if (!info) throw new EmptyDataError("No equity info found");

    return [
      NasdaqEquitySearchData.parse({
        symbol: (info.symbol ?? null) as string | null,
        name: (info.companyName ?? info.name ?? null) as string | null,
        exchange: (info.exchange ?? null) as string | null,
        sector: (info.sector ?? null) as string | null,
        industry: (info.industry ?? null) as string | null,
      }),
    ];
  }
}
