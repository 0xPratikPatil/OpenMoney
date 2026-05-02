import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { eiaFetch, parseEIAValue } from "../utils/api";
import type { EIAResponse, EIAResponseRow } from "../utils/api";

export const EIACoalDataData = z.object({
  period: z.string(),
  value: z.number().nullish(),
  series: z.string(),
  seriesDescription: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("eia").default("eia"),
});

export type EIACoalDataData = z.infer<typeof EIACoalDataData>;

export const EIACoalDataQueryParams = z.object({
  series: z.string().min(1, "Coal series ID is required"),
  start: z.string().optional(),
  end: z.string().optional(),
  length: z.number().default(5000),
});

export type EIACoalDataQueryParams = z.infer<typeof EIACoalDataQueryParams>;

/**
 * Fetch coal production and consumption data from EIA.
 * Series examples: COAL.PROD.US.M (production), COAL.CONS.US.M (consumption)
 */
export class EIACoalDataFetcher extends AbstractFetcher<
  typeof EIACoalDataQueryParams,
  typeof EIACoalDataData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof EIACoalDataQueryParams>,
  ): Promise<z.input<typeof EIACoalDataQueryParams>> {
    return {
      series: params.series,
      start: params.start,
      end: params.end,
      length: params.length ?? 5000,
    };
  }

  async extractData(
    query: z.infer<typeof EIACoalDataQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.eia_api_key;
    const path = `/coal/${query.series}/data`;
    return eiaFetch<EIAResponse>(
      path,
      apiKey,
      {
        start: query.start,
        end: query.end,
        length: query.length,
      },
    );
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof EIACoalDataQueryParams>,
  ): Promise<EIACoalDataData[]> {
    const response = raw as EIAResponse;
    const data = response?.response?.data;
    if (!data || data.length === 0) {
      throw new EmptyDataError("No EIA coal data returned");
    }
    const series = query?.series ?? "";
    return data.map((row: EIAResponseRow) =>
      EIACoalDataData.parse({
        period: row.period,
        value: parseEIAValue(row.value),
        series,
        seriesDescription: response.response?.description ?? null,
        unit: null,
      }),
    );
  }
}
