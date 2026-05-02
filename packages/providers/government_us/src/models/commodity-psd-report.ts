import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { usdaFetch } from "../utils/api";

export const GovUSCommodityPsdReportQueryParams = z.object({
  commodity: z.string().optional(),
  year: z.coerce.number().int().optional(),
});

export const GovUSCommodityPsdReportData = z.object({
  reportDate: z.string().nullish(),
  commodity: z.string().nullish(),
  country: z.string().nullish(),
  data: z.string().nullish(),
  provider: z.literal("government_us").default("government_us"),
});

export type GovUSCommodityPsdReportData = z.infer<typeof GovUSCommodityPsdReportData>;

/**
 * Fetch full PSD report for commodities from USDA.
 */
export class GovUSCommodityPsdReportFetcher extends AbstractFetcher<
  typeof GovUSCommodityPsdReportQueryParams,
  typeof GovUSCommodityPsdReportData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof GovUSCommodityPsdReportQueryParams>) {
    return {
      commodity: params.commodity,
      year: params.year,
    };
  }

  async extractData(
    _query: z.infer<typeof GovUSCommodityPsdReportQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return usdaFetch<unknown>("/psd-online/api/reports");
  }

  async transformData(raw: unknown) {
    const data = raw as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      throw new EmptyDataError("No PSD report data found");
    }

    return data.map((r) =>
      GovUSCommodityPsdReportData.parse({
        reportDate: (r.reportDate ?? r.report_date ?? null) as string | null,
        commodity: (r.commodity ?? r.commodityName ?? null) as string | null,
        country: (r.country ?? r.countryName ?? null) as string | null,
        data: (r.data ?? JSON.stringify(r)) as string | null,
      }),
    );
  }
}
