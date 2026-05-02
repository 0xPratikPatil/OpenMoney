import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseCIKFromResponse } from "../utils/api";

export const SECCikMapQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
});

export const SECCikMapData = z.object({
  symbol: z.string(),
  cik: z.string(),
  name: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECCikMapData = z.infer<typeof SECCikMapData>;

/**
 * Map ticker symbol to SEC CIK number.
 * Fetches from SEC browse-edgar and parses the CIK from the response.
 */
export class SECCikMapFetcher extends AbstractFetcher<
  typeof SECCikMapQueryParams,
  typeof SECCikMapData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECCikMapQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof SECCikMapQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      CIK: query.symbol,
      action: "getcompany",
      owner: "exclude",
      count: "1",
      output: "atom",
    });
    if (!xml || xml.length < 50) throw new EmptyDataError(`No CIK found for ${query.symbol}`);
    return xml;
  }

  async transformData(raw: unknown) {
    const xml = raw as string;
    // Try to find company name
    const nameMatch = xml.match(/<companyname[^>]*>([\s\S]*?)<\/companyname>/i);
    const name = nameMatch?.[1]?.trim() ?? null;

    // Extract CIK from the XML
    const cikMatch = xml.match(/<cik[^>]*>(\d+)<\/cik>/i);
    const cik = cikMatch?.[1]?.padStart(10, "0") ?? parseCIKFromResponse(xml, "");

    if (!cik) throw new EmptyDataError("Could not extract CIK from SEC response");

    return [
      SECCikMapData.parse({
        symbol: "",
        cik,
        name,
      }),
    ];
  }
}
