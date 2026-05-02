import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseFeedEntries } from "../utils/api";

export const SECRssLitigationQueryParams = z.object({
  count: z.coerce.number().int().min(1).max(100).default(20),
});

export const SECRssLitigationData = z.object({
  date: z.string().nullish(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECRssLitigationData = z.infer<typeof SECRssLitigationData>;

/**
 * Fetch SEC litigation releases RSS feed.
 * Source: /litigation/litreleases/litreleases.xml
 */
export class SECRssLitigationFetcher extends AbstractFetcher<
  typeof SECRssLitigationQueryParams,
  typeof SECRssLitigationData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECRssLitigationQueryParams>) {
    return { count: params.count ?? 20 };
  }

  async extractData(
    _query: z.infer<typeof SECRssLitigationQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return secXmlFetch("/litigation/litreleases/litreleases.xml");
  }

  async transformData(raw: unknown): Promise<SECRssLitigationData[]> {
    const xml = raw as string;
    const entries = parseFeedEntries(xml);

    // If feed parsing gave nothing, try item-level parsing (RSS format)
    let items = entries;
    if (items.length === 0) {
      const itemRegex = /<item>[\s\S]*?<\/item>/g;
      let m: RegExpExecArray | null;
      while ((m = itemRegex.exec(xml)) !== null) {
        const itemXml = m[0];
        const getField = (tag: string): string => {
          const fm = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
          return fm?.[1]?.trim() ?? "";
        };
        const linkMatch = itemXml.match(/<link[^>]*href=["']([^"']*)["']/i);
        items.push({
          title: getField("title"),
          link: linkMatch?.[1] ?? "",
          summary: getField("description"),
          updated: getField("pubDate"),
        });
      }
    }

    if (items.length === 0) throw new EmptyDataError("No litigation releases found");

    return items.slice(0, 20).map((item) =>
      SECRssLitigationData.parse({
        date: item.updated || null,
        title: item.title || null,
        url: item.link || null,
      }),
    );
  }
}
