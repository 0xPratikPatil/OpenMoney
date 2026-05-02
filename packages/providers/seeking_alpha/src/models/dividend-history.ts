import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchSAJson, type SADividendItem } from "../utils/api";

export const SADividendHistoryQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.number().int().min(1).max(100).default(20),
});

export const SADividendHistoryData = z.object({
  ticker: z.string().nullish(),
  exDate: z.coerce.date().nullish(),
  payDate: z.coerce.date().nullish(),
  amount: z.number().nullish(),
  yield: z.number().nullish(),
  type: z.string().nullish(),
  frequency: z.string().nullish(),
  provider: z.literal("seeking_alpha").default("seeking_alpha"),
});

export type SADividendHistoryData = z.infer<typeof SADividendHistoryData>;

export class SADividendHistoryFetcher extends AbstractFetcher<
  typeof SADividendHistoryQueryParams,
  typeof SADividendHistoryData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SADividendHistoryQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof SADividendHistoryQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const items = await fetchSAJson<SADividendItem>(
      `/api/v3/dividends/${query.symbol}`,
      { limit: query.limit },
    );
    return items;
  }

  async transformData(raw: unknown): Promise<SADividendHistoryData[]> {
    const items = raw as SADividendItem[];
    return items.map((item) =>
      SADividendHistoryData.parse({
        ticker: item.ticker ?? null,
        exDate: item.exDate ? new Date(item.exDate) : null,
        payDate: item.payDate ? new Date(item.payDate) : null,
        amount: item.amount ?? null,
        yield: item.yield ?? null,
        type: item.type ?? null,
        frequency: item.frequency ?? null,
      }),
    );
  }
}
