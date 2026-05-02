import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchSAJson, type SAArticle } from "../utils/api";

export const SAArticleNewsQueryParams = z.object({
  symbol: z.string().optional().transform((s) => s?.toUpperCase()),
  limit: z.number().int().min(1).max(50).default(10),
  type: z.enum(["article", "market-outlook", "all"]).optional(),
});

export const SAArticleNewsData = z.object({
  id: z.string().nullish(),
  title: z.string().nullish(),
  summary: z.string().nullish(),
  content: z.string().nullish(),
  url: z.string().nullish(),
  author: z.string().nullish(),
  publishedAt: z.coerce.date().nullish(),
  updatedAt: z.coerce.date().nullish(),
  tickers: z.array(z.string()).nullish(),
  type: z.string().nullish(),
  provider: z.literal("seeking_alpha").default("seeking_alpha"),
});

export type SAArticleNewsData = z.infer<typeof SAArticleNewsData>;

export class SAArticleNewsFetcher extends AbstractFetcher<
  typeof SAArticleNewsQueryParams,
  typeof SAArticleNewsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SAArticleNewsQueryParams>) {
    return {
      symbol: params.symbol,
      limit: params.limit ?? 10,
      type: params.type,
    };
  }

  async extractData(
    query: z.infer<typeof SAArticleNewsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const path = query.symbol
      ? `/api/v3/news/${query.symbol}`
      : "/api/v3/news";
    const items = await fetchSAJson<SAArticle>(path, {
      limit: query.limit,
      type: query.type !== "all" ? query.type : undefined,
    });
    return items;
  }

  async transformData(raw: unknown): Promise<SAArticleNewsData[]> {
    const items = raw as SAArticle[];
    return items.map((item) =>
      SAArticleNewsData.parse({
        id: item.id ?? null,
        title: item.title ?? null,
        summary: item.summary ?? null,
        content: item.content ?? null,
        url: item.url ?? null,
        author: item.author ?? null,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
        tickers: item.tickers ?? null,
        type: item.type ?? null,
      }),
    );
  }
}
