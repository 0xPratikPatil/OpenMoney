import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { imfFetch, parseIMFValue } from "../utils/api";
import type { IMFDataRow } from "../utils/api";

export const IMFWeoDataData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  frequency: z.string().nullish(),
  refArea: z.string(),
  indicator: z.string(),
  unitMultiplier: z.string().nullish(),
  provider: z.literal("imf").default("imf"),
});

export type IMFWeoDataData = z.infer<typeof IMFWeoDataData>;

export const IMFWeoDataQueryParams = z.object({
  refArea: z.string().min(1, "Reference area / country code is required"),
  indicator: z.string().default("NGDP_RPCH"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type IMFWeoDataQueryParams = z.infer<typeof IMFWeoDataQueryParams>;

/**
 * Fetch World Economic Outlook (WEO) data from IMF.
 * Includes GDP growth, inflation, unemployment, and other macro forecasts.
 */
export class IMFWeoDataFetcher extends AbstractFetcher<
  typeof IMFWeoDataQueryParams,
  typeof IMFWeoDataData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof IMFWeoDataQueryParams>,
  ): Promise<z.input<typeof IMFWeoDataQueryParams>> {
    return {
      refArea: params.refArea,
      indicator: params.indicator ?? "NGDP_RPCH",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof IMFWeoDataQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const path = `/CompactData/WEO/A.${query.refArea}.${query.indicator}`;
    return imfFetch<{ CompactData: { DataSet: { Series: IMFDataRow } } }>(
      path,
      {
        startPeriod: query.startPeriod,
        endPeriod: query.endPeriod,
      },
    );
  }

  async transformData(
    raw: unknown,
    query?: z.infer<typeof IMFWeoDataQueryParams>,
  ): Promise<IMFWeoDataData[]> {
    const response = raw as { CompactData: { DataSet: { Series: IMFDataRow } } };
    const series = response?.CompactData?.DataSet?.Series;
    if (!series?.Obs || series.Obs.length === 0) {
      throw new EmptyDataError("No IMF WEO data returned");
    }
    const refArea = query?.refArea ?? "";
    const indicator = query?.indicator ?? "";
    return series.Obs.map((obs) =>
      IMFWeoDataData.parse({
        timePeriod: obs["@TIME_PERIOD"],
        value: parseIMFValue(obs["@OBS_VALUE"]),
        frequency: series["@FREQ"] ?? null,
        refArea,
        indicator,
        unitMultiplier: series["@UNIT_MULT"] ?? null,
      }),
    );
  }
}
