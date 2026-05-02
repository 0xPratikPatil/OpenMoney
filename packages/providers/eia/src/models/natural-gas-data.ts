import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { eiaFetch, parseEIAValue } from "../utils/api";
import type { EIAResponse, EIAResponseRow } from "../utils/api";

export const EIANaturalGasDataData = z.object({
  period: z.string(),
  value: z.number().nullish(),
  series: z.string(),
  seriesDescription: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("eia").default("eia"),
});

export type EIANaturalGasDataData = z.infer<typeof EIANaturalGasDataData>;

export const EIANaturalGasDataQueryParams = z.object({
  series: z.string().min(1, "Natural gas series ID is required"),
  start: z.string().optional(),
  end: z.string().optional(),
  length: z.number().default(5000),
});

export type EIANaturalGasDataQueryParams = z.infer<typeof EIANaturalGasDataQueryParams>;

/**
 * Fetch natural gas storage and production data from EIA.
 * Series examples: NG.NW2_EPG0_SWO_R48_BCF.W (storage), NG.N9010US2.M (production)
 */
export class EIANaturalGasDataFetcher extends AbstractFetcher<
  typeof EIANaturalGasDataQueryParams,
  typeof EIANaturalGasDataData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof EIANaturalGasDataQueryParams>,
  ) {
    return {
      series: params.series,
      start: params.start,
      end: params.end,
      length: params.length ?? 5000,
    };
  }

  async extractData(
    query: z.infer<typeof EIANaturalGasDataQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.eia_api_key;
    const path = `/natural-gas/${query.series}/data`;
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
    query?: z.infer<typeof EIANaturalGasDataQueryParams>,
  ) {
    const response = raw as EIAResponse;
    const data = response?.response?.data;
    if (!data || data.length === 0) {
      throw new EmptyDataError("No EIA natural gas data returned");
    }
    const series = query?.series ?? "";
    return data.map((row: EIAResponseRow) =>
      EIANaturalGasDataData.parse({
        period: row.period,
        value: parseEIAValue(row.value),
        series,
        seriesDescription: response.response?.description ?? null,
        unit: null,
      }),
    );
  }
}
