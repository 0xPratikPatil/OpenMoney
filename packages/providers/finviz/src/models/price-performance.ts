import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuotePage, parseQuoteTable, parseNumber } from "../utils/api";

export const FinvizPricePerformanceData = z.object({
  symbol: z.string(),
  dayChange: z.number().nullish(),
  weekChange: z.number().nullish(),
  monthChange: z.number().nullish(),
  quarterChange: z.number().nullish(),
  yearChange: z.number().nullish(),
  ytdChange: z.number().nullish(),
  provider: z.literal("finviz").default("finviz"),
});

export type FinvizPricePerformanceData = z.infer<typeof FinvizPricePerformanceData>;

export const FinvizPricePerformanceQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type FinvizPricePerformanceQueryParams = z.infer<typeof FinvizPricePerformanceQueryParams>;

/**
 * Fetcher for price performance data from FinViz.
 */
export class FinvizPricePerformanceFetcher extends AbstractFetcher<
  typeof FinvizPricePerformanceQueryParams,
  typeof FinvizPricePerformanceData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FinvizPricePerformanceQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof FinvizPricePerformanceQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const html = await fetchQuotePage(query.symbol);
    if (!html.includes("snapshot-td2-cp")) {
      throw new EmptyDataError(`No data found for ${query.symbol}`);
    }
    return parseQuoteTable(html);
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof FinvizPricePerformanceQueryParams>,
  ) {
    const data = raw as Record<string, string>;
    if (Object.keys(data).length === 0) {
      throw new EmptyDataError("No performance data parsed");
    }

    return [
      FinvizPricePerformanceData.parse({
        symbol: query?.symbol ?? "UNKNOWN",
        dayChange: parseNumber(data["Change"]),
        weekChange: parseNumber(data["Perf (Week)"]),
        monthChange: parseNumber(data["Perf (Month)"]),
        quarterChange: parseNumber(data["Perf (Quarter)"]),
        yearChange: parseNumber(data["Perf (Year)"]),
        ytdChange: parseNumber(data["Perf (YTD)"]),
      }),
    ];
  }
}
