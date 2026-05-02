import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { govPublicFetch } from "../utils/api";

export const GovUSWeatherBulletinDownloadQueryParams = z.object({
  url: z.string().url().optional(),
  date: z.string().optional(),
  type: z.string().optional(),
});

export const GovUSWeatherBulletinDownloadData = z.object({
  url: z.string().nullish(),
  date: z.string().nullish(),
  type: z.string().nullish(),
  provider: z.literal("government_us").default("government_us"),
});

export type GovUSWeatherBulletinDownloadData = z.infer<typeof GovUSWeatherBulletinDownloadData>;

/**
 * Download full weather bulletin file from US government sources.
 */
export class GovUSWeatherBulletinDownloadFetcher extends AbstractFetcher<
  typeof GovUSWeatherBulletinDownloadQueryParams,
  typeof GovUSWeatherBulletinDownloadData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof GovUSWeatherBulletinDownloadQueryParams>) {
    return {
      url: params.url,
      date: params.date,
      type: params.type,
    };
  }

  async extractData(
    query: z.infer<typeof GovUSWeatherBulletinDownloadQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const fetchUrl = query.url ?? "https://www.weather.gov/documentation/current-weather";
    return govPublicFetch<string>(fetchUrl);
  }

  async transformData(raw: unknown) {
    const content = raw as string;
    if (!content || content.length < 50) throw new EmptyDataError("Empty weather bulletin content");

    return [
      GovUSWeatherBulletinDownloadData.parse({
        url: "",
        date: null,
        type: "weather_bulletin",
      }),
    ];
  }
}
