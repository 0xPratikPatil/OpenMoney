import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { teFetch } from "../utils/api";
import type { TECalendarEvent } from "../utils/api";

export const TECalendarData = z.object({
  calendarId: z.number(),
  date: z.string(),
  country: z.string(),
  category: z.string().nullish(),
  event: z.string().nullish(),
  reference: z.string().nullish(),
  actual: z.union([z.number(), z.string()]).nullish(),
  previous: z.union([z.number(), z.string()]).nullish(),
  forecast: z.union([z.number(), z.string()]).nullish(),
  importance: z.number().nullish(),
  provider: z.literal("tradingeconomics").default("tradingeconomics"),
});

export type TECalendarData = z.infer<typeof TECalendarData>;

export const TECalendarQueryParams = z.object({
  country: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type TECalendarQueryParams = z.infer<typeof TECalendarQueryParams>;

/**
 * Fetch economic calendar events from Trading Economics.
 */
export class TECalendarFetcher extends AbstractFetcher<
  typeof TECalendarQueryParams,
  typeof TECalendarData
> {
  requireCredentials = true;

  async transformQuery(
    params: z.input<typeof TECalendarQueryParams>,
  ) {
    return {
      country: params.country,
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  async extractData(
    query: z.infer<typeof TECalendarQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials.tradingeconomics_api_key;
    let path = "/calendar";
    if (query.country) {
      path += `/country/${query.country}`;
    }
    return teFetch<TECalendarEvent[]>(path, apiKey, {
      d1: query.startDate,
      d2: query.endDate,
    });
  }

  async transformData(
    raw: unknown,
  ) {
    const events = raw as TECalendarEvent[];
    if (!events || events.length === 0) {
      throw new EmptyDataError("No Trading Economics calendar events returned");
    }
    return events.map((e) =>
      TECalendarData.parse({
        calendarId: e.CalendarId,
        date: e.Date,
        country: e.Country,
        category: e.Category ?? null,
        event: e.Event ?? null,
        reference: e.Reference ?? null,
        actual: e.Actual != null ? (typeof e.Actual === "number" ? e.Actual : e.Actual) : null,
        previous: e.Previous != null ? (typeof e.Previous === "number" ? e.Previous : e.Previous) : null,
        forecast: e.Forecast != null ? (typeof e.Forecast === "number" ? e.Forecast : e.Forecast) : null,
        importance: e.Importance ?? null,
      }),
    );
  }
}
