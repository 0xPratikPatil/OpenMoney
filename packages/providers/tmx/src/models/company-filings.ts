import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchFilings } from "../utils/api";

export const TmxCompanyFilingsData = z.object({
  symbol: z.string(),
  date: z.string().nullish(),
  title: z.string().nullish(),
  type: z.string().nullish(),
  url: z.string().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxCompanyFilingsData = z.infer<typeof TmxCompanyFilingsData>;

export const TmxCompanyFilingsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxCompanyFilingsQueryParams = z.infer<typeof TmxCompanyFilingsQueryParams>;

/**
 * Fetcher for company filings from TMX Money.
 * Endpoint: GET /api/company/{symbol}/filings
 */
export class TmxCompanyFilingsFetcher extends AbstractFetcher<
  typeof TmxCompanyFilingsQueryParams,
  typeof TmxCompanyFilingsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxCompanyFilingsQueryParams>,
  ): Promise<z.input<typeof TmxCompanyFilingsQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxCompanyFilingsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchFilings(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxCompanyFilingsData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxCompanyFilingsData.parse({
        symbol: (row.symbol ?? row.ticker) as string,
        date: row.date ?? row.filingDate,
        title: row.title ?? row.description,
        type: row.type ?? row.filingType,
        url: row.url ?? row.documentUrl,
      }),
    );
  }
}
