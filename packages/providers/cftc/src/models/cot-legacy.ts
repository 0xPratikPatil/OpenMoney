import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { cftcFetch, parseCFTCReportCsv, type CFTCReportRow } from "../utils/api";

export const CFTCotLegacyQueryParams = z.object({
  marketName: z.string().optional(),
});

export const CFTCotLegacyData = z.object({
  marketName: z.string().nullish(),
  contractDate: z.string().nullish(),
  openInterest: z.number().nullish(),
  nonCommercialLong: z.number().nullish(),
  nonCommercialShort: z.number().nullish(),
  commercialLong: z.number().nullish(),
  commercialShort: z.number().nullish(),
  nonReportableLong: z.number().nullish(),
  nonReportableShort: z.number().nullish(),
  changeInOpenInterest: z.number().nullish(),
  contractUnits: z.string().nullish(),
  provider: z.literal("cftc").default("cftc"),
});

export type CFTCotLegacyData = z.infer<typeof CFTCotLegacyData>;

/**
 * Fetch the legacy (traditional) CFTC Commitments of Traders report.
 * Contains detailed data on futures only, with commercial / non-commercial breakdown.
 */
export class CFTCotLegacyFetcher extends AbstractFetcher<
  typeof CFTCotLegacyQueryParams,
  typeof CFTCotLegacyData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof CFTCotLegacyQueryParams>) {
    return { marketName: params.marketName };
  }

  async extractData(
    _query: z.infer<typeof CFTCotLegacyQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return cftcFetch<string>("/cot.txt");
  }

  async transformData(raw: unknown): Promise<CFTCotLegacyData[]> {
    const csv = raw as string;
    const rows = parseCFTCReportCsv(csv);

    if (rows.length === 0) {
      throw new EmptyDataError("No legacy COT data available");
    }

    return rows.map((r: CFTCReportRow) => {
      const toNum = (key: string): number | null => {
        const val = r[key];
        if (!val || val === "" || val === ".") return null;
        const n = parseInt(val.replace(/,/g, ""), 10);
        return isNaN(n) ? null : n;
      };

      return CFTCotLegacyData.parse({
        marketName: r["Market and Exchange Names"] ?? r["Market Name"] ?? null,
        contractDate: r["As of Date"] ?? r["Report Date"] ?? null,
        openInterest: toNum("Open Interest") ?? toNum("Open Interest All"),
        nonCommercialLong: toNum("Noncommercial Long") ?? toNum("Non-Commercial Long"),
        nonCommercialShort: toNum("Noncommercial Short") ?? toNum("Non-Commercial Short"),
        commercialLong: toNum("Commercial Long"),
        commercialShort: toNum("Commercial Short"),
        nonReportableLong: toNum("Nonreportable Long"),
        nonReportableShort: toNum("Nonreportable Short"),
        changeInOpenInterest: toNum("Change in Open Interest"),
        contractUnits: r["Contract Units"] ?? null,
      });
    });
  }
}
