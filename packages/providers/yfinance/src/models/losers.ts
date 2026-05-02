import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { YFScreenerData, mapScreenerQuote } from "./screener";
import { fetchScreener } from "../utils/api";

/**
 * Top Losers fetcher.
 * Port of OpenBB's YFLosersFetcher.
 */
export const YFLosersQueryParams = z.object({
  limit: z.number().int().min(1).max(1000).default(200),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export class YFLosersFetcher extends AbstractFetcher<typeof YFLosersQueryParams, typeof YFScreenerData> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFLosersQueryParams>) {
    return { limit: params.limit ?? 200, sort: params.sort ?? "desc" };
  }

  async extractData(
    query: z.infer<typeof YFLosersQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const data = await fetchScreener({
      offset: 0,
      size: 250,
      sortField: "percentchange",
      sortType: "asc",
      quoteType: "equity",
      query: {
        operator: "and",
        operands: [
          { operator: "gt", operands: ["intradaymarketcap", 500000000] },
          {
            operator: "or",
            operands: [
              { operator: "eq", operands: ["exchange", "NMS"] },
              { operator: "eq", operands: ["exchange", "NYQ"] },
            ],
          },
          { operator: "gt", operands: ["percentchange", -3] },
          { operator: "gt", operands: ["intradayprice", 5] },
        ],
      },
    }, query.limit);
    return data;
  }

  async transformData(
    raw: unknown,
  ): Promise<z.output<typeof YFScreenerData>[]> {
    const quotes = raw as any[];
    if (quotes.length === 0) throw new EmptyDataError();
    return quotes.map((q) => YFScreenerData.parse(mapScreenerQuote(q)));
  }
}
