import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import {
  StockgridEndpoint,
  fetchStockgridData,
} from "../utils/api";

// ── Data Schema ──────────────────────────────────────────
export const StockgridOrderFlowData = z.object({
  symbol: z.string(),
  date: z.string(),
  /** Total buy volume */
  buyVolume: z.number().nullish(),
  /** Total sell volume */
  sellVolume: z.number().nullish(),
  /** Net volume (buys - sells) */
  netVolume: z.number().nullish(),
  /** Buy-to-sell ratio */
  buySellRatio: z.number().nullish(),
  /** Order flow imbalance */
  imbalance: z.number().nullish(),
  provider: z.literal("stockgrid").default("stockgrid"),
});

export type StockgridOrderFlowData = z.infer<
  typeof StockgridOrderFlowData
>;

// ── Query Params Schema ──────────────────────────────────
export const StockgridOrderFlowQueryParams = z.object({
  /** Stock symbol */
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
  /** Limit results */
  limit: z.number().int().positive().optional(),
});

export type StockgridOrderFlowQueryParams = z.infer<
  typeof StockgridOrderFlowQueryParams
>;

// ── Fetcher ──────────────────────────────────────────────
/**
 * Fetcher for order flow data from stockgrid.io.
 * Tracks buy vs sell order flow imbalance by symbol.
 */
export class StockgridOrderFlowFetcher extends AbstractFetcher<
  typeof StockgridOrderFlowQueryParams,
  typeof StockgridOrderFlowData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof StockgridOrderFlowQueryParams>,
  ) {
    return {
      symbol: params.symbol.toUpperCase(),
      limit: params.limit,
    };
  }

  async extractData(
    query: z.infer<typeof StockgridOrderFlowQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchStockgridData(
      StockgridEndpoint.ORDER_FLOW,
      query.symbol,
    );
  }

  async transformData(
    raw: unknown,
  ) {
    const rows = raw as Array<Record<string, unknown>>;
    if (!rows || rows.length === 0) {
      throw new EmptyDataError(
        "No order flow data returned",
      );
    }

    return rows.map((row) =>
      StockgridOrderFlowData.parse({
        symbol: row.symbol,
        date: row.date,
        buyVolume: parseNumericField(
          row.buy_volume ?? row.buyVolume ?? row.field_2,
        ),
        sellVolume: parseNumericField(
          row.sell_volume ?? row.sellVolume ?? row.field_3,
        ),
        netVolume: parseNumericField(
          row.net_volume ?? row.netVolume ?? row.field_4,
        ),
        buySellRatio: parseNumericField(
          row.buy_sell_ratio ??
            row.buySellRatio ??
            row.ratio ??
            row.field_5,
        ),
        imbalance: parseNumericField(
          row.imbalance ?? row.field_6,
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
