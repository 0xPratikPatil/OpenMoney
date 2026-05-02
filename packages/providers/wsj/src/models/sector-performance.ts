import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchWSJ, type WSJSectorPerformance } from "../utils/api";

export const WSJSectorPerformanceQueryParams = z.object({
  date: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const WSJSectorPerformanceData = z.object({
  sector: z.string().nullish(),
  changePercent: z.number().nullish(),
  level: z.number().nullish(),
  volume: z.number().nullish(),
  upVolume: z.number().nullish(),
  downVolume: z.number().nullish(),
  provider: z.literal("wsj").default("wsj"),
});

export type WSJSectorPerformanceData = z.infer<typeof WSJSectorPerformanceData>;

export class WSJSectorPerformanceFetcher extends AbstractFetcher<
  typeof WSJSectorPerformanceQueryParams,
  typeof WSJSectorPerformanceData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof WSJSectorPerformanceQueryParams>) {
    return {
      date: params.date,
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof WSJSectorPerformanceQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const path = "/api/market-data/sectors";
    const items = await fetchWSJ<WSJSectorPerformance>(path);
    return items.slice(0, query.limit);
  }

  async transformData(raw: unknown): Promise<WSJSectorPerformanceData[]> {
    const items = raw as WSJSectorPerformance[];
    return items.map((item) =>
      WSJSectorPerformanceData.parse({
        sector: item.sector ?? null,
        changePercent: item.changePercent ?? null,
        level: item.level ?? null,
        volume: item.volume ?? null,
        upVolume: item.upVolume ?? null,
        downVolume: item.downVolume ?? null,
      }),
    );
  }
}
