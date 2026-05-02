import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqFetch, extractDatatable } from "../utils/api";

export const NasdaqCalendarDividendQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
});

export const NasdaqCalendarDividendData = z.object({
  date: z.string().nullish(),
  ticker: z.string().nullish(),
  amount: z.number().nullish(),
  type: z.string().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqCalendarDividendData = z.infer<typeof NasdaqCalendarDividendData>;

/**
 * Fetch dividend calendar from Nasdaq Data Link (Quandl).
 */
export class NasdaqCalendarDividendFetcher extends AbstractFetcher<
  typeof NasdaqCalendarDividendQueryParams,
  typeof NasdaqCalendarDividendData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqCalendarDividendQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof NasdaqCalendarDividendQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["nasdaq_api_key"];
    const raw = await nasdaqFetch<unknown>(
      "/datatables/NDAQ/DIVCAL",
      { ticker: query.symbol },
      apiKey,
    );
    return raw;
  }

  async transformData(raw: unknown) {
    const rows = extractDatatable(raw);
    if (rows.length === 0) throw new EmptyDataError("No dividend calendar data found");

    return rows.map((r) =>
      NasdaqCalendarDividendData.parse({
        date: (r.date ?? r.exdate ?? null) as string | null,
        ticker: (r.ticker ?? null) as string | null,
        amount: (r.amount ?? r.dividend ?? null) as number | null,
        type: (r.type ?? r.dividend_type ?? null) as string | null,
      }),
    );
  }
}
