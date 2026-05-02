import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuotePage, parseQuoteTable, parseNumber } from "../utils/api";

export const FinvizKeyMetricsData = z.object({
  symbol: z.string(),
  pe: z.number().nullish(),
  forwardPe: z.number().nullish(),
  peg: z.number().nullish(),
  ps: z.number().nullish(),
  pb: z.number().nullish(),
  eps: z.number().nullish(),
  dividendYield: z.number().nullish(),
  beta: z.number().nullish(),
  provider: z.literal("finviz").default("finviz"),
});

export type FinvizKeyMetricsData = z.infer<typeof FinvizKeyMetricsData>;

export const FinvizKeyMetricsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type FinvizKeyMetricsQueryParams = z.infer<typeof FinvizKeyMetricsQueryParams>;

/**
 * Fetcher for key financial metrics from FinViz.
 */
export class FinvizKeyMetricsFetcher extends AbstractFetcher<
  typeof FinvizKeyMetricsQueryParams,
  typeof FinvizKeyMetricsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FinvizKeyMetricsQueryParams>,
  ): Promise<z.input<typeof FinvizKeyMetricsQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof FinvizKeyMetricsQueryParams>,
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
    query?: z.infer<typeof FinvizKeyMetricsQueryParams>,
  ): Promise<FinvizKeyMetricsData[]> {
    const data = raw as Record<string, string>;
    if (Object.keys(data).length === 0) {
      throw new EmptyDataError("No key metrics parsed");
    }

    return [
      FinvizKeyMetricsData.parse({
        symbol: query?.symbol ?? "UNKNOWN",
        pe: parseNumber(data["P/E"]),
        forwardPe: parseNumber(data["Forward P/E"]),
        peg: parseNumber(data["PEG"]),
        ps: parseNumber(data["P/S"]),
        pb: parseNumber(data["P/B"]),
        eps: parseNumber(data["EPS (ttm)"]),
        dividendYield: parseNumber(data["Dividend %"]),
        beta: parseNumber(data["Beta"]),
      }),
    ];
  }
}
