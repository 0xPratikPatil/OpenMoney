import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchSymbolDirectory } from "../utils/api";

export const CboeEquitySearchData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  type: z.string().nullish(),
  exchange: z.string().nullish(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeEquitySearchData = z.infer<typeof CboeEquitySearchData>;

export const CboeEquitySearchQueryParams = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().int().min(1).max(500).default(50),
});

export type CboeEquitySearchQueryParams = z.infer<typeof CboeEquitySearchQueryParams>;

/**
 * Parse CSV line into fields, handling quoted values.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Fetcher for equity/option symbol search from CBOE directory.
 */
export class CboeEquitySearchFetcher extends AbstractFetcher<
  typeof CboeEquitySearchQueryParams,
  typeof CboeEquitySearchData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeEquitySearchQueryParams>,
  ): Promise<z.input<typeof CboeEquitySearchQueryParams>> {
    return { query: params.query.toUpperCase(), limit: params.limit ?? 50 };
  }

  async extractData(
    _query: z.infer<typeof CboeEquitySearchQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const csv = await fetchSymbolDirectory();
    const lines = csv.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length < 2) throw new EmptyDataError("No symbol directory data");

    // Parse header
    const header = parseCsvLine(lines[0]!);
    const records: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]!);
      if (fields.length >= 2) {
        const record: Record<string, string> = {};
        for (let j = 0; j < header.length && j < fields.length; j++) {
          record[header[j]!.toLowerCase()] = fields[j]!;
        }
        records.push(record);
      }
    }

    return records;
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof CboeEquitySearchQueryParams>,
  ): Promise<CboeEquitySearchData[]> {
    const records = raw as Array<Record<string, string>>;
    const searchQuery = query?.query?.toUpperCase() ?? "";
    const limit = query?.limit ?? 50;

    const filtered = records.filter(
      (r) =>
        (r.symbol && r.symbol.toUpperCase().includes(searchQuery)) ||
        (r.company_name ?? r.name ?? "").toUpperCase().includes(searchQuery),
    );

    if (filtered.length === 0) throw new EmptyDataError("No matching symbols found");

    return filtered.slice(0, limit).map((r) =>
      CboeEquitySearchData.parse({
        symbol: r.symbol ?? r.Symbol,
        name: r.company_name ?? r.name ?? r.CompanyName ?? null,
        type: r.security_type ?? r.type ?? null,
        exchange: r.exchange ?? null,
      }),
    );
  }
}
