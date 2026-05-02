import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secFetch } from "../utils/api";

export const SECEquityFtdQueryParams = z.object({
  ticker: z.string().min(1).transform((s) => s.toUpperCase()),
  date: z.string().optional(),
});

export const SECEquityFtdData = z.object({
  date: z.string().nullish(),
  ticker: z.string().nullish(),
  price: z.number().nullish(),
  volume: z.number().nullish(),
  fails: z.number().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECEquityFtdData = z.infer<typeof SECEquityFtdData>;

/**
 * Fetch fails-to-deliver data for an equity from SEC.
 * Source: SEC fails-to-deliver data files.
 */
export class SECEquityFtdFetcher extends AbstractFetcher<
  typeof SECEquityFtdQueryParams,
  typeof SECEquityFtdData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECEquityFtdQueryParams>) {
    return {
      ticker: params.ticker.toUpperCase(),
      date: params.date,
    };
  }

  async extractData(
    query: z.infer<typeof SECEquityFtdQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // FTD data published weekly at /files/data/fails/
    const path = query.date
      ? `/files/data/fails/daily${query.date.replace(/-/g, "")}.json`
      : "/files/data/fails/daily.json";

    try {
      return await secFetch<unknown>(path);
    } catch {
      // FTD data uses specific file naming — try alternative format
      const altPath = "/files/data/fails/daily.json";
      return secFetch<unknown>(altPath);
    }
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const rows = (data as any)?.data ?? (data as any)?.results ?? data;
    if (!Array.isArray(rows)) throw new EmptyDataError("No FTD data available");

    return rows
      .filter((r: Record<string, unknown>) => {
        const ticker = (r.ticker ?? r.symbol ?? "") as string;
        return ticker.toUpperCase() === (this as any).__query?.ticker?.toUpperCase();
      })
      .map((r: Record<string, unknown>) =>
        SECEquityFtdData.parse({
          date: (r.date ?? r.settlementDate ?? null) as string | null,
          ticker: (r.ticker ?? r.symbol ?? null) as string | null,
          price: (r.price ?? r.failPrice ?? null) as number | null,
          volume: (r.volume ?? null) as number | null,
          fails: (r.fails ?? r.quantity ?? null) as number | null,
        }),
      );
  }
}
