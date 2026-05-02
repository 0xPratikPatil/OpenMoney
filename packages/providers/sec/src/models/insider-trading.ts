import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECInsiderTradingQueryParams = z.object({
  cik: z.string().min(1),
  count: z.coerce.number().int().min(1).max(100).default(10),
});

export const SECInsiderTradingData = z.object({
  date: z.string().nullish(),
  insider: z.string().nullish(),
  relationship: z.string().nullish(),
  transactionType: z.string().nullish(),
  shares: z.number().nullish(),
  price: z.number().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECInsiderTradingData = z.infer<typeof SECInsiderTradingData>;

/**
 * Fetch insider trading filings (Form 4) from SEC EDGAR.
 */
export class SECInsiderTradingFetcher extends AbstractFetcher<
  typeof SECInsiderTradingQueryParams,
  typeof SECInsiderTradingData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECInsiderTradingQueryParams>) {
    return {
      cik: params.cik.padStart(10, "0"),
      count: params.count ?? 10,
    };
  }

  async extractData(
    query: z.infer<typeof SECInsiderTradingQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      action: "getcompany",
      CIK: query.cik,
      type: "4",
      count: String(query.count ?? 10),
      output: "atom",
    });
    return xml;
  }

  async transformData(raw: unknown) {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);
    if (entries.length === 0) throw new EmptyDataError("No insider trading filings found");

    return entries.map((entry) => {
      const summary = entry.summary || "";

      // Parse transaction details from summary
      const transactionMatch = summary.match(/transaction\s*(type|kind)[:\s]+(\w+)/i);
      const sharesMatch = summary.match(/(\d[\d,]*)\s*shares/i);
      const priceMatch = summary.match(/\$(\d+\.?\d*)/);

      // Parse insider name
      const insiderMatch = entry.title.match(/(.+?)\s*-\s*Form 4/i);

      return SECInsiderTradingData.parse({
        date: entry.updated || null,
        insider: insiderMatch?.[1]?.trim() ?? entry.title ?? null,
        relationship: null,
        transactionType: transactionMatch?.[2] ?? null,
        shares: sharesMatch?.[1] ? parseInt(sharesMatch[1].replace(/,/g, ""), 10) : null,
        price: priceMatch?.[1] ? parseFloat(priceMatch[1]) : null,
      });
    });
  }
}
