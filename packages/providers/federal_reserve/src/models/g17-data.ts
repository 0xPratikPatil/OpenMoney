import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import type { FRBObservation } from "../utils/api";
import { frbFetch, extractFRBObservations, parseFRBValue } from "../utils/api";

export const FRBG17QueryParams = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const FRBG17Data = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string().nullish(),
  seriesName: z.string().nullish(),
  industry: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("federal_reserve").default("federal_reserve"),
});

export type FRBG17Data = z.infer<typeof FRBG17Data>;

const G17_SERIES_ID = "G17";

/**
 * Fetch G.17 data — Industrial Production and Capacity Utilization.
 * The G.17 release provides measures of industrial production,
 * capacity utilization, and manufacturing output in the US.
 */
export class FRBG17DataFetcher extends AbstractFetcher<
  typeof FRBG17QueryParams,
  typeof FRBG17Data
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof FRBG17QueryParams>) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  async extractData(
    _query: z.infer<typeof FRBG17QueryParams>,
    _credentials: Record<string, string>,
  ) {
    return frbFetch<unknown>(`/series/${G17_SERIES_ID}`, { format: "json" });
  }

  async transformData(raw: unknown) {
    const observations = extractFRBObservations(raw);
    if (observations.length === 0) {
      throw new EmptyDataError("No G.17 data available");
    }

    return observations.map((obs: FRBObservation) => {
      const date = (obs.date ?? obs.Date ?? obs.time_period ?? null) as string | null;
      const val = obs.value ?? obs.Value ?? null;
      const seriesName = (obs.series_name ?? obs.seriesName ?? null) as string | null;

      // Determine industry from series name
      let industry: string | null = null;
      if (seriesName) {
        const lower = seriesName.toLowerCase();
        if (lower.includes("total") || lower.includes("all industry")) {
          industry = "Total Industry";
        } else if (lower.includes("manufacturing")) {
          industry = "Manufacturing";
        } else if (lower.includes("mining")) {
          industry = "Mining";
        } else if (lower.includes("utilities") || lower.includes("electric") || lower.includes("gas")) {
          industry = "Utilities";
        } else if (lower.includes("capacity") || lower.includes("utilization")) {
          industry = "Capacity Utilization";
        } else if (lower.includes("motor vehicle") || lower.includes("auto")) {
          industry = "Motor Vehicles & Parts";
        } else if (lower.includes("computer") || lower.includes("electronic") || lower.includes("semiconductor")) {
          industry = "High Technology";
        } else if (lower.includes("consumer") || lower.includes("nondurable")) {
          industry = "Consumer Nondurables";
        } else if (lower.includes("business") || lower.includes("durable")) {
          industry = "Business Equipment & Durables";
        }
      }

      return FRBG17Data.parse({
        date: date ?? "",
        value: parseFRBValue(val),
        seriesId: (obs.series_id ?? obs.seriesId ?? G17_SERIES_ID) as string | null,
        seriesName,
        industry,
        unit: obs.unit ?? null,
      });
    });
  }
}
