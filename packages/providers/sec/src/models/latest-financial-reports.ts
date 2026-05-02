import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secJsonFetch } from "../utils/api";

export const SECLatestFinancialReportsQueryParams = z.object({
  cik: z.string().min(1),
});

export const SECLatestFinancialReportsData = z.object({
  date: z.string().nullish(),
  formType: z.string().nullish(),
  netIncome: z.number().nullish(),
  revenue: z.number().nullish(),
  assets: z.number().nullish(),
  liabilities: z.number().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECLatestFinancialReportsData = z.infer<typeof SECLatestFinancialReportsData>;

/**
 * Fetch latest financial reports from SEC company facts XBRL data.
 */
export class SECLatestFinancialReportsFetcher extends AbstractFetcher<
  typeof SECLatestFinancialReportsQueryParams,
  typeof SECLatestFinancialReportsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECLatestFinancialReportsQueryParams>) {
    const cik = params.cik.padStart(10, "0");
    return { cik };
  }

  async extractData(
    query: z.infer<typeof SECLatestFinancialReportsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const cik = query.cik.padStart(10, "0");
    return secJsonFetch<Record<string, unknown>>(`/api/xbrl/companyfacts/CIK${cik}.json`);
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const facts = (data as any)?.facts?.["us-gaap"];
    if (!facts) throw new EmptyDataError("No financial report data available");

    const getLatestValue = (factName: string): { value: number | null; date: string | null } => {
      const fact = facts[factName];
      if (!fact?.units) return { value: null, date: null };
      const units = fact.units as Record<string, unknown>;
      const unitKey = Object.keys(units)[0];
      if (!unitKey) return { value: null, date: null };
      const values = (units[unitKey] as Array<Record<string, unknown>>) ?? [];
      if (values.length === 0) return { value: null, date: null };
      const latest = values[values.length - 1];
      if (!latest) return { value: null, date: null };
      return {
        value: (latest.val as number) ?? null,
        date: (latest.end as string) ?? (latest.filed as string) ?? null,
      };
    };

    const netIncome = getLatestValue("NetIncomeLoss");
    const revenue = getLatestValue("Revenues");
    const assets = getLatestValue("Assets");
    const liabilities = getLatestValue("Liabilities");

    // Get the latest filing date
    const allDates = [
      netIncome.date,
      revenue.date,
      assets.date,
      liabilities.date,
    ].filter(Boolean) as string[];
    const latestDate = allDates.sort().reverse()[0] ?? null;

    return [
      SECLatestFinancialReportsData.parse({
        date: latestDate,
        formType: null,
        netIncome: netIncome.value,
        revenue: revenue.value,
        assets: assets.value,
        liabilities: liabilities.value,
      }),
    ];
  }
}
