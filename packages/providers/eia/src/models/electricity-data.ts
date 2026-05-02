import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { eiaFetch, parseEIAValue } from "../utils/api";
import type { EIAResponse, EIAResponseRow } from "../utils/api";

export const EIAElectricityDataData = z.object({
  period: z.string(),
  value: z.number().nullish(),
  series: z.string(),
  seriesDescription: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("eia").default("eia"),
});

export type EIAElectricityDataData = z.infer<typeof EIAElectricityDataData>;

export const EIAElectricityDataQueryParams = z.object({
  series: z.string().min(1, "Electricity series ID is required"),
  start: z.string().optional(),
  end: z.string().optional(),
  length: z.number().default(5000),
});

export type EIAElectricityDataQueryParams = z.infer<typeof EIAElectricityDataQueryParams>;

/**
 * Fetch electricity generation and consumption data from EIA.
 * Series examples: ELEC.GEN.ALL-US99.M (generation), ELEC.CONS.ALL-US99.M (consumption)
 */
export class EIAElectricityDataFetcher extends AbstractFetcher<
  typeof EIAElectricityDataQueryParams,
  typeof EIAElectricityDataData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof EIAElectricityDataQueryParams>,
  ) {
    return {
      series: params.series,
      start: params.start,
      end: params.end,
      length: params.length ?? 5000,
    };
  }

  async extractData(
    query: z.infer<typeof EIAElectricityDataQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.eia_api_key;
    const path = `/electricity/${query.series}/data`;
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
    query?: z.infer<typeof EIAElectricityDataQueryParams>,
  ) {
    const response = raw as EIAResponse;
    const data = response?.response?.data;
    if (!data || data.length === 0) {
      throw new EmptyDataError("No EIA electricity data returned");
    }
    const series = query?.series ?? "";
    return data.map((row: EIAResponseRow) =>
      EIAElectricityDataData.parse({
        period: row.period,
        value: parseEIAValue(row.value),
        series,
        seriesDescription: response.response?.description ?? null,
        unit: null,
      }),
    );
  }
}
