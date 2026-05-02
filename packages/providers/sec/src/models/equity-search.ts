import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch } from "../utils/api";

export const SECEquitySearchQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
});

export const SECEquitySearchData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  cik: z.string().nullish(),
  sic: z.string().nullish(),
  sector: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECEquitySearchData = z.infer<typeof SECEquitySearchData>;

/**
 * Search for company information on SEC EDGAR by ticker.
 */
export class SECEquitySearchFetcher extends AbstractFetcher<
  typeof SECEquitySearchQueryParams,
  typeof SECEquitySearchData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECEquitySearchQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof SECEquitySearchQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      action: "getcompany",
      CIK: query.symbol,
      output: "atom",
    });
    return xml;
  }

  async transformData(raw: unknown): Promise<SECEquitySearchData[]> {
    const xml = raw as string;

    const extract = (tag: string): string | null => {
      const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m?.[1]?.trim() ?? null;
    };

    const name = extract("companyname") ?? extract("title");
    const cikMatch = xml.match(/CIK=(\d{10})/);
    const cik = cikMatch?.[1] ?? null;

    // SIC and sector info in company-info section
    const sicMatch = xml.match(/SIC=(\d+)/);
    const sic = sicMatch ? sicMatch[1] : null;

    // Sector from SIC classification (approximate)
    const sectorMatch = xml.match(/<assistant[^>]*>([\s\S]*?)<\/assistant>/i);
    const sector = sectorMatch?.[1]?.trim() ?? null;

    if (!cik) throw new EmptyDataError("Company not found on SEC EDGAR");

    return [
      SECEquitySearchData.parse({
        symbol: "",
        name,
        cik,
        sic,
        sector,
      }),
    ];
  }
}
