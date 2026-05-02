import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchEtfSectors } from "../utils/api";

export const TmxEtfSectorsData = z.object({
  sector: z.string(),
  weight: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxEtfSectorsData = z.infer<typeof TmxEtfSectorsData>;

export const TmxEtfSectorsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxEtfSectorsQueryParams = z.infer<typeof TmxEtfSectorsQueryParams>;

/**
 * Fetcher for ETF sector allocations from TMX Money.
 * Endpoint: GET /api/etf/{symbol}/sectors
 */
export class TmxEtfSectorsFetcher extends AbstractFetcher<
  typeof TmxEtfSectorsQueryParams,
  typeof TmxEtfSectorsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxEtfSectorsQueryParams>,
  ): Promise<z.input<typeof TmxEtfSectorsQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxEtfSectorsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchEtfSectors(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxEtfSectorsData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxEtfSectorsData.parse({
        sector: row.sector ?? row.name,
        weight: row.weight,
      }),
    );
  }
}
