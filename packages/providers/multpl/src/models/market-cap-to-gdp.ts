import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { MultplEndpoint, fetchMultplTableCsv } from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const MultplMarketCapToGdpData = z.object({
  date: z.string(),
  /** Total market cap to GDP ratio (Buffett Indicator) */
  value: z.number(),
  provider: z.literal("multpl").default("multpl"),
});

export type MultplMarketCapToGdpData = z.infer<
  typeof MultplMarketCapToGdpData
>;

// ── Query Params Schema ──────────────────────────────────
export const MultplMarketCapToGdpQueryParams = z.object({
  /** Start date (YYYY-MM-DD) */
  startDate: z.string().optional(),
  /** End date (YYYY-MM-DD) */
  endDate: z.string().optional(),
  /** Limit results */
  limit: z.number().int().positive().optional(),
});

export type MultplMarketCapToGdpQueryParams = z.infer<
  typeof MultplMarketCapToGdpQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for Total Market Cap to GDP (Buffett Indicator) from multpl.com.
 * Measures the ratio of total US stock market capitalization to GDP.
 */
export class MultplMarketCapToGdpFetcher extends AbstractFetcher<
  typeof MultplMarketCapToGdpQueryParams,
  typeof MultplMarketCapToGdpData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof MultplMarketCapToGdpQueryParams>,
  ) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit,
    };
  }

  async extractData(
    _query: z.infer<typeof MultplMarketCapToGdpQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchMultplTableCsv(MultplEndpoint.MARKET_CAP_TO_GDP);
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No market cap to GDP data returned",
      );
    }

    return rows.map((row) =>
      MultplMarketCapToGdpData.parse({
        date: row.date,
        value: row.value,
      }),
    );
  }
}
