import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchWSJ, type WSJNewsItem } from "../utils/api";

export const WSJMarketNewsQueryParams = z.object({
  category: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

export const WSJMarketNewsData = z.object({
  id: z.string().nullish(),
  title: z.string().nullish(),
  summary: z.string().nullish(),
  url: z.string().nullish(),
  publishedAt: z.coerce.date().nullish(),
  source: z.string().nullish(),
  category: z.string().nullish(),
  provider: z.literal("wsj").default("wsj"),
});

export type WSJMarketNewsData = z.infer<typeof WSJMarketNewsData>;

export class WSJMarketNewsFetcher extends AbstractFetcher<
  typeof WSJMarketNewsQueryParams,
  typeof WSJMarketNewsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof WSJMarketNewsQueryParams>) {
    return {
      category: params.category,
      limit: params.limit ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof WSJMarketNewsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const path = query.category
      ? `/api/news/${query.category}`
      : "/api/news/markets";
    const items = await fetchWSJ<WSJNewsItem>(path);
    return items.slice(0, query.limit);
  }

  async transformData(raw: unknown): Promise<WSJMarketNewsData[]> {
    const items = raw as WSJNewsItem[];
    return items.map((item) =>
      WSJMarketNewsData.parse({
        id: item.id ?? null,
        title: item.title ?? null,
        summary: item.summary ?? null,
        url: item.url ?? null,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        source: item.source ?? null,
        category: item.category ?? null,
      }),
    );
  }
}
