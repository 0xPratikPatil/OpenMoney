import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secFetch } from "../utils/api";

export const SECHtmFileQueryParams = z.object({
  url: z.string().url(),
});

export const SECHtmFileData = z.object({
  url: z.string(),
  content: z.string(),
  provider: z.literal("sec").default("sec"),
});

export type SECHtmFileData = z.infer<typeof SECHtmFileData>;

/**
 * Fetch and return raw HTML filing content from SEC.
 */
export class SECHtmFileFetcher extends AbstractFetcher<
  typeof SECHtmFileQueryParams,
  typeof SECHtmFileData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECHtmFileQueryParams>) {
    return { url: params.url };
  }

  async extractData(
    query: z.infer<typeof SECHtmFileQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const content = await secFetch<string>(query.url);
    if (!content || content.length < 100) throw new EmptyDataError("Empty or invalid HTM content");
    return content;
  }

  async transformData(raw: unknown) {
    const content = raw as string;
    return [
      SECHtmFileData.parse({
        url: "",
        content,
      }),
    ];
  }
}
