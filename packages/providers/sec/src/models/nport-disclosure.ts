import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECNportDisclosureQueryParams = z.object({
  cik: z.string().min(1),
  count: z.coerce.number().int().min(1).max(50).default(10),
});

export const SECNportDisclosureData = z.object({
  reportDate: z.string().nullish(),
  fund: z.string().nullish(),
  holdings: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECNportDisclosureData = z.infer<typeof SECNportDisclosureData>;

/**
 * Fetch Form N-PORT portfolio holdings disclosures from SEC.
 */
export class SECNportDisclosureFetcher extends AbstractFetcher<
  typeof SECNportDisclosureQueryParams,
  typeof SECNportDisclosureData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECNportDisclosureQueryParams>) {
    return {
      cik: params.cik.padStart(10, "0"),
      count: params.count ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof SECNportDisclosureQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      action: "getcompany",
      CIK: query.cik,
      type: "N-PORT",
      count: String(query.count ?? 10),
      output: "atom",
    });
    return xml;
  }

  async transformData(raw: unknown) {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);
    if (entries.length === 0) throw new EmptyDataError("No N-PORT filings found");

    return entries.map((entry) => {
      const reportDateMatch = (entry.summary ?? "").match(/(\d{4}-\d{2}-\d{2})/);
      const fundName = entry.title || null;

      return SECNportDisclosureData.parse({
        reportDate: reportDateMatch ? reportDateMatch[1] : null,
        fund: fundName,
        holdings: entry.summary || null,
      });
    });
  }
}
