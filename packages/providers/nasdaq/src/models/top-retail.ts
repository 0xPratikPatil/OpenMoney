import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqPublicFetch } from "../utils/api";

export const NasdaqTopRetailQueryParams = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const NasdaqTopRetailData = z.object({
  symbol: z.string().nullish(),
  name: z.string().nullish(),
  buyVolume: z.number().nullish(),
  sellVolume: z.number().nullish(),
  netVolume: z.number().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqTopRetailData = z.infer<typeof NasdaqTopRetailData>;

/**
 * Fetch top retail activity data from Nasdaq.
 */
export class NasdaqTopRetailFetcher extends AbstractFetcher<
  typeof NasdaqTopRetailQueryParams,
  typeof NasdaqTopRetailData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqTopRetailQueryParams>) {
    return { limit: params.limit ?? 20 };
  }

  async extractData(
    _query: z.infer<typeof NasdaqTopRetailQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return nasdaqPublicFetch<unknown>("/api/retail/top");
  }

  async transformData(raw: unknown): Promise<NasdaqTopRetailData[]> {
    const data = raw as Record<string, unknown>;
    const rows = (data as any)?.data?.rows ?? (data as any)?.data ?? [];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new EmptyDataError("No top retail data found");
    }

    return rows.map((r: Record<string, unknown>) =>
      NasdaqTopRetailData.parse({
        symbol: (r.symbol ?? r.ticker ?? null) as string | null,
        name: (r.name ?? r.companyName ?? null) as string | null,
        buyVolume: (r.buyVolume ?? r.buy_volume ?? null) as number | null,
        sellVolume: (r.sellVolume ?? r.sell_volume ?? null) as number | null,
        netVolume: (r.netVolume ?? r.net_volume ?? null) as number | null,
      }),
    );
  }
}
