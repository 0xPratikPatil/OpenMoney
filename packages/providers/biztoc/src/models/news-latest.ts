import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBizToc, type BizTocArticle } from "../utils/api";

export const BizTocNewsLatestQueryParams = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
});

export const BizTocNewsLatestData = z.object({
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

export type BizTocNewsLatestData = z.infer<typeof BizTocNewsLatestData>;

export class BizTocNewsLatestFetcher extends AbstractFetcher<
  typeof BizTocNewsLatestQueryParams,
  typeof BizTocNewsLatestData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof BizTocNewsLatestQueryParams>) {
    return {
      limit: params.limit ?? 10,
      category: params.category,
    };
  }

  async extractData(
    query: z.infer<typeof BizTocNewsLatestQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const items = await fetchBizToc<BizTocArticle>("/news/latest", {
      n: query.limit,
      category: query.category,
    });
    return items;
  }

  async transformData(raw: unknown): Promise<BizTocNewsLatestData[]> {
    const items = raw as BizTocArticle[];
    return items.map((item) =>
      BizTocNewsLatestData.parse({
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
