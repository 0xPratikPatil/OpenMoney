import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { YFScreenerData, mapScreenerQuote } from "./screener";
import { fetchScreener } from "../utils/api";

/**
 * Aggressive Small Caps fetcher.
 * Port of OpenBB's YFAggressiveSmallCapsFetcher.
 */
export const YFAggressiveSmallCapsQueryParams = z.object({
  limit: z.number().int().min(1).max(1000).default(200),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export class YFAggressiveSmallCapsFetcher extends AbstractFetcher<
  typeof YFAggressiveSmallCapsQueryParams,
  typeof YFScreenerData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFAggressiveSmallCapsQueryParams>) {
    return { limit: params.limit ?? 200, sort: params.sort ?? "desc" };
  }

  async extractData(
    query: z.infer<typeof YFAggressiveSmallCapsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const data = await fetchScreener({
      offset: 0,
      size: 250,
      sortField: "totalrevenues1yrgrowth.lasttwelvemonths",
      sortType: "desc",
      quoteType: "equity",
      query: {
        operator: "and",
        operands: [
          { operator: "lt", operands: ["intradaymarketcap", 2000000000] },
          {
            operator: "or",
            operands: [
              { operator: "eq", operands: ["exchange", "NMS"] },
              { operator: "eq", operands: ["exchange", "NYQ"] },
            ],
          },
          { operator: "gt", operands: ["epsgrowth.lasttwelvemonths", 25] },
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
