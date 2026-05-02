import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECInstitutionsSearchQueryParams = z.object({
  query: z.string().min(1),
  count: z.coerce.number().int().min(1).max(100).default(20),
});

export const SECInstitutionsSearchData = z.object({
  name: z.string().nullish(),
  cik: z.string().nullish(),
  address: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECInstitutionsSearchData = z.infer<typeof SECInstitutionsSearchData>;

/**
 * Search for institutional investment managers on SEC EDGAR.
 */
export class SECInstitutionsSearchFetcher extends AbstractFetcher<
  typeof SECInstitutionsSearchQueryParams,
  typeof SECInstitutionsSearchData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECInstitutionsSearchQueryParams>) {
    return {
      query: params.query,
      count: params.count ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof SECInstitutionsSearchQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      action: "getcompany",
      CIK: query.query,
      output: "atom",
      count: String(query.count ?? 20),
    });
    return xml;
  }

  async transformData(raw: unknown): Promise<SECInstitutionsSearchData[]> {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);
    if (entries.length === 0) throw new EmptyDataError("No institutions found");

    return entries.map((entry) => {
      const cikMatch = entry.link?.match(/CIK=(\d{10})/) ?? null;
      const addressMatch = (entry.summary ?? "").match(/address[:\s]+(.+)/i);

      return SECInstitutionsSearchData.parse({
        name: entry.title || null,
        cik: cikMatch?.[1] ?? null,
        address: addressMatch?.[1]?.trim() ?? null,
      });
    });
  }
}
