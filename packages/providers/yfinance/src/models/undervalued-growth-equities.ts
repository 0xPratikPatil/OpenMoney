import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { YFScreenerData, mapScreenerQuote } from "./screener";
import { fetchScreener } from "../utils/api";

/**
 * Undervalued Growth Equities fetcher.
 * Port of OpenBB's YFUndervaluedGrowthEquitiesFetcher.
 */
export const YFUndervaluedGrowthEquitiesQueryParams = z.object({
  limit: z.number().int().min(1).max(1000).default(200),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export class YFUndervaluedGrowthEquitiesFetcher extends AbstractFetcher<
  typeof YFUndervaluedGrowthEquitiesQueryParams,
  typeof YFScreenerData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFUndervaluedGrowthEquitiesQueryParams>) {
    return { limit: params.limit ?? 200, sort: params.sort ?? "desc" };
  }

  async extractData(
    query: z.infer<typeof YFUndervaluedGrowthEquitiesQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const data = await fetchScreener({
      offset: 0,
      size: 250,
      sortField: "eodvolume",
      sortType: "desc",
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
  ) {
    const quotes = raw as any[];
    if (quotes.length === 0) throw new EmptyDataError();
    return quotes.map((q) => YFScreenerData.parse(mapScreenerQuote(q)));
  }
}
