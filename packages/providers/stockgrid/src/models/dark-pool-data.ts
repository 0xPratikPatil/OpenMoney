import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import {
  StockgridEndpoint,
  fetchStockgridData,
} from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const StockgridDarkPoolData = z.object({
  symbol: z.string(),
  date: z.string(),
  /** Total dark pool volume */
  darkPoolVolume: z.number().nullish(),
  /** Dark pool dollar value */
  darkPoolValue: z.number().nullish(),
  /** Dark pool transactions count */
  darkPoolTrades: z.number().nullish(),
  /** Premium/discount to market price */
  premium: z.number().nullish(),
  /** Sentiment score */
  sentiment: z.string().nullish(),
  provider: z.literal("stockgrid").default("stockgrid"),
});

export type StockgridDarkPoolData = z.infer<
  typeof StockgridDarkPoolData
>;

// ── Query Params Schema ──────────────────────────────────
export const StockgridDarkPoolQueryParams = z.object({
  /** Stock symbol */
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  /** Limit results */
  limit: z.number().int().positive().optional(),
});

export type StockgridDarkPoolQueryParams = z.infer<
  typeof StockgridDarkPoolQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for dark pool trading data from stockgrid.io.
 * Tracks block trades executed in dark pools (away from public exchanges).
 */
export class StockgridDarkPoolFetcher extends AbstractFetcher<
  typeof StockgridDarkPoolQueryParams,
  typeof StockgridDarkPoolData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof StockgridDarkPoolQueryParams>,
  ): Promise<z.input<typeof StockgridDarkPoolQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit,
    };
  }

  async extractData(
    query: z.infer<typeof StockgridDarkPoolQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchStockgridData(
      StockgridEndpoint.DARK_POOL,
      query.symbol,
    );
  }

  async transformData(
    raw: unknown,
  ): Promise<StockgridDarkPoolData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No dark pool data returned",
      );
    }

    return rows.map((row) =>
      StockgridDarkPoolData.parse({
        symbol: row.symbol,
        date: row.date,
        darkPoolVolume: parseNumericField(
          row.volume ?? row.dark_pool_volume ?? row.darkPoolVolume,
        ),
        darkPoolValue: parseNumericField(
          row.value ?? row.dark_pool_value ?? row.darkPoolValue,
        ),
        darkPoolTrades: parseNumericField(
          row.trades ?? row.dark_pool_trades ?? row.darkPoolTrades,
        ),
        premium: parseNumericField(row.premium),
        sentiment: row.sentiment ? String(row.sentiment) : null,
      }),
    );
  }
}

/** Safely parse a numeric value from various input types. */
function parseNumericField(
  val: unknown,
): number | null {
  if (val == null) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[$,%,\s]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}
