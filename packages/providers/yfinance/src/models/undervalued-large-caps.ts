import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { YFScreenerData, mapScreenerQuote } from "./screener";
import { fetchScreener } from "../utils/api";

/**
 * Undervalued Large Caps fetcher.
 * Port of OpenBB's YFUndervaluedLargeCapsFetcher.
 */
export const YFUndervaluedLargeCapsQueryParams = z.object({
  limit: z.number().int().min(1).max(1000).default(200),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export class YFUndervaluedLargeCapsFetcher extends AbstractFetcher<
  typeof YFUndervaluedLargeCapsQueryParams,
  typeof YFScreenerData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFUndervaluedLargeCapsQueryParams>) {
    return { limit: params.limit ?? 200, sort: params.sort ?? "desc" };
  }

  async extractData(
    query: z.infer<typeof YFUndervaluedLargeCapsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const data = await fetchScreener({
      offset: 0,
      size: 250,
      sortField: "eodvolume",
      sortType: "desc",
      quoteType: "equity",
      query: {
        operator: "and",
        operands: [
          { operator: "gt", operands: ["intradaymarketcap", 10000000000] },
          {
            operator: "or",
            operands: [
              { operator: "eq", operands: ["exchange", "NMS"] },
              { operator: "eq", operands: ["exchange", "NYQ"] },
            ],
          },
          { operator: "btwn", operands: ["peratio.lasttwelvemonths", 0, 20] },
          { operator: "lt", operands: ["pegratio_5y", 1] },
          { operator: "gte", operands: ["epsgrowth.lasttwelvemonths", 25] },
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
