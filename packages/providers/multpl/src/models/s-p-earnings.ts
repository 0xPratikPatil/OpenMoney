import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { MultplEndpoint, fetchMultplTableCsv } from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const MultplEarningsData = z.object({
  date: z.string(),
  /** S&P 500 earnings per share */
  value: z.number(),
  provider: z.literal("multpl").default("multpl"),
});

export type MultplEarningsData = z.infer<typeof MultplEarningsData>;

// ── Query Params Schema ──────────────────────────────────
export const MultplEarningsQueryParams = z.object({
  /** Start date (YYYY-MM-DD) */
  startDate: z.string().optional(),
  /** End date (YYYY-MM-DD) */
  endDate: z.string().optional(),
  /** Limit results */
  limit: z.number().int().positive().optional(),
});

export type MultplEarningsQueryParams = z.infer<
  typeof MultplEarningsQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for S&P 500 earnings data from multpl.com.
 * Tracks historical earnings per share of the S&P 500 index.
 */
export class MultplEarningsFetcher extends AbstractFetcher<
  typeof MultplEarningsQueryParams,
  typeof MultplEarningsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof MultplEarningsQueryParams>,
  ): Promise<z.input<typeof MultplEarningsQueryParams>> {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit,
    };
  }

  async extractData(
    _query: z.infer<typeof MultplEarningsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchMultplTableCsv(MultplEndpoint.S_P_EARNINGS);
  }

  async transformData(
    raw: unknown,
  ): Promise<MultplEarningsData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError("No earnings data returned");
    }

    return rows.map((row) =>
      MultplEarningsData.parse({
        date: row.date,
        value: row.value,
      }),
    );
  }
}
