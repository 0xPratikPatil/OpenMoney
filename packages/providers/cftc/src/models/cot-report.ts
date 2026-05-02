import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { cftcFetch, parseCFTCReportCsv, type CFTCReportRow } from "../utils/api";

/**
 * Query params for the Commitments of Traders report.
 */
export const CFTCotReportQueryParams = z.object({
  reportType: z.enum(["legacy", "financial", "disaggregated", "traders"]).optional().default("legacy"),
});

/**
 * Standardized COT report data row.
 */
export const CFTCotReportData = z.object({
  marketName: z.string().nullish(),
  contractDate: z.string().nullish(),
  openInterest: z.number().nullish(),
  nonCommercialLong: z.number().nullish(),
  nonCommercialShort: z.number().nullish(),
  commercialLong: z.number().nullish(),
  commercialShort: z.number().nullish(),
  totalReportableLong: z.number().nullish(),
  totalReportableShort: z.number().nullish(),
  nonReportableLong: z.number().nullish(),
  nonReportableShort: z.number().nullish(),
  changeInOpenInterest: z.number().nullish(),
  provider: z.literal("cftc").default("cftc"),
});

export type CFTCotReportData = z.infer<typeof CFTCotReportData>;

/**
 * Fetch the Commitments of Traders report from CFTC.
 * Default report is the legacy format covering all futures markets.
 */
export class CFTCotReportFetcher extends AbstractFetcher<
  typeof CFTCotReportQueryParams,
  typeof CFTCotReportData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof CFTCotReportQueryParams>) {
    return { reportType: params.reportType ?? "legacy" };
  }

  async extractData(
    query: z.infer<typeof CFTCotReportQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    let path: string;
    switch (query.reportType) {
      case "financial":
        path = "/fof.txt";
        break;
      case "disaggregated":
        path = "/disaggregated.txt";
        break;
      case "traders":
        path = "/tff.txt";
        break;
      default:
        path = "/cot.txt";
    }
    return cftcFetch<string>(path);
  }

  async transformData(raw: unknown): Promise<CFTCotReportData[]> {
    const csv = raw as string;
    const rows = parseCFTCReportCsv(csv);

    if (rows.length === 0) {
      throw new EmptyDataError("No COT report data available");
    }

    return rows.map((r: CFTCReportRow) => {
      const toNum = (key: string, altKeys?: string[]): number | null => {
        const val = r[key] ?? (altKeys ? altKeys.map((k) => r[k]).find((v) => v !== undefined) : undefined);
        if (!val || val === "" || val === ".") return null;
        const n = parseInt(val.replace(/,/g, ""), 10);
        return isNaN(n) ? null : n;
      };

      return CFTCotReportData.parse({
        marketName: r["Market and Exchange Names"] ?? r["Market Name"] ?? null,
        contractDate: r["As of Date"] ?? r["Report Date"] ?? null,
        openInterest: toNum("Open Interest") ?? toNum("Open Interest All"),
        nonCommercialLong: toNum("Noncommercial Long") ?? toNum("Non-Commercial Long") ?? toNum("Nonreportable Long"),
        nonCommercialShort: toNum("Noncommercial Short") ?? toNum("Non-Commercial Short"),
        commercialLong: toNum("Commercial Long"),
        commercialShort: toNum("Commercial Short"),
        totalReportableLong: toNum("Total Reportable Long"),
        totalReportableShort: toNum("Total Reportable Short"),
        nonReportableLong: toNum("Nonreportable Long"),
        nonReportableShort: toNum("Nonreportable Short"),
        changeInOpenInterest: toNum("Change in Open Interest"),
      });
    });
  }
}
