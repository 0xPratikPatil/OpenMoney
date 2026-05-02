import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchNews } from "../utils/api";

export const YFinanceCompanyNewsQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  limit: z.number().int().min(1).max(100).default(10),
});

export const YFinanceCompanyNewsData = z.object({
  id: z.string().nullish(),
  title: z.string().nullish(),
  summary: z.string().nullish(),
  url: z.string().nullish(),
  source: z.string().nullish(),
  publishedAt: z.coerce.date().nullish(),
  symbols: z.array(z.string()).nullish(),
  provider: z.literal("yfinance").default("yfinance"),
});

export type YFinanceCompanyNewsData = z.infer<typeof YFinanceCompanyNewsData>;

export class YFinanceCompanyNewsFetcher extends AbstractFetcher<
  typeof YFinanceCompanyNewsQueryParams,
  typeof YFinanceCompanyNewsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceCompanyNewsQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof YFinanceCompanyNewsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const news = await fetchNews(query.symbol);
    if (news.length === 0) throw new EmptyDataError();
    return news.slice(0, query.limit);
  }

  async transformData(raw: unknown) {
    const articles = raw as Array<Record<string, unknown>>;
    return articles.map((a) =>
      YFinanceCompanyNewsData.parse({
        id: (a as any).uuid ?? null,
        title: (a as any).title ?? null,
        summary: (a as any).summary ?? null,
        url: (a as any).link ?? null,
        source: (a as any).publisher ?? null,
        publishedAt: (a as any).providerPublishTime
          ? new Date(((a as any).providerPublishTime as number) * 1000)
          : null,
        symbols: (a as any).relatedTickers ?? null,
      }),
    );
  }
}
