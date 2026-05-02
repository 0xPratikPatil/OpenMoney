import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchScreenerCsv, parseCsv, parseNumber } from "../utils/api";

export const FinvizEquityScreenerData = z.object({
  symbol: z.string(),
  company: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  volume: z.number().nullish(),
  marketCap: z.number().nullish(),
  pe: z.number().nullish(),
  forwardPe: z.number().nullish(),
  eps: z.number().nullish(),
  beta: z.number().nullish(),
  dividend: z.string().nullish(),
  provider: z.literal("finviz").default("finviz"),
});

export type FinvizEquityScreenerData = z.infer<typeof FinvizEquityScreenerData>;

export const FinvizEquityScreenerQueryParams = z.object({
  filters: z.string().optional(),
  limit: z.number().int().min(1).max(500).default(200),
});

export type FinvizEquityScreenerQueryParams = z.infer<typeof FinvizEquityScreenerQueryParams>;

/**
 * Fetcher for equity screener from FinViz.
 */
export class FinvizEquityScreenerFetcher extends AbstractFetcher<
  typeof FinvizEquityScreenerQueryParams,
  typeof FinvizEquityScreenerData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FinvizEquityScreenerQueryParams>,
  ): Promise<z.input<typeof FinvizEquityScreenerQueryParams>> {
    return { filters: params.filters, limit: params.limit ?? 200 };
  }

  async extractData(
    query: z.infer<typeof FinvizEquityScreenerQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const params: Record<string, string> = {
      t: query.filters ?? "",
      o: "-change",
      c: "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111",
    };

    const csv = await fetchScreenerCsv(params);
    return parseCsv(csv);
  }

  async transformData(
    raw: unknown,
  ): Promise<FinvizEquityScreenerData[]> {
    const records = raw as Array<Record<string, string>>;
    if (records.length === 0) throw new EmptyDataError("No screener results found");

    return records.map((r) => {
      return FinvizEquityScreenerData.parse({
        symbol: r["Ticker"] ?? "UNKNOWN",
        company: r["Company"] ?? null,
        sector: r["Sector"] ?? null,
        industry: r["Industry"] ?? null,
        price: parseNumber(r["Price"]),
        change: parseNumber(r["Change"]),
        volume: parseNumber(r["Volume"]),
        marketCap: parseNumber(r["Market Cap"]),
        pe: parseNumber(r["P/E"]),
        forwardPe: parseNumber(r["Fwd P/E"]),
        eps: parseNumber(r["EPS (ttm)"]),
        beta: parseNumber(r["Beta"]),
        dividend: r["Dividend"] ?? null,
      });
    });
  }
}
