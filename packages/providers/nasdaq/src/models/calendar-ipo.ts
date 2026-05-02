import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqFetch, extractDatatable } from "../utils/api";

export const NasdaqCalendarIpoQueryParams = z.object({
  date: z.string().optional(),
});

export const NasdaqCalendarIpoData = z.object({
  date: z.string().nullish(),
  company: z.string().nullish(),
  symbol: z.string().nullish(),
  exchange: z.string().nullish(),
  price: z.string().nullish(),
  shares: z.number().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqCalendarIpoData = z.infer<typeof NasdaqCalendarIpoData>;

/**
 * Fetch IPO calendar from Nasdaq Data Link (Quandl).
 */
export class NasdaqCalendarIpoFetcher extends AbstractFetcher<
  typeof NasdaqCalendarIpoQueryParams,
  typeof NasdaqCalendarIpoData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqCalendarIpoQueryParams>) {
    return { date: params.date };
  }

  async extractData(
    _query: z.infer<typeof NasdaqCalendarIpoQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials["nasdaq_api_key"];
    const params: Record<string, string> = {};
    const raw = await nasdaqFetch<unknown>("/datatables/NDAQ/IPOCAL", params, apiKey);
    return raw;
  }

  async transformData(raw: unknown): Promise<NasdaqCalendarIpoData[]> {
    const rows = extractDatatable(raw);
    if (rows.length === 0) throw new EmptyDataError("No IPO calendar data found");

    return rows.map((r) =>
      NasdaqCalendarIpoData.parse({
        date: (r.date ?? r.expected_date ?? null) as string | null,
        company: (r.company ?? r.name ?? null) as string | null,
        symbol: (r.symbol ?? r.ticker ?? null) as string | null,
        exchange: (r.exchange ?? null) as string | null,
        price: (r.price ?? r.range ?? null) as string | null,
        shares: (r.shares ?? null) as number | null,
      }),
    );
  }
}
