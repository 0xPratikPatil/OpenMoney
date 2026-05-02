import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBenzinga, type BenzingaNewsItem } from "../utils/api";

export const BenzingaCompanyNewsQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.number().int().min(1).max(100).default(10),
  channels: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const BenzingaCompanyNewsData = z.object({
  id: z.string().nullish(),
  title: z.string().nullish(),
  body: z.string().nullish(),
  url: z.string().nullish(),
  author: z.string().nullish(),
  created: z.coerce.date().nullish(),
  updated: z.coerce.date().nullish(),
  symbols: z.array(z.string()).nullish(),
  channels: z.array(z.string()).nullish(),
  categories: z.array(z.string()).nullish(),
  provider: z.literal("benzinga").default("benzinga"),
});

export type BenzingaCompanyNewsData = z.infer<typeof BenzingaCompanyNewsData>;

export class BenzingaCompanyNewsFetcher extends AbstractFetcher<
  typeof BenzingaCompanyNewsQueryParams,
  typeof BenzingaCompanyNewsData
> {
  requireCredentials = true;

  async transformQuery(params: z.input<typeof BenzingaCompanyNewsQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 10,
      channels: params.channels,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    };
  }

  async extractData(
    query: z.infer<typeof BenzingaCompanyNewsQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const items = await fetchBenzinga<BenzingaNewsItem>("/news", {
      symbols: query.symbol,
      pageSize: query.limit,
      channels: query.channels,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    }, credentials);
    return items;
  }

  async transformData(raw: unknown): Promise<BenzingaCompanyNewsData[]> {
    const items = raw as BenzingaNewsItem[];
    return items.map((item) =>
      BenzingaCompanyNewsData.parse({
        id: item.id ?? null,
        title: item.title ?? null,
        body: item.body ?? null,
        url: item.url ?? null,
        author: item.author ?? null,
        created: item.created ? new Date(item.created * 1000) : null,
        updated: item.updated ? new Date(item.updated * 1000) : null,
        symbols: item.stocks ?? null,
        channels: item.channels ?? null,
        categories: item.categories ?? null,
      }),
    );
  }
}
