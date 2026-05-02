import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { frbFetch, extractFRBObservations, parseFRBValue } from "../utils/api";

export const FRBH41QueryParams = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const FRBH41Data = z.object({
  date: z.string(),
  value: z.number().nullish(),
  seriesId: z.string().nullish(),
  seriesName: z.string().nullish(),
  category: z.string().nullish(),
  unit: z.string().nullish(),
  provider: z.literal("federal_reserve").default("federal_reserve"),
});

export type FRBH41Data = z.infer<typeof FRBH41Data>;

const H41_SERIES_ID = "H41";

/**
 * Fetch H.4.1 data — Factors Affecting Reserve Balances.
 * The H.4.1 release provides the Federal Reserve's weekly balance sheet
 * information, including securities holdings, reserve balances, and
 * other factors affecting the monetary base.
 */
export class FRBH41DataFetcher extends AbstractFetcher<
  typeof FRBH41QueryParams,
  typeof FRBH41Data
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof FRBH41QueryParams>) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  async extractData(
    _query: z.infer<typeof FRBH41QueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return frbFetch<unknown>(`/series/${H41_SERIES_ID}`, { format: "json" });
  }

  async transformData(raw: unknown): Promise<FRBH41Data[]> {
    const observations = extractFRBObservations(raw);
    if (observations.length === 0) {
      throw new EmptyDataError("No H.4.1 data available");
    }

    return observations.map((obs: FRBObservation) => {
      const date = (obs.date ?? obs.Date ?? obs.time_period ?? null) as string | null;
      const val = obs.value ?? obs.Value ?? null;
      const seriesName = (obs.series_name ?? obs.seriesName ?? null) as string | null;

      // Determine category from series name
      let category: string | null = null;
      if (seriesName) {
        const lower = seriesName.toLowerCase();
        if (lower.includes("securities") || lower.includes("treasury") || lower.includes("mbs") || lower.includes("agency")) {
          category = "Securities Holdings";
        } else if (lower.includes("reserve balance") || lower.includes("reserve balance") || lower.includes("currency")) {
          category = "Reserve Balances & Currency";
        } else if (lower.includes("repo") || lower.includes("repurchase")) {
          category = "Repurchase Agreements";
        } else if (lower.includes("discount") || lower.includes("lending") || lower.includes("credit")) {
          category = "Lending Facilities";
        } else {
          category = "Other";
        }
      }

      return FRBH41Data.parse({
        date: date ?? "",
        value: parseFRBValue(val),
        seriesId: (obs.series_id ?? obs.seriesId ?? H41_SERIES_ID) as string | null,
        seriesName,
        category,
        unit: obs.unit ?? null,
      });
    });
  }
}
