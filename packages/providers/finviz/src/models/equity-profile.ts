import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchQuotePage, parseQuoteTable, parseNumber } from "../utils/api";

export const FinvizEquityProfileData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  country: z.string().nullish(),
  exchange: z.string().nullish(),
  marketCap: z.number().nullish(),
  employees: z.number().nullish(),
  beta: z.number().nullish(),
  dividendYield: z.number().nullish(),
  provider: z.literal("finviz").default("finviz"),
});

export type FinvizEquityProfileData = z.infer<typeof FinvizEquityProfileData>;

export const FinvizEquityProfileQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type FinvizEquityProfileQueryParams = z.infer<typeof FinvizEquityProfileQueryParams>;

/**
 * Fetcher for equity profile data from FinViz.
 */
export class FinvizEquityProfileFetcher extends AbstractFetcher<
  typeof FinvizEquityProfileQueryParams,
  typeof FinvizEquityProfileData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof FinvizEquityProfileQueryParams>,
  ): Promise<z.input<typeof FinvizEquityProfileQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof FinvizEquityProfileQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const html = await fetchQuotePage(query.symbol);
    if (!html.includes("snapshot-td2-cp")) {
      throw new EmptyDataError(`No profile data found for ${query.symbol}`);
    }
    return parseQuoteTable(html);
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof FinvizEquityProfileQueryParams>,
  ): Promise<FinvizEquityProfileData[]> {
    const data = raw as Record<string, string>;
    if (Object.keys(data).length === 0) {
      throw new EmptyDataError("No profile data parsed");
    }

    return [
      FinvizEquityProfileData.parse({
        symbol: query?.symbol ?? "UNKNOWN",
        name: data["Company"] ?? null,
        sector: data["Sector"] ?? null,
        industry: data["Industry"] ?? null,
        country: data["Country"] ?? null,
        exchange: data["Exchange"] ?? null,
        marketCap: parseNumber(data["Market Cap"]),
        employees: parseNumber(data["Employees"]),
        beta: parseNumber(data["Beta"]),
        dividendYield: parseNumber(data["Dividend %"]),
      }),
    ];
  }
}
