import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secFetch } from "../utils/api";

export const SECSicSearchQueryParams = z.object({
  query: z.string().min(1),
});

export const SECSicSearchData = z.object({
  code: z.string().nullish(),
  name: z.string().nullish(),
  office: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECSicSearchData = z.infer<typeof SECSicSearchData>;

/**
 * Search SEC SIC codes for industry classification.
 * Source: SEC SIC code list.
 */
export class SECSicSearchFetcher extends AbstractFetcher<
  typeof SECSicSearchQueryParams,
  typeof SECSicSearchData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECSicSearchQueryParams>) {
    return { query: params.query };
  }

  async extractData(
    query: z.infer<typeof SECSicSearchQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // SEC SIC code listing
    return secFetch<string>(`/cgi-bin/browse-edgar?action=getcompany&SIC=${encodeURIComponent(query.query)}&owner=exclude&count=1`);
  }

  async transformData(raw: unknown) {
    const html = raw as string;

    // Parse SIC info from the SEC page
    const entries: Array<{ code: string | null; name: string | null; office: string | null }> = [];

    // Try to find SIC description boxes
    const sicBlocks = html.match(/<[^>]*sic[^>]*>[\s\S]*?<\/[^>]*>/gi) ?? [];
    for (const block of sicBlocks) {
      const codeMatch = block.match(/(\d{4})\s*[–-]\s*([^<]+)/);
      const divMatch = block.match(/division[:\s]*([^<]+)/i);

      if (codeMatch) {
        entries.push({
          code: codeMatch[1] ?? null,
          name: codeMatch[2]?.trim() ?? null,
          office: divMatch?.[1]?.trim() ?? null,
        });
      }
    }

    if (entries.length === 0) throw new EmptyDataError("No SIC codes found");
    return entries.map((e) => SECSicSearchData.parse(e));
  }
}
