import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchWSJ, type WSJMarketDataItem } from "../utils/api";

export const WSJMarketDataQueryParams = z.object({
  symbol: z.string().optional().transform((s) => s?.toUpperCase()),
  type: z.enum(["stocks", "indices", "etfs", "commodities", "currencies", "bonds"]).default("stocks"),
  limit: z.number().int().min(1).max(100).default(20),
});

export const WSJMarketDataData = z.object({
  symbol: z.string().nullish(),
  name: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  volume: z.number().nullish(),
  timestamp: z.coerce.date().nullish(),
  provider: z.literal("wsj").default("wsj"),
});

export type WSJMarketDataData = z.infer<typeof WSJMarketDataData>;

export class WSJMarketDataFetcher extends AbstractFetcher<
  typeof WSJMarketDataQueryParams,
  typeof WSJMarketDataData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof WSJMarketDataQueryParams>) {
    return {
      symbol: params.symbol,
      type: params.type ?? "stocks",
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof WSJMarketDataQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const path = query.symbol
      ? `/api/market-data/${encodeURIComponent(query.symbol)}`
      : `/api/market-data/${query.type}`;
    const items = await fetchWSJ<WSJMarketDataItem>(path);
    return items.slice(0, query.limit);
  }

  async transformData(raw: unknown) {
    const items = raw as WSJMarketDataItem[];
    return items.map((item) =>
      WSJMarketDataData.parse({
        symbol: item.symbol ?? null,
        name: item.name ?? null,
        price: item.price ?? null,
        change: item.change ?? null,
        changePercent: item.changePercent ?? null,
        volume: item.volume ?? null,
        timestamp: item.timestamp ? new Date(item.timestamp) : null,
      }),
    );
  }
}
