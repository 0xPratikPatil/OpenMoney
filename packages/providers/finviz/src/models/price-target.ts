import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuotePage, parseQuoteTable, parseNumber } from "../utils/api";

export const FinvizPriceTargetData = z.object({
  symbol: z.string(),
  rating: z.string().nullish(),
  priceTarget: z.number().nullish(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  median: z.number().nullish(),
  count: z.number().nullish(),
  provider: z.literal("finviz").default("finviz"),
});

export type FinvizPriceTargetData = z.infer<typeof FinvizPriceTargetData>;

export const FinvizPriceTargetQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type FinvizPriceTargetQueryParams = z.infer<typeof FinvizPriceTargetQueryParams>;

/**
 * Fetcher for price target consensus from FinViz.
 */
export class FinvizPriceTargetFetcher extends AbstractFetcher<
  typeof FinvizPriceTargetQueryParams,
  typeof FinvizPriceTargetData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FinvizPriceTargetQueryParams>,
  ): Promise<z.input<typeof FinvizPriceTargetQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof FinvizPriceTargetQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const html = await fetchQuotePage(query.symbol);
    if (!html.includes("snapshot-td2-cp")) {
      throw new EmptyDataError(`No data found for ${query.symbol}`);
    }
    return parseQuoteTable(html);
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof FinvizPriceTargetQueryParams>,
  ): Promise<FinvizPriceTargetData[]> {
    const data = raw as Record<string, string>;
    if (Object.keys(data).length === 0) {
      throw new EmptyDataError("No price target data parsed");
    }

    return [
      FinvizPriceTargetData.parse({
        symbol: query?.symbol ?? "UNKNOWN",
        rating: data["Rating"] ?? null,
        priceTarget: parseNumber(data["Target Price"]),
        high: parseNumber(data["52W Range"]?.split("-")[1]),
        low: parseNumber(data["52W Range"]?.split("-")[0]),
        median: parseNumber(data["Target Price"]),
        count: parseNumber(data["Analysts"]),
      }),
    ];
  }
}
