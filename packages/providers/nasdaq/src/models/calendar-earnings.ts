import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqFetch, extractDatatable } from "../utils/api";

export const NasdaqCalendarEarningsQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
});

export const NasdaqCalendarEarningsData = z.object({
  date: z.string().nullish(),
  ticker: z.string().nullish(),
  quarter: z.string().nullish(),
  estimate: z.number().nullish(),
  actual: z.number().nullish(),
  surprise: z.number().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqCalendarEarningsData = z.infer<typeof NasdaqCalendarEarningsData>;

/**
 * Fetch earnings calendar from Nasdaq Data Link (Quandl).
 */
export class NasdaqCalendarEarningsFetcher extends AbstractFetcher<
  typeof NasdaqCalendarEarningsQueryParams,
  typeof NasdaqCalendarEarningsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqCalendarEarningsQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof NasdaqCalendarEarningsQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials["nasdaq_api_key"];
    const raw = await nasdaqFetch<unknown>(
      "/datatables/NDAQ/EARCAL",
      { ticker: query.symbol },
      apiKey,
    );
    return raw;
  }

  async transformData(raw: unknown): Promise<NasdaqCalendarEarningsData[]> {
    const rows = extractDatatable(raw);
    if (rows.length === 0) throw new EmptyDataError("No earnings calendar data found");

    return rows.map((r) =>
      NasdaqCalendarEarningsData.parse({
        date: (r.date ?? r.report_date ?? null) as string | null,
        ticker: (r.ticker ?? null) as string | null,
        quarter: (r.quarter ?? null) as string | null,
        estimate: (r.estimate ?? null) as number | null,
        actual: (r.actual ?? null) as number | null,
        surprise: (r.surprise ?? null) as number | null,
      }),
    );
  }
}
