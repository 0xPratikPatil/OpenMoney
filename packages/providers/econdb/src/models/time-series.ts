import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { econdbFetch, parseEconDBValue } from "../utils/api";
import type { EconDBTimeSeries } from "../utils/api";

export const EconDBTimeSeriesData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string(),
  name: z.string().nullish(),
  unit: z.string().nullish(),
  frequency: z.string().nullish(),
  provider: z.literal("econdb").default("econdb"),
});

export type EconDBTimeSeriesData = z.infer<typeof EconDBTimeSeriesData>;

export const EconDBTimeSeriesQueryParams = z.object({
  seriesId: z.string().min(1, "Series ID is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().default(10000),
});

export type EconDBTimeSeriesQueryParams = z.infer<typeof EconDBTimeSeriesQueryParams>;

/**
 * Fetch time-series economic data by series ID from EconDB.
 */
export class EconDBTimeSeriesFetcher extends AbstractFetcher<
  typeof EconDBTimeSeriesQueryParams,
  typeof EconDBTimeSeriesData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof EconDBTimeSeriesQueryParams>,
  ): Promise<z.input<typeof EconDBTimeSeriesQueryParams>> {
    return {
      seriesId: params.seriesId,
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit ?? 10000,
    };
  }

  async extractData(
    query: z.infer<typeof EconDBTimeSeriesQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.econdb_api_key;
    const path = `/api/series/${query.seriesId}`;
    return econdbFetch<EconDBTimeSeries>(
      path,
      apiKey,
      {
        start_date: query.startDate,
        end_date: query.endDate,
        limit: query.limit,
      },
    );
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof EconDBTimeSeriesQueryParams>,
  ): Promise<EconDBTimeSeriesData[]> {
    const response = raw as EconDBTimeSeries;
    if (!response.dates || response.dates.length === 0) {
      throw new EmptyDataError("No EconDB time-series data returned");
    }
    const seriesId = query?.seriesId ?? "";
    return response.dates.map((date, i) =>
      EconDBTimeSeriesData.parse({
        date,
        value: response.values?.[i] != null ? parseEconDBValue(response.values[i]) : null,
        seriesId,
        name: response.name ?? null,
        unit: response.unit ?? null,
        frequency: response.frequency ?? null,
      }),
    );
  }
}
