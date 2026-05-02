import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { cftcFetch, parseCFTCReportCsv, type CFTCReportRow } from "../utils/api";

export const CFTCotFinancialQueryParams = z.object({
  marketName: z.string().optional(),
});

export const CFTCotFinancialData = z.object({
  marketName: z.string().nullish(),
  contractDate: z.string().nullish(),
  openInterest: z.number().nullish(),
  dealerLong: z.number().nullish(),
  dealerShort: z.number().nullish(),
  assetManagerLong: z.number().nullish(),
  assetManagerShort: z.number().nullish(),
  leveragedFundsLong: z.number().nullish(),
  leveragedFundsShort: z.number().nullish(),
  otherReportableLong: z.number().nullish(),
  otherReportableShort: z.number().nullish(),
  nonReportableLong: z.number().nullish(),
  nonReportableShort: z.number().nullish(),
  provider: z.literal("cftc").default("cftc"),
});

export type CFTCotFinancialData = z.infer<typeof CFTCotFinancialData>;

/**
 * Fetch the CFTC Financial Futures COT report.
 * This breaks down positions by trader type:
 * dealer/intermediary, asset manager, leveraged funds, and other reportables.
 */
export class CFTCotFinancialFetcher extends AbstractFetcher<
  typeof CFTCotFinancialQueryParams,
  typeof CFTCotFinancialData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof CFTCotFinancialQueryParams>) {
    return { marketName: params.marketName };
  }

  async extractData(
    _query: z.infer<typeof CFTCotFinancialQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return cftcFetch<string>("/fof.txt");
  }

  async transformData(raw: unknown): Promise<CFTCotFinancialData[]> {
    const csv = raw as string;
    const rows = parseCFTCReportCsv(csv);

    if (rows.length === 0) {
      throw new EmptyDataError("No financial COT data available");
    }

    return rows.map((r: CFTCReportRow) => {
      const toNum = (...keys: string[]): number | null => {
        for (const key of keys) {
          const val = r[key];
          if (val && val !== "" && val !== ".") {
            const n = parseInt(val.replace(/,/g, ""), 10);
            if (!isNaN(n)) return n;
          }
        }
        return null;
      };

      return CFTCotFinancialData.parse({
        marketName: r["Market and Exchange Names"] ?? r["Market Name"] ?? null,
        contractDate: r["As of Date"] ?? r["Report Date"] ?? null,
        openInterest: toNum("Open Interest", "Open Interest All"),
        dealerLong: toNum("Dealer Long", "Dealer/Intermediary Long"),
        dealerShort: toNum("Dealer Short", "Dealer/Intermediary Short"),
        assetManagerLong: toNum("Asset Mgr Long", "Asset Manager/Institutional Long"),
        assetManagerShort: toNum("Asset Mgr Short", "Asset Manager/Institutional Short"),
        leveragedFundsLong: toNum("Lev Money Long", "Leveraged Funds Long"),
        leveragedFundsShort: toNum("Lev Money Short", "Leveraged Funds Short"),
        otherReportableLong: toNum("Other Rept Long", "Other Reportable Long"),
        otherReportableShort: toNum("Other Rept Short", "Other Reportable Short"),
        nonReportableLong: toNum("Nonrept Long", "Nonreportable Long"),
        nonReportableShort: toNum("Nonrept Short", "Nonreportable Short"),
      });
    });
  }
}
