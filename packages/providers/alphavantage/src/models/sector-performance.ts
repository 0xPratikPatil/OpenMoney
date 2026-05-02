import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { avFetch, parseNumber } from "../utils/api";

export const AVSectorPerformanceData = z.object({
  sector: z.string(),
  changePercent: z.number().nullish(),
  rank: z.number().nullish(),
  provider: z.literal("alphavantage").default("alphavantage"),
});

export type AVSectorPerformanceData = z.infer<typeof AVSectorPerformanceData>;

export const AVSectorPerformanceQueryParams = z.object({});

export type AVSectorPerformanceQueryParams = z.infer<typeof AVSectorPerformanceQueryParams>;

export class AVSectorPerformanceFetcher extends AbstractFetcher<
  typeof AVSectorPerformanceQueryParams,
  typeof AVSectorPerformanceData
> {
  requireCredentials = true;

  async transformQuery(
    _params: z.input<typeof AVSectorPerformanceQueryParams>,
  ) {
    return {};
  }

  async extractData(
    _query: z.infer<typeof AVSectorPerformanceQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["alphavantage_api_key"] ?? "";
    return avFetch("SECTOR", apiKey);
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as Record<string, unknown>;
    const sections = data["Rank A: Real-Time Performance"] as Record<string, string> | undefined;
    if (!sections) throw new EmptyDataError("No sector performance data returned");

    const results: AVSectorPerformanceData[] = [];
    let rank = 1;

    for (const [sectorName, changeStr] of Object.entries(sections)) {
      results.push(
        AVSectorPerformanceData.parse({
          sector: sectorName,
          changePercent: parseNumber(changeStr),
          rank,
        }),
      );
      rank++;
    }

    if (results.length === 0) throw new EmptyDataError("No sector entries found");

    return results;
  }
}
