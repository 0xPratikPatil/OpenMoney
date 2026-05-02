import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchEcbData, parseObservations } from "../utils/api";

export const EcbYieldCurveData = z.object({
  date: z.string(),
  tenor: z.string(),
  rate: z.number().nullish(),
  provider: z.literal("ecb").default("ecb"),
});

export type EcbYieldCurveData = z.infer<typeof EcbYieldCurveData>;

export const EcbYieldCurveQueryParams = z.object({
  // No params — returns the euro area yield curve
});

export type EcbYieldCurveQueryParams = z.infer<typeof EcbYieldCurveQueryParams>;

/**
 * Fetcher for ECB euro area yield curve data.
 * Uses dataflow YC (Yield Curve).
 */
export class EcbYieldCurveFetcher extends AbstractFetcher<
  typeof EcbYieldCurveQueryParams,
  typeof EcbYieldCurveData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof EcbYieldCurveQueryParams>,
  ) {
    return { ...params };
  }

  async extractData(
    _query: z.infer<typeof EcbYieldCurveQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // Fetch yield curve data — euro area, all tenors, nominal rates
    const dataflow = "YC/B.U2.EUR.4F.G_N_A+G_N_C";
    const json = await fetchEcbData(dataflow, {});
    return json;
  }

  async transformData(
    raw: unknown,
  ) {
    const parsed = parseObservations(raw as any);
    if (parsed.length === 0) throw new EmptyDataError("No yield curve data returned");

    // Group by tenor and get latest for each
    const byTenor = new Map<string, Array<Record<string, string | number | null>>>();

    for (const record of parsed) {
      const tenor = (record.TENOR ?? record.tenor ?? "") as string;
      if (!tenor) continue;
      if (!byTenor.has(tenor)) {
        byTenor.set(tenor, []);
      }
      byTenor.get(tenor)!.push(record);
    }

    const results: EcbYieldCurveData[] = [];

    for (const [tenor, records] of byTenor) {
      const latest = records[records.length - 1];
      if (!latest) continue;

      results.push(
        EcbYieldCurveData.parse({
          date: (latest.TIME_PERIOD ?? latest.time_period ?? "") as string,
          tenor,
          rate: latest.value as number | null,
        }),
      );
    }

    if (results.length === 0) throw new EmptyDataError("No yield curve data could be parsed");
    return results;
  }
}
