import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { MultplEndpoint, fetchMultplTableCsv } from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const MultplShillerPeData = z.object({
  date: z.string(),
  /** Shiller P/E (CAPE) ratio value */
  value: z.number(),
  provider: z.literal("multpl").default("multpl"),
});

export type MultplShillerPeData = z.infer<typeof MultplShillerPeData>;

// ── Query Params Schema ──────────────────────────────────
export const MultplShillerPeQueryParams = z.object({
  /** Start date (YYYY-MM-DD) for filtering data */
  startDate: z.string().optional(),
  /** End date (YYYY-MM-DD) for filtering data */
  endDate: z.string().optional(),
  /** Limit the number of results (most recent first) */
  limit: z.number().int().positive().optional(),
});

export type MultplShillerPeQueryParams = z.infer<
  typeof MultplShillerPeQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for Shiller P/E (CAPE) ratio data from multpl.com.
 * The cyclically adjusted price-to-earnings ratio by Robert Shiller.
 */
export class MultplShillerPeFetcher extends AbstractFetcher<
  typeof MultplShillerPeQueryParams,
  typeof MultplShillerPeData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof MultplShillerPeQueryParams>,
  ) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit,
    };
  }

  async extractData(
    _query: z.infer<typeof MultplShillerPeQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchMultplTableCsv(MultplEndpoint.SHILLER_PE);
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError("No Shiller P/E data returned");
    }

    return rows.map((row) =>
      MultplShillerPeData.parse({
        date: row.date,
        value: row.value,
      }),
    );
  }
}
