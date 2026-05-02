import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { imfFetch, parseIMFValue } from "../utils/api";
import type { IMFDataRow } from "../utils/api";

export const IMFIfsDataData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  frequency: z.string().nullish(),
  refArea: z.string(),
  indicator: z.string(),
  unitMultiplier: z.string().nullish(),
  provider: z.literal("imf").default("imf"),
});

export type IMFIfsDataData = z.infer<typeof IMFIfsDataData>;

export const IMFIfsDataQueryParams = z.object({
  refArea: z.string().min(1, "Reference area / country code is required"),
  indicator: z.string().default("FILR_PCH"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type IMFIfsDataQueryParams = z.infer<typeof IMFIfsDataQueryParams>;

/**
 * Fetch International Financial Statistics (IFS) data from IMF.
 * Includes exchange rates, interest rates, money supply, etc.
 */
export class IMFIfsDataFetcher extends AbstractFetcher<
  typeof IMFIfsDataQueryParams,
  typeof IMFIfsDataData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof IMFIfsDataQueryParams>,
  ): Promise<z.input<typeof IMFIfsDataQueryParams>> {
    return {
      refArea: params.refArea,
      indicator: params.indicator ?? "FILR_PCH",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof IMFIfsDataQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const path = `/CompactData/IFS/M.${query.refArea}.${query.indicator}`;
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
    query?: z.infer<typeof IMFIfsDataQueryParams>,
  ): Promise<IMFIfsDataData[]> {
    const response = raw as { CompactData: { DataSet: { Series: IMFDataRow } } };
    const series = response?.CompactData?.DataSet?.Series;
    if (!series?.Obs || series.Obs.length === 0) {
      throw new EmptyDataError("No IMF IFS data returned");
    }
    const refArea = query?.refArea ?? "";
    const indicator = query?.indicator ?? "";
    return series.Obs.map((obs) =>
      IMFIfsDataData.parse({
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
