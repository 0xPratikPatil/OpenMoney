import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchSAJson, type SAArticle } from "../utils/api";

export const SAEarningsTranscriptsQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.number().int().min(1).max(20).default(5),
});

export const SAEarningsTranscriptsData = z.object({
  id: z.string().nullish(),
  title: z.string().nullish(),
  summary: z.string().nullish(),
  content: z.string().nullish(),
  url: z.string().nullish(),
  author: z.string().nullish(),
  publishedAt: z.coerce.date().nullish(),
  updatedAt: z.coerce.date().nullish(),
  tickers: z.array(z.string()).nullish(),
  provider: z.literal("seeking_alpha").default("seeking_alpha"),
});

export type SAEarningsTranscriptsData = z.infer<typeof SAEarningsTranscriptsData>;

export class SAEarningsTranscriptsFetcher extends AbstractFetcher<
  typeof SAEarningsTranscriptsQueryParams,
  typeof SAEarningsTranscriptsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SAEarningsTranscriptsQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 5,
    };
  }

  async extractData(
    query: z.infer<typeof SAEarningsTranscriptsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const items = await fetchSAJson<SAArticle>(
      `/api/v3/earnings-transcripts/${query.symbol}`,
      { limit: query.limit },
    );
    return items;
  }

  async transformData(raw: unknown) {
    const items = raw as SAArticle[];
    return items.map((item) =>
      SAEarningsTranscriptsData.parse({
        id: item.id ?? null,
        title: item.title ?? null,
        summary: item.summary ?? null,
        content: item.content ?? null,
        url: item.url ?? null,
        author: item.author ?? null,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
        tickers: item.tickers ?? null,
      }),
    );
  }
}
