import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchCompanyNews } from "../utils/api";

export const TmxCompanyNewsData = z.object({
  date: z.string().nullish(),
  title: z.string().nullish(),
  summary: z.string().nullish(),
  url: z.string().nullish(),
  source: z.string().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxCompanyNewsData = z.infer<typeof TmxCompanyNewsData>;

export const TmxCompanyNewsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type TmxCompanyNewsQueryParams = z.infer<typeof TmxCompanyNewsQueryParams>;

/**
 * Fetcher for company news from TMX Money.
 * Endpoint: GET /api/company/{symbol}/news
 */
export class TmxCompanyNewsFetcher extends AbstractFetcher<
  typeof TmxCompanyNewsQueryParams,
  typeof TmxCompanyNewsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxCompanyNewsQueryParams>,
  ): Promise<z.input<typeof TmxCompanyNewsQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof TmxCompanyNewsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchCompanyNews(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxCompanyNewsData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.slice(0, (rows as any).limit ?? 20).map((row) =>
      TmxCompanyNewsData.parse({
        date: row.date ?? row.publishDate,
        title: row.title,
        summary: row.summary ?? row.description,
        url: row.url ?? row.link,
        source: row.source ?? row.publisher,
      }),
    );
  }
}
