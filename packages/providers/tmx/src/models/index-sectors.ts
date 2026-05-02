import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchIndexSectors } from "../utils/api";

export const TmxIndexSectorsData = z.object({
  sector: z.string(),
  weight: z.number().nullish(),
  change: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxIndexSectorsData = z.infer<typeof TmxIndexSectorsData>;

export const TmxIndexSectorsQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxIndexSectorsQueryParams = z.infer<typeof TmxIndexSectorsQueryParams>;

/**
 * Fetcher for index sector breakdowns from TMX Money.
 * Endpoint: GET /api/index/{symbol}/sectors
 */
export class TmxIndexSectorsFetcher extends AbstractFetcher<
  typeof TmxIndexSectorsQueryParams,
  typeof TmxIndexSectorsData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxIndexSectorsQueryParams>,
  ): Promise<z.input<typeof TmxIndexSectorsQueryParams>> {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxIndexSectorsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return fetchIndexSectors(query.symbol);
  }

  async transformData(raw: unknown): Promise<TmxIndexSectorsData[]> {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxIndexSectorsData.parse({
        sector: row.sector ?? row.name,
        weight: row.weight,
        change: row.change,
      }),
    );
  }
}
