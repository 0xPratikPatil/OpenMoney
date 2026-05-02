import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchGainers } from "../utils/api";

export const TmxGainersData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  volume: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxGainersData = z.infer<typeof TmxGainersData>;

export const TmxGainersQueryParams = z.object({
  exchange: z.enum(["tsx", "tsxv"]).default("tsx"),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type TmxGainersQueryParams = z.infer<typeof TmxGainersQueryParams>;

/**
 * Fetcher for top market gainers from TMX Money.
 * Endpoint: GET /api/market/gainers?exchange=tsx
 */
export class TmxGainersFetcher extends AbstractFetcher<
  typeof TmxGainersQueryParams,
  typeof TmxGainersData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxGainersQueryParams>,
  ) {
    return {
      exchange: params.exchange ?? "tsx",
      limit: params.limit ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof TmxGainersQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchGainers(query.exchange);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxGainersData.parse({
        symbol: row.symbol ?? row.ticker,
        name: row.name ?? row.companyName,
        price: row.price ?? row.lastPrice,
        change: row.change,
        changePercent: row.changePercent,
        volume: row.volume,
      }),
    );
  }
}
