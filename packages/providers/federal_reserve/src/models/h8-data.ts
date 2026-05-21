import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import type { FRBObservation } from "../utils/api";
import { frbFetch, extractFRBObservations, parseFRBValue } from "../utils/api";

export const FRBH8QueryParams = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const FRBH8Data = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string().nullish(),
  seriesName: z.string().nullish(),
  description: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("federal_reserve").default("federal_reserve"),
});

export type FRBH8Data = z.infer<typeof FRBH8Data>;

const H8_SERIES_ID = "H8";

/**
 * Fetch H.8 data — Assets and Liabilities of Commercial Banks in the United States.
 * The H.8 release provides assets, liabilities, and equity for all
 * commercial banks in the US on a weekly basis.
 */
export class FRBH8DataFetcher extends AbstractFetcher<
  typeof FRBH8QueryParams,
  typeof FRBH8Data
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof FRBH8QueryParams>) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  async extractData(
    _query: z.infer<typeof FRBH8QueryParams>,
    _credentials: Record<string, string>,
  ) {
    return frbFetch<unknown>(`/series/${H8_SERIES_ID}`, { format: "json" });
  }

  async transformData(raw: unknown) {
    const observations = extractFRBObservations(raw);
    if (observations.length === 0) {
      throw new EmptyDataError("No H.8 data available");
    }

    return observations.map((obs: FRBObservation) => {
      const date = (obs.date ?? obs.Date ?? obs.time_period ?? obs.observation_date ?? null) as string | null;
      const val = obs.value ?? obs.Value ?? obs.observation_value ?? null;

      return FRBH8Data.parse({
        date: date ?? "",
        value: parseFRBValue(val),
        seriesId: (obs.series_id ?? obs.seriesId ?? H8_SERIES_ID) as string | null,
        seriesName: (obs.series_name ?? obs.seriesName ?? obs.series ?? null) as string | null,
        description: null,
        unit: obs.unit ?? null,
      });
    });
  }
}
