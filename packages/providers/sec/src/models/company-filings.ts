import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECCompanyFilingsQueryParams = z.object({
  cik: z.string().min(1),
  formType: z.string().optional().default("10-K"),
  count: z.coerce.number().int().min(1).max(100).default(10),
});

export const SECCompanyFilingsData = z.object({
  filingDate: z.string().nullish(),
  formType: z.string().nullish(),
  description: z.string().nullish(),
  url: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECCompanyFilingsData = z.infer<typeof SECCompanyFilingsData>;

/**
 * Fetch company filings from SEC EDGAR browse-edgar Atom feed.
 */
export class SECCompanyFilingsFetcher extends AbstractFetcher<
  typeof SECCompanyFilingsQueryParams,
  typeof SECCompanyFilingsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECCompanyFilingsQueryParams>) {
    return {
      cik: params.cik,
      formType: params.formType ?? "10-K",
      count: params.count ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof SECCompanyFilingsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      action: "getcompany",
      CIK: query.cik,
      type: query.formType ?? "10-K",
      count: String(query.count ?? 10),
      output: "atom",
    });
    return xml;
  }

  async transformData(raw: unknown): Promise<SECCompanyFilingsData[]> {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);
    if (entries.length === 0) throw new EmptyDataError("No filings found");

    return entries.map((entry) =>
      SECCompanyFilingsData.parse({
        filingDate: entry.updated || null,
        formType: entry.category || null,
        description: entry.title || null,
        url: entry.link || null,
      }),
    );
  }
}
