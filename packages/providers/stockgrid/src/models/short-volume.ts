import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import {
  StockgridEndpoint,
  fetchStockgridData,
} from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const StockgridShortVolumeData = z.object({
  symbol: z.string(),
  date: z.string(),
  /** Total short volume */
  shortVolume: z.number().nullish(),
  /** Total volume */
  totalVolume: z.number().nullish(),
  /** Short volume as a percentage of total volume */
  shortPercent: z.number().nullish(),
  /** Short volume rank (1 = most shorted) */
  shortRank: z.number().nullish(),
  provider: z.literal("stockgrid").default("stockgrid"),
});

export type StockgridShortVolumeData = z.infer<
  typeof StockgridShortVolumeData
>;

// ── Query Params Schema ──────────────────────────────────
export const StockgridShortVolumeQueryParams = z.object({
  /** Stock symbol */
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  /** Limit results */
  limit: z.number().int().positive().optional(),
});

export type StockgridShortVolumeQueryParams = z.infer<
  typeof StockgridShortVolumeQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for short volume data from stockgrid.io.
 * Tracks short sale volume and short volume percentage by symbol.
 */
export class StockgridShortVolumeFetcher extends AbstractFetcher<
  typeof StockgridShortVolumeQueryParams,
  typeof StockgridShortVolumeData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof StockgridShortVolumeQueryParams>,
  ): Promise<z.input<typeof StockgridShortVolumeQueryParams>> {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit,
    };
  }

  async extractData(
    query: z.infer<typeof StockgridShortVolumeQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchStockgridData(
      StockgridEndpoint.SHORT_VOLUME,
      query.symbol,
    );
  }

  async transformData(
    raw: unknown,
  ): Promise<StockgridShortVolumeData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No short volume data returned",
      );
    }

    return rows.map((row) =>
      StockgridShortVolumeData.parse({
        symbol: row.symbol,
        date: row.date,
        shortVolume: parseNumericField(
          row.short_volume ?? row.shortVolume ?? row.field_2,
        ),
        totalVolume: parseNumericField(
          row.total_volume ?? row.totalVolume ?? row.field_3,
        ),
        shortPercent: parseNumericField(
          row.short_percent ??
            row.shortPercent ??
            row.short_pct ??
            row.field_4,
        ),
        shortRank: parseNumericField(
          row.short_rank ?? row.shortRank ?? row.field_5,
        ),
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
