import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { MultplEndpoint, fetchMultplTableCsv } from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const MultplTreasuryRateData = z.object({
  date: z.string(),
  /** Treasury rate as a percentage (e.g., 4.5 means 4.5%) */
  value: z.number(),
  /** Maturity in years (10 or 30) */
  maturity: z.number(),
  provider: z.literal("multpl").default("multpl"),
});

export type MultplTreasuryRateData = z.infer<
  typeof MultplTreasuryRateData
>;

// ── Query Params Schema ──────────────────────────────────
export const MultplTreasuryRateQueryParams = z.object({
  /** Treasury maturity: 10-year or 30-year */
  maturity: z
    .union([z.literal(10), z.literal(30)])
    .default(10),
  /** Start date (YYYY-MM-DD) */
  startDate: z.string().optional(),
  /** End date (YYYY-MM-DD) */
  endDate: z.string().optional(),
  /** Limit results */
  limit: z.number().int().positive().optional(),
});

export type MultplTreasuryRateQueryParams = z.infer<
  typeof MultplTreasuryRateQueryParams
>;

/** Map maturity to MultplEndpoint */
function endpointForMaturity(
  maturity: 10 | 30,
): MultplEndpoint {
  return maturity === 10
    ? MultplEndpoint.TEN_YEAR_TREASURY_RATE
    : MultplEndpoint.THIRTY_YEAR_TREASURY_RATE;
}

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for US Treasury rates from multpl.com.
 * Supports 10-year and 30-year Treasury rates.
 */
export class MultplTreasuryRateFetcher extends AbstractFetcher<
  typeof MultplTreasuryRateQueryParams,
  typeof MultplTreasuryRateData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof MultplTreasuryRateQueryParams>,
  ) {
    return {
      maturity: params.maturity ?? 10,
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit,
    };
  }

  async extractData(
    query: z.infer<typeof MultplTreasuryRateQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const endpoint = endpointForMaturity(query.maturity as any);
    return fetchMultplTableCsv(endpoint);
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof MultplTreasuryRateQueryParams>,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No treasury rate data returned",
      );
    }

    const maturity = query?.maturity ?? 10;

    return rows.map((row) =>
      MultplTreasuryRateData.parse({
        date: row.date,
        value: row.value,
        maturity,
      }),
    );
  }
}
