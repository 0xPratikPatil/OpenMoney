import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchEarnings } from "../utils/api";

export const TmxCalendarEarningsData = z.object({
  company: z.string().nullish(),
  symbol: z.string().nullish(),
  date: z.string().nullish(),
  quarter: z.string().nullish(),
  estimate: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxCalendarEarningsData = z.infer<typeof TmxCalendarEarningsData>;

export const TmxCalendarEarningsQueryParams = z.object({
  date: z.string().min(1, "Date is required (YYYY-MM-DD)"),
});

export type TmxCalendarEarningsQueryParams = z.infer<typeof TmxCalendarEarningsQueryParams>;

/**
 * Fetcher for earnings calendar from TMX Money.
 * Endpoint: GET /api/calendar/earnings?date={date}
 */
export class TmxCalendarEarningsFetcher extends AbstractFetcher<
  typeof TmxCalendarEarningsQueryParams,
  typeof TmxCalendarEarningsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxCalendarEarningsQueryParams>,
  ) {
    return { date: params.date };
  }

  async extractData(
    query: z.infer<typeof TmxCalendarEarningsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchEarnings(query.date);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxCalendarEarningsData.parse({
        company: row.company ?? row.companyName,
        symbol: row.symbol ?? row.ticker,
        date: row.date ?? row.earningsDate,
        quarter: row.quarter,
        estimate: row.estimate ?? row.epsEstimate,
      }),
    );
  }
}
