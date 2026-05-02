import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqPublicFetch } from "../utils/api";

export const NasdaqEquityScreenerQueryParams = z.object({
  exchange: z.string().optional(),
  sector: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

export const NasdaqEquityScreenerData = z.object({
  symbol: z.string().nullish(),
  name: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  volume: z.number().nullish(),
  marketCap: z.number().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqEquityScreenerData = z.infer<typeof NasdaqEquityScreenerData>;

/**
 * Fetch equity screener data from Nasdaq public API.
 */
export class NasdaqEquityScreenerFetcher extends AbstractFetcher<
  typeof NasdaqEquityScreenerQueryParams,
  typeof NasdaqEquityScreenerData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqEquityScreenerQueryParams>) {
    return {
      exchange: params.exchange,
      sector: params.sector,
      limit: params.limit ?? 100,
    };
  }

  async extractData(
    query: z.infer<typeof NasdaqEquityScreenerQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const params: Record<string, string> = {
      limit: String(query.limit ?? 100),
    };
    if (query.exchange) params["exchange"] = query.exchange;
    if (query.sector) params["sector"] = query.sector;

    return nasdaqPublicFetch<unknown>("/api/screener/stocks", params);
  }

  async transformData(raw: unknown): Promise<NasdaqEquityScreenerData[]> {
    const data = raw as Record<string, unknown>;
    const rows = (data as any)?.data?.rows ?? (data as any)?.data ?? [];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new EmptyDataError("No screener data found");
    }

    return rows.map((r: Record<string, unknown>) =>
      NasdaqEquityScreenerData.parse({
        symbol: (r.symbol ?? r.ticker ?? null) as string | null,
        name: (r.name ?? r.companyName ?? null) as string | null,
        price: (r.price ?? r.lastSale ?? null) as number | null,
        change: (r.change ?? r.netChange ?? null) as number | null,
        volume: (r.volume ?? null) as number | null,
        marketCap: (r.marketCap ?? null) as number | null,
        sector: (r.sector ?? null) as string | null,
        industry: (r.industry ?? null) as string | null,
      }),
    );
  }
}
