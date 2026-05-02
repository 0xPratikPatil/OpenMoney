import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqFetch, extractDatatable } from "../utils/api";

export const NasdaqHistoricalDividendsQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
});

export const NasdaqHistoricalDividendsData = z.object({
  date: z.string().nullish(),
  amount: z.number().nullish(),
  type: z.string().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqHistoricalDividendsData = z.infer<typeof NasdaqHistoricalDividendsData>;

/**
 * Fetch historical dividends from Nasdaq Data Link (Quandl).
 */
export class NasdaqHistoricalDividendsFetcher extends AbstractFetcher<
  typeof NasdaqHistoricalDividendsQueryParams,
  typeof NasdaqHistoricalDividendsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqHistoricalDividendsQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof NasdaqHistoricalDividendsQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["nasdaq_api_key"];
    const raw = await nasdaqFetch<unknown>(
      "/datatables/NDAQ/DIVCAL",
      { ticker: query.symbol, historical: "true" },
      apiKey,
    );
    return raw;
  }

  async transformData(raw: unknown) {
    const rows = extractDatatable(raw);
    if (rows.length === 0) throw new EmptyDataError("No historical dividend data found");

    return rows.map((r) =>
      NasdaqHistoricalDividendsData.parse({
        date: (r.date ?? r.exdate ?? null) as string | null,
        amount: (r.amount ?? r.dividend ?? null) as number | null,
        type: (r.type ?? r.dividend_type ?? null) as string | null,
      }),
    );
  }
}
