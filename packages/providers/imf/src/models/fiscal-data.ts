import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { imfFetch, parseIMFValue } from "../utils/api";
import type { IMFDataRow } from "../utils/api";

export const IMFFiscalDataData = z.object({
  timePeriod: z.string(),
  value: z.number().nullish(),
  frequency: z.string().nullish(),
  refArea: z.string(),
  indicator: z.string(),
  unitMultiplier: z.string().nullish(),
  provider: z.literal("imf").default("imf"),
});

export type IMFFiscalDataData = z.infer<typeof IMFFiscalDataData>;

export const IMFFiscalDataQueryParams = z.object({
  refArea: z.string().min(1, "Reference area / country code is required"),
  indicator: z.string().default("GGXWDG_GDP"),
  startPeriod: z.string().optional(),
  endPeriod: z.string().optional(),
});

export type IMFFiscalDataQueryParams = z.infer<typeof IMFFiscalDataQueryParams>;

/**
 * Fetch Fiscal Monitor data from IMF.
 * Includes government debt, deficit, revenue, and expenditure data.
 */
export class IMFFiscalDataFetcher extends AbstractFetcher<
  typeof IMFFiscalDataQueryParams,
  typeof IMFFiscalDataData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof IMFFiscalDataQueryParams>,
  ): Promise<z.input<typeof IMFFiscalDataQueryParams>> {
    return {
      refArea: params.refArea,
      indicator: params.indicator ?? "GGXWDG_GDP",
      startPeriod: params.startPeriod,
      endPeriod: params.endPeriod,
    };
  }

  async extractData(
    query: z.infer<typeof IMFFiscalDataQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    const path = `/CompactData/FM/A.${query.refArea}.${query.indicator}`;
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
    query?: z.infer<typeof IMFFiscalDataQueryParams>,
  ): Promise<IMFFiscalDataData[]> {
    const response = raw as { CompactData: { DataSet: { Series: IMFDataRow } } };
    const series = response?.CompactData?.DataSet?.Series;
    if (!series?.Obs || series.Obs.length === 0) {
      throw new EmptyDataError("No IMF Fiscal data returned");
    }
    const refArea = query?.refArea ?? "";
    const indicator = query?.indicator ?? "";
    return series.Obs.map((obs) =>
      IMFFiscalDataData.parse({
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
