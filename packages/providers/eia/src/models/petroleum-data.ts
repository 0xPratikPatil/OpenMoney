import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { eiaFetch, parseEIAValue } from "../utils/api";
import type { EIAResponse, EIAResponseRow } from "../utils/api";

export const EIAPetroleumDataData = z.object({
  period: z.string(),
  value: z.number().nullish(),
  series: z.string(),
  seriesDescription: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("eia").default("eia"),
});

export type EIAPetroleumDataData = z.infer<typeof EIAPetroleumDataData>;

export const EIAPetroleumDataQueryParams = z.object({
  series: z.string().min(1, "Petroleum series ID is required"),
  start: z.string().optional(),
  end: z.string().optional(),
  length: z.number().default(5000),
});

export type EIAPetroleumDataQueryParams = z.infer<typeof EIAPetroleumDataQueryParams>;

/**
 * Fetch petroleum supply/disposition data from EIA.
 * Series examples: PET.MCRIMUS1.M (crude imports), PET.WCRSTUS1.W (crude stocks)
 */
export class EIAPetroleumDataFetcher extends AbstractFetcher<
  typeof EIAPetroleumDataQueryParams,
  typeof EIAPetroleumDataData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof EIAPetroleumDataQueryParams>,
  ): Promise<z.input<typeof EIAPetroleumDataQueryParams>> {
    return {
      series: params.series,
      start: params.start,
      end: params.end,
      length: params.length ?? 5000,
    };
  }

  async extractData(
    query: z.infer<typeof EIAPetroleumDataQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.eia_api_key;
    const path = `/petroleum/${query.series}/data`;
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
    query?: z.infer<typeof EIAPetroleumDataQueryParams>,
  ): Promise<EIAPetroleumDataData[]> {
    const response = raw as EIAResponse;
    const data = response?.response?.data;
    if (!data || data.length === 0) {
      throw new EmptyDataError("No EIA petroleum data returned");
    }
    const series = query?.series ?? "";
    return data.map((row: EIAResponseRow) =>
      EIAPetroleumDataData.parse({
        period: row.period,
        value: parseEIAValue(row.value),
        series,
        seriesDescription: response.response?.description ?? null,
        unit: null,
      }),
    );
  }
}
