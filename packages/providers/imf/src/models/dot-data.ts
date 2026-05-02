import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { imfFetch, parseIMFValue } from "../utils/api";
import type { IMFDataRow } from "../utils/api";

export const IMFDotDataData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  frequency: z.string().nullish(),
  refArea: z.string(),
  indicator: z.string(),
  unitMultiplier: z.string().nullish(),
  provider: z.literal("imf").default("imf"),
});

export type IMFDotDataData = z.infer<typeof IMFDotDataData>;

export const IMFDotDataQueryParams = z.object({
  refArea: z.string().min(1, "Reference area / country code is required"),
  indicator: z.string().default("TMG_CIF_USD"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type IMFDotDataQueryParams = z.infer<typeof IMFDotDataQueryParams>;

/**
 * Fetch Direction of Trade Statistics (DOT) data from IMF.
 * Provides import/export data between countries.
 */
export class IMFDotDataFetcher extends AbstractFetcher<
  typeof IMFDotDataQueryParams,
  typeof IMFDotDataData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof IMFDotDataQueryParams>,
  ) {
    return {
      refArea: params.refArea,
      indicator: params.indicator ?? "TMG_CIF_USD",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof IMFDotDataQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const path = `/CompactData/DOT/M.${query.refArea}.${query.indicator}`;
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
    query?: z.infer<typeof IMFDotDataQueryParams>,
  ) {
    const response = raw as { CompactData: { DataSet: { Series: IMFDataRow } } };
    const series = response?.CompactData?.DataSet?.Series;
    if (!series?.Obs || series.Obs.length === 0) {
      throw new EmptyDataError("No IMF DOT data returned");
    }
    const refArea = query?.refArea ?? "";
    const indicator = query?.indicator ?? "";
    return series.Obs.map((obs) =>
      IMFDotDataData.parse({
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
