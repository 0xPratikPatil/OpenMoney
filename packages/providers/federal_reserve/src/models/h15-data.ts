import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { frbFetch, extractFRBObservations, parseFRBValue } from "../utils/api";

export const FRBH15QueryParams = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const FRBH15Data = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string().nullish(),
  seriesName: z.string().nullish(),
  instrumentType: z.string().nullish(),
  maturity: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("federal_reserve").default("federal_reserve"),
});

export type FRBH15Data = z.infer<typeof FRBH15Data>;

const H15_SERIES_ID = "H15";

/**
 * Fetch H.15 data — Selected Interest Rates.
 * The H.15 release provides daily interest rates for US Treasury
 * securities, corporate bonds, and other money market instruments.
 */
export class FRBH15DataFetcher extends AbstractFetcher<
  typeof FRBH15QueryParams,
  typeof FRBH15Data
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof FRBH15QueryParams>) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  async extractData(
    _query: z.infer<typeof FRBH15QueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return frbFetch<unknown>(`/series/${H15_SERIES_ID}`, { format: "json" });
  }

  async transformData(raw: unknown): Promise<FRBH15Data[]> {
    const observations = extractFRBObservations(raw);
    if (observations.length === 0) {
      throw new EmptyDataError("No H.15 data available");
    }

    return observations.map((obs: FRBObservation) => {
      const date = (obs.date ?? obs.Date ?? obs.time_period ?? null) as string | null;
      const val = obs.value ?? obs.Value ?? null;

      // Parse instrument type and maturity from series metadata
      const seriesName = (obs.series_name ?? obs.seriesName ?? null) as string | null;
      let instrumentType: string | null = null;
      let maturity: string | null = null;

      if (seriesName) {
        const lower = seriesName.toLowerCase();
        if (lower.includes("treasury") || lower.includes("t-bond") || lower.includes("t-note") || lower.includes("t-bill")) {
          instrumentType = "U.S. Treasury";
        } else if (lower.includes("corporate") || lower.includes("aaa") || lower.includes("baa")) {
          instrumentType = "Corporate";
        } else if (lower.includes("federal funds") || lower.includes("fed funds")) {
          instrumentType = "Federal Funds";
        } else if (lower.includes("municipal") || lower.includes("muni")) {
          instrumentType = "Municipal";
        } else if (lower.includes("mortgage") || lower.includes("mbs")) {
          instrumentType = "Mortgage";
        }

        // Try to extract maturity pattern like "10-year", "30-year", "3-month", etc.
        const maturityMatch = seriesName.match(/(\d+[-\s]?(?:year|month|week|day))/i);
        if (maturityMatch) {
          maturity = maturityMatch[1].trim();
        }
      }

      return FRBH15Data.parse({
        date: date ?? "",
        value: parseFRBValue(val),
        seriesId: (obs.series_id ?? obs.seriesId ?? H15_SERIES_ID) as string | null,
        seriesName,
        instrumentType,
        maturity,
        unit: obs.unit ?? "percent",
      });
    });
  }
}
