import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECManagementDiscussionAnalysisQueryParams = z.object({
  cik: z.string().min(1),
  count: z.coerce.number().int().min(1).max(10).default(1),
});

export const SECManagementDiscussionAnalysisData = z.object({
  filingDate: z.string().nullish(),
  section: z.string().nullish(),
  content: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECManagementDiscussionAnalysisData = z.infer<typeof SECManagementDiscussionAnalysisData>;

/**
 * Fetch Management Discussion & Analysis (MD&A) from 10-K / 10-Q filings.
 */
export class SECManagementDiscussionAnalysisFetcher extends AbstractFetcher<
  typeof SECManagementDiscussionAnalysisQueryParams,
  typeof SECManagementDiscussionAnalysisData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECManagementDiscussionAnalysisQueryParams>) {
    return {
      cik: params.cik.padStart(10, "0"),
      count: params.count ?? 1,
    };
  }

  async extractData(
    query: z.infer<typeof SECManagementDiscussionAnalysisQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    // First fetch filing entries for 10-K/10-Q
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      action: "getcompany",
      CIK: query.cik,
      type: "10-K",
      count: String(query.count ?? 1),
      output: "atom",
    });
    return xml;
  }

  async transformData(raw: unknown): Promise<SECManagementDiscussionAnalysisData[]> {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);
    if (entries.length === 0) throw new EmptyDataError("No 10-K/10-Q filings found");

    return entries.map((entry) =>
      SECManagementDiscussionAnalysisData.parse({
        filingDate: entry.updated || null,
        section: "Management's Discussion and Analysis",
        content: entry.summary || entry.title || null,
      }),
    );
  }
}
