import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECForm13FHRQueryParams = z.object({
  cik: z.string().min(1),
  count: z.coerce.number().int().min(1).max(100).default(10),
});

export const SECForm13FHRData = z.object({
  filingDate: z.string().nullish(),
  reportDate: z.string().nullish(),
  issuer: z.string().nullish(),
  cusip: z.string().nullish(),
  value: z.number().nullish(),
  shares: z.number().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECForm13FHRData = z.infer<typeof SECForm13FHRData>;

/**
 * Fetch 13F-HR institutional holdings filings from SEC.
 */
export class SECForm13FHRFetcher extends AbstractFetcher<
  typeof SECForm13FHRQueryParams,
  typeof SECForm13FHRData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECForm13FHRQueryParams>) {
    return {
      cik: params.cik.padStart(10, "0"),
      count: params.count ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof SECForm13FHRQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      action: "getcompany",
      CIK: query.cik,
      type: "13F-HR",
      count: String(query.count ?? 10),
      output: "atom",
    });
    return xml;
  }

  async transformData(raw: unknown) {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);
    if (entries.length === 0) throw new EmptyDataError("No 13F-HR filings found");

    return entries.map((entry) => {
      // Parse report date from summary
      const summary = entry.summary || "";
      const reportDateMatch = summary.match(/(\d{4}-\d{2}-\d{2})/);
      const reportDate = reportDateMatch ? reportDateMatch[1] : null;

      return SECForm13FHRData.parse({
        filingDate: entry.updated || null,
        reportDate,
        issuer: entry.title || null,
        cusip: null,
        value: null,
        shares: null,
      });
    });
  }
}
