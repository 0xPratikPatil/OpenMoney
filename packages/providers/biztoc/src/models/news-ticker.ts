import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchBizToc, type BizTocArticle } from "../utils/api";

export const BizTocNewsTickerQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.number().int().min(1).max(50).default(10),
});

export const BizTocNewsTickerData = z.object({
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

export type BizTocNewsTickerData = z.infer<typeof BizTocNewsTickerData>;

export class BizTocNewsTickerFetcher extends AbstractFetcher<
  typeof BizTocNewsTickerQueryParams,
  typeof BizTocNewsTickerData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof BizTocNewsTickerQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof BizTocNewsTickerQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const items = await fetchBizToc<BizTocArticle>("/news/ticker", {
      ticker: query.symbol,
      n: query.limit,
    });
    return items;
  }

  async transformData(raw: unknown) {
    const items = raw as BizTocArticle[];
    return items.map((item) =>
      BizTocNewsTickerData.parse({
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
