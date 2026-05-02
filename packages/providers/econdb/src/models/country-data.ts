import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { econdbFetch, parseEconDBValue } from "../utils/api";
import type { EconDBCountryDataResponse } from "../utils/api";

export const EconDBCountryDataData = z.object({
  date: z.string(),
  value: z.number().nullish(),
  country: z.string(),
  indicator: z.string(),
  unit: z.string().nullish(),
  frequency: z.string().nullish(),
  provider: z.literal("econdb").default("econdb"),
});

export type EconDBCountryDataData = z.infer<typeof EconDBCountryDataData>;

export const EconDBCountryDataQueryParams = z.object({
  country: z.string().min(1, "Country code is required (e.g. US, GB, JP)"),
  indicator: z.string().min(1, "Indicator name is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().default(10000),
});

export type EconDBCountryDataQueryParams = z.infer<typeof EconDBCountryDataQueryParams>;

/**
 * Fetch economic indicator data for a specific country from EconDB.
 */
export class EconDBCountryDataFetcher extends AbstractFetcher<
  typeof EconDBCountryDataQueryParams,
  typeof EconDBCountryDataData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof EconDBCountryDataQueryParams>,
  ) {
    return {
      country: params.country,
      indicator: params.indicator,
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit ?? 10000,
    };
  }

  async extractData(
    query: z.infer<typeof EconDBCountryDataQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.econdb_api_key;
    const path = `/api/series/${query.country}/${query.indicator}`;
    return econdbFetch<EconDBCountryDataResponse>(
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
    query?: z.infer<typeof EconDBCountryDataQueryParams>,
  ) {
    const response = raw as EconDBCountryDataResponse;
    if (!response.data || response.data.length === 0) {
      throw new EmptyDataError("No EconDB country data returned");
    }
    const country = query?.country ?? "";
    const indicator = query?.indicator ?? "";
    return response.data.map((row) =>
      EconDBCountryDataData.parse({
        date: row.date,
        value: parseEconDBValue(row.value),
        country,
        indicator,
        unit: response.unit ?? null,
        frequency: response.frequency ?? null,
      }),
    );
  }
}
