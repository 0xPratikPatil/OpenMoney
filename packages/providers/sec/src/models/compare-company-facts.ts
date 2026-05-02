import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secJsonFetch } from "../utils/api";

export const SECCompareCompanyFactsQueryParams = z.object({
  cik: z.string().min(1),
});

export const SECCompareCompanyFactsData = z.object({
  fact: z.string(),
  label: z.string().nullish(),
  unit: z.string().nullish(),
  value: z.number().nullish(),
  date: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECCompareCompanyFactsData = z.infer<typeof SECCompareCompanyFactsData>;

/**
 * Fetch company facts XBRL data from SEC.
 * Maps to: /api/xbrl/companyfacts/CIK{cik}.json
 */
export class SECCompareCompanyFactsFetcher extends AbstractFetcher<
  typeof SECCompareCompanyFactsQueryParams,
  typeof SECCompareCompanyFactsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECCompareCompanyFactsQueryParams>) {
    const cik = params.cik.padStart(10, "0");
    return { cik };
  }

  async extractData(
    query: z.infer<typeof SECCompareCompanyFactsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const cik = query.cik.padStart(10, "0");
    return secJsonFetch<Record<string, unknown>>(`/api/xbrl/companyfacts/CIK${cik}.json`);
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const facts = (data as any)?.facts;
    if (!facts) throw new EmptyDataError("No company facts available");

    const results: SECCompareCompanyFactsData[] = [];
    const usGaap = facts["us-gaap"] as Record<string, unknown> | undefined;
    const ifrs = facts["ifrs-full"] as Record<string, unknown> | undefined;

    const processFacts = (factObj: Record<string, unknown>, _prefix: string) => {
      for (const [factName, factValue] of Object.entries(factObj)) {
        if (typeof factValue !== "object" || factValue === null) continue;
        const units = (factValue as Record<string, unknown>).units as Record<string, unknown> | undefined;
        if (!units) continue;
        for (const [unit, values] of Object.entries(units)) {
          if (!Array.isArray(values)) continue;
          for (const entry of values as Array<Record<string, unknown>>) {
            results.push(
              SECCompareCompanyFactsData.parse({
                fact: factName,
                label: (factValue as Record<string, unknown>).label as string ?? null,
                unit,
                value: typeof entry.val === "number" ? entry.val : null,
                date: (entry.end as string) ?? (entry.filed as string) ?? null,
              }),
            );
          }
        }
      }
    };

    if (usGaap) processFacts(usGaap, "us-gaap");
    if (ifrs) processFacts(ifrs, "ifrs-full");

    if (results.length === 0) throw new EmptyDataError("No facts data available");
    return results;
  }
}
