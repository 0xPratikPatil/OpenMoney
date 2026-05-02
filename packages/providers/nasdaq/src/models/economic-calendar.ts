import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqPublicFetch } from "../utils/api";

export const NasdaqEconomicCalendarQueryParams = z.object({
  date: z.string().optional(),
});

export const NasdaqEconomicCalendarData = z.object({
  date: z.string().nullish(),
  event: z.string().nullish(),
  country: z.string().nullish(),
  importance: z.string().nullish(),
  actual: z.string().nullish(),
  forecast: z.string().nullish(),
  previous: z.string().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqEconomicCalendarData = z.infer<typeof NasdaqEconomicCalendarData>;

/**
 * Fetch economic calendar from Nasdaq public API.
 */
export class NasdaqEconomicCalendarFetcher extends AbstractFetcher<
  typeof NasdaqEconomicCalendarQueryParams,
  typeof NasdaqEconomicCalendarData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqEconomicCalendarQueryParams>) {
    return { date: params.date };
  }

  async extractData(
    _query: z.infer<typeof NasdaqEconomicCalendarQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return nasdaqPublicFetch<unknown>("/api/calendar/economics");
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const rows = (data as any)?.data?.rows ?? (data as any)?.data ?? [];

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new EmptyDataError("No economic calendar data found");
    }

    return rows.map((r: Record<string, unknown>) =>
      NasdaqEconomicCalendarData.parse({
        date: (r.date ?? r.releaseDate ?? null) as string | null,
        event: (r.event ?? r.name ?? null) as string | null,
        country: (r.country ?? null) as string | null,
        importance: (r.importance ?? r.impact ?? null) as string | null,
        actual: (r.actual ?? null) as string | null,
        forecast: (r.forecast ?? r.consensus ?? null) as string | null,
        previous: (r.previous ?? null) as string | null,
      }),
    );
  }
}
