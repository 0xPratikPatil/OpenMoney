import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { govPublicFetch } from "../utils/api";

export const GovUSWeatherBulletinQueryParams = z.object({
  station: z.string().optional(),
  date: z.string().optional(),
});

export const GovUSWeatherBulletinData = z.object({
  date: z.string().nullish(),
  station: z.string().nullish(),
  temperature: z.number().nullish(),
  precipitation: z.number().nullish(),
  provider: z.literal("government_us").default("government_us"),
});

export type GovUSWeatherBulletinData = z.infer<typeof GovUSWeatherBulletinData>;

/**
 * Fetch US weather bulletin data from National Weather Service.
 */
export class GovUSWeatherBulletinFetcher extends AbstractFetcher<
  typeof GovUSWeatherBulletinQueryParams,
  typeof GovUSWeatherBulletinData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof GovUSWeatherBulletinQueryParams>) {
    return {
      station: params.station,
      date: params.date,
    };
  }

  async extractData(
    _query: z.infer<typeof GovUSWeatherBulletinQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // National Weather Service API
    return govPublicFetch<unknown>("https://api.weather.gov/alerts/active?area=US");
  }

  async transformData(raw: unknown) {
    const data = raw as Record<string, unknown>;
    const features = (data as any)?.features ?? [];

    if (!Array.isArray(features) || features.length === 0) {
      throw new EmptyDataError("No weather bulletin data found");
    }

    return features.map((f: Record<string, unknown>) => {
      const props = (f.properties as Record<string, unknown>) ?? {};
      return GovUSWeatherBulletinData.parse({
        date: (props.effective ?? props.sent ?? null) as string | null,
        station: null,
        temperature: null,
        precipitation: null,
      });
    });
  }
}
