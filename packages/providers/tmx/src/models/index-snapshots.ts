import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchIndex } from "../utils/api";

export const TmxIndexSnapshotsData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  volume: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxIndexSnapshotsData = z.infer<typeof TmxIndexSnapshotsData>;

export const TmxIndexSnapshotsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxIndexSnapshotsQueryParams = z.infer<typeof TmxIndexSnapshotsQueryParams>;

/**
 * Fetcher for index snapshot data from TMX Money.
 * Endpoint: GET /api/index/{symbol}
 */
export class TmxIndexSnapshotsFetcher extends AbstractFetcher<
  typeof TmxIndexSnapshotsQueryParams,
  typeof TmxIndexSnapshotsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxIndexSnapshotsQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxIndexSnapshotsQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchIndex(query.symbol);
  }

  async transformData(raw: unknown) {
    const idx = raw as Record<string, unknown>;
    if (!idx || Object.keys(idx).length === 0) return [];

    return [
      TmxIndexSnapshotsData.parse({
        symbol: idx.symbol ?? idx.ticker,
        name: idx.name ?? idx.indexName,
        price: idx.price ?? idx.lastPrice,
        change: idx.change,
        changePercent: idx.changePercent,
        volume: idx.volume,
      }),
    ];
  }
}
