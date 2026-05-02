import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { YFScreenerData, mapScreenerQuote } from "./screener";
import { fetchScreener } from "../utils/api";

/**
 * Full custom equity screener.
 * Port of OpenBB's YFinanceEquityScreenerFetcher.
 */
export const YFinanceEquityScreenerQueryParams = z.object({
  country: z.string().optional(),
  exchange: z.string().optional(),
  sector: z.string().optional(),
  industry: z.string().optional(),
  mktcap_min: z.number().int().default(500000000),
  mktcap_max: z.number().int().optional(),
  price_min: z.number().default(5),
  price_max: z.number().optional(),
  volume_min: z.number().int().default(10000),
  volume_max: z.number().int().optional(),
  beta_min: z.number().optional(),
  beta_max: z.number().optional(),
  limit: z.number().int().min(1).max(1000).default(200),
});

export class YFinanceEquityScreenerFetcher extends AbstractFetcher<
  typeof YFinanceEquityScreenerQueryParams,
  typeof YFScreenerData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof YFinanceEquityScreenerQueryParams>) {
    return { ...params, limit: params.limit ?? 200 };
  }

  async extractData(
    query: z.infer<typeof YFinanceEquityScreenerQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const operands: any[] = [];

    if (query.exchange) {
      operands.push({ operator: "eq", operands: ["exchange", query.exchange.toUpperCase()] });
    }
    if (query.country && query.country !== "all") {
      operands.push({ operator: "EQ", operands: ["region", query.country] });
    }
    if (query.sector) {
      operands.push({ operator: "EQ", operands: ["sector", query.sector] });
    }
    if (query.industry) {
      operands.push({ operator: "EQ", operands: ["industry", query.industry] });
    }
    if (query.mktcap_min != null) {
      operands.push({ operator: "gt", operands: ["intradaymarketcap", query.mktcap_min] });
    }
    if (query.mktcap_max != null) {
      operands.push({ operator: "lt", operands: ["intradaymarketcap", query.mktcap_max] });
    }
    if (query.price_min != null) {
      operands.push({ operator: "gt", operands: ["intradayprice", query.price_min] });
    }
    if (query.price_max != null) {
      operands.push({ operator: "lt", operands: ["intradayprice", query.price_max] });
    }
    if (query.volume_min != null) {
      operands.push({ operator: "gt", operands: ["dayvolume", query.volume_min] });
    }
    if (query.volume_max != null) {
      operands.push({ operator: "lt", operands: ["dayvolume", query.volume_max] });
    }
    if (query.beta_min != null) {
      operands.push({ operator: "gt", operands: ["beta", query.beta_min] });
    }
    if (query.beta_max != null) {
      operands.push({ operator: "lt", operands: ["beta", query.beta_max] });
    }

    const payload = {
      offset: 0,
      size: 100,
      sortField: "percentchange",
      sortType: "DESC",
      quoteType: "EQUITY",
      query: {
        operands,
        operator: "AND",
      },
      userId: "",
      userIdType: "guid",
    };

    const data = await fetchScreener(payload, query.limit);
    if (data.length === 0) throw new EmptyDataError("No results found for the combination of filters.");
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
