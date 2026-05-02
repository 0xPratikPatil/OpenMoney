import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { secFetch } from "../utils/api";

export const SECSecFilingQueryParams = z.object({
  accession: z.string().min(1),
});

export const SECSecFilingData = z.object({
  filingDate: z.string().nullish(),
  formType: z.string().nullish(),
  content: z.string().nullish(),
  provider: z.literal("sec").default("sec"),
});

export type SECSecFilingData = z.infer<typeof SECSecFilingData>;

/**
 * Fetch any SEC filing by accession number.
 * Accession format: 0000950170-22-000123 (or raw CIK + filing group)
 */
export class SECSecFilingFetcher extends AbstractFetcher<
  typeof SECSecFilingQueryParams,
  typeof SECSecFilingData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof SECSecFilingQueryParams>) {
    return { accession: params.accession };
  }

  async extractData(
    query: z.infer<typeof SECSecFilingQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // Parse accession number into CIK components for EDGAR URL
    const accession = query.accession;
    const parts = accession.split("-");
    if (parts.length < 3) {
      // Try direct accession URL format
      return secFetch<string>(
        `/Archives/edgar/data/${accession.replace(/-/g, "")}/${accession}.txt`,
      );
    }

    const cik0 = parts[0]?.replace(/^0+/, "") ?? ""; // Strip leading zeros
    const filename = `${accession}.txt`;
    const path = `/Archives/edgar/data/${cik0}/${accession.replace(/-/g, "")}/${filename}`;

    return secFetch<string>(path);
  }

  async transformData(raw: unknown) {
    const content = raw as string;
    if (!content || content.length < 100) throw new EmptyDataError("Empty or invalid filing");

    // Parse form type and date from header
    const filingMatch = content.match(/FILED\s+AS\s+OF\s+DATE\s*:\s*(\d{8})/);
    const formTypeMatch = content.match(/CONFORMED\s+SUBMISSION\s+TYPE\s*:\s*(\S+)/);

    const formatDate = (d: string): string =>
      `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

    return [
      SECSecFilingData.parse({
        filingDate: filingMatch?.[1] ? formatDate(filingMatch[1]) : null,
        formType: formTypeMatch?.[1] ?? null,
        content,
      }),
    ];
  }
}
