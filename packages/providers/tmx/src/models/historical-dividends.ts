import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchDividends } from "../utils/api";

export const TmxHistoricalDividendsData = z.object({
  date: z.string().nullish(),
  dividend: z.number().nullish(),
  yield: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxHistoricalDividendsData = z.infer<typeof TmxHistoricalDividendsData>;

export const TmxHistoricalDividendsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxHistoricalDividendsQueryParams = z.infer<typeof TmxHistoricalDividendsQueryParams>;

/**
 * Fetcher for historical dividend data from TMX Money.
 * Endpoint: GET /api/company/{symbol}/dividends
 */
export class TmxHistoricalDividendsFetcher extends AbstractFetcher<
  typeof TmxHistoricalDividendsQueryParams,
  typeof TmxHistoricalDividendsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxHistoricalDividendsQueryParams>,
  ): Promise<z.input<typeof TmxHistoricalDividendsQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxHistoricalDividendsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchDividends(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxHistoricalDividendsData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxHistoricalDividendsData.parse({
        date: row.date ?? row.exDate,
        dividend: row.dividend ?? row.amount,
        yield: row.yield,
      }),
    );
  }
}
