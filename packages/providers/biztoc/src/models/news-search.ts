import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBizToc, type BizTocArticle } from "../utils/api";

export const BizTocNewsSearchQueryParams = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(10),
});

export const BizTocNewsSearchData = z.object({
  id: z.string().nullish(),
  title: z.string().nullish(),
  body: z.string().nullish(),
  url: z.string().nullish(),
  source: z.string().nullish(),
  date: z.coerce.date().nullish(),
  tickers: z.array(z.string()).nullish(),
  summary: z.string().nullish(),
  provider: z.literal("biztoc").default("biztoc"),
});

export type BizTocNewsSearchData = z.infer<typeof BizTocNewsSearchData>;

export class BizTocNewsSearchFetcher extends AbstractFetcher<
  typeof BizTocNewsSearchQueryParams,
  typeof BizTocNewsSearchData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof BizTocNewsSearchQueryParams>) {
    return {
      query: params.query,
      limit: params.limit ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof BizTocNewsSearchQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const items = await fetchBizToc<BizTocArticle>("/news/search", {
      q: query.query,
      n: query.limit,
    });
    return items;
  }

  async transformData(raw: unknown): Promise<BizTocNewsSearchData[]> {
    const items = raw as BizTocArticle[];
    return items.map((item) =>
      BizTocNewsSearchData.parse({
        id: item.id ?? null,
        title: item.title ?? null,
        body: item.body ?? null,
        url: item.url ?? null,
        source: item.source ?? null,
        date: item.date ? new Date(item.date) : null,
        tickers: item.tickers ?? null,
        summary: item.summary ?? null,
      }),
    );
  }
}
