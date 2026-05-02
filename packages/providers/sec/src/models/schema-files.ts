import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECSchemaFilesQueryParams = z.object({});

export const SECSchemaFilesData = z.object({
  url: z.string().nullish(),
  name: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECSchemaFilesData = z.infer<typeof SECSchemaFilesData>;

/**
 * List available SEC schema / taxonomy files.
 * Source: SEC EDGAR taxonomy directory.
 */
export class SECSchemaFilesFetcher extends AbstractFetcher<
  typeof SECSchemaFilesQueryParams,
  typeof SECSchemaFilesData
> {
  requireCredentials = false;

  async transformQuery(_params: z.input<typeof SECSchemaFilesQueryParams>) {
    return {};
  }

  async extractData(
    _query: z.infer<typeof SECSchemaFilesQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // Fetch SEC's taxonomy directory listing
    return secXmlFetch("/files/edgar/taxonomies.xml");
  }

  async transformData(raw: unknown) {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);

    const results: SECSchemaFilesData[] = [];

    for (const entry of entries) {
      results.push(
        SECSchemaFilesData.parse({
          url: entry.link || null,
          name: entry.title || null,
        }),
      );
    }

    // Parse remaining links
    let m: RegExpExecArray | null;
    const altLinkRegex = /<([a-zA-Z]+)[^>]*href=["']([^"']+\.[a-z]+)["']/gi;
    while ((m = altLinkRegex.exec(xml)) !== null) {
      const url = m[2];
      results.push(
        SECSchemaFilesData.parse({
          url,
          name: url?.split("/").pop() ?? url,
        }),
      );
    }

    if (results.length === 0) throw new EmptyDataError("No schema files found");
    return results;
  }
}
