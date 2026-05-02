import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secXmlFetch, parseCIKFromResponse } from "../utils/api";

export const SECSymbolMapQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
});

export const SECSymbolMapData = z.object({
  symbol: z.string(),
  cik: z.string(),
  name: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECSymbolMapData = z.infer<typeof SECSymbolMapData>;

/**
 * Map stock ticker symbol to SEC CIK number.
 * Similar to cik-map but returns full mapping info.
 */
export class SECSymbolMapFetcher extends AbstractFetcher<
  typeof SECSymbolMapQueryParams,
  typeof SECSymbolMapData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECSymbolMapQueryParams>) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof SECSymbolMapQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const xml = await secXmlFetch("/cgi-bin/browse-edgar", {
      CIK: query.symbol,
      action: "getcompany",
      owner: "exclude",
      count: "1",
      output: "atom",
    });
    if (!xml || xml.length < 50) throw new EmptyDataError(`No mapping found for ${query.symbol}`);
    return xml;
  }

  async transformData(raw: unknown) {
    const xml = raw as string;

    const extract = (tag: string): string | null => {
      const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m?.[1]?.trim() ?? null;
    };

    const cik = parseCIKFromResponse(xml, "");
    const name = extract("companyname") ?? extract("title");

    if (!cik) throw new EmptyDataError("Could not extract CIK from SEC response");

    return [
      SECSymbolMapData.parse({
        symbol: "",
        cik,
        name,
      }),
    ];
  }
}
