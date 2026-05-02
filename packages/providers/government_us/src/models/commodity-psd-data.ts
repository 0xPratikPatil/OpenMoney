import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { usdaFetch } from "../utils/api";

export const GovUSCommodityPsdDataQueryParams = z.object({
  commodity: z.string().optional(),
  country: z.string().optional(),
  year: z.coerce.number().int().optional(),
});

export const GovUSCommodityPsdDataData = z.object({
  date: z.string().nullish(),
  commodity: z.string().nullish(),
  country: z.string().nullish(),
  production: z.number().nullish(),
  supply: z.number().nullish(),
  distribution: z.number().nullish(),
  provider: z.literal("government_us").default("government_us"),
});

export type GovUSCommodityPsdDataData = z.infer<typeof GovUSCommodityPsdDataData>;

/**
 * Fetch PSD (Production, Supply, Distribution) data for commodities from USDA.
 */
export class GovUSCommodityPsdDataFetcher extends AbstractFetcher<
  typeof GovUSCommodityPsdDataQueryParams,
  typeof GovUSCommodityPsdDataData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof GovUSCommodityPsdDataQueryParams>) {
    return {
      commodity: params.commodity,
      country: params.country,
      year: params.year,
    };
  }

  async extractData(
    _query: z.infer<typeof GovUSCommodityPsdDataQueryParams>,
    _credentials: Record<string, string>,
  ) {
    // USDA PSD data available via their public API
    return usdaFetch<unknown>("/psd-online/api/commodities");
  }

  async transformData(raw: unknown) {
    const data = raw as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      throw new EmptyDataError("No PSD commodity data found");
    }

    return data.map((r) =>
      GovUSCommodityPsdDataData.parse({
        date: (r.date ?? r.marketingYear ?? null) as string | null,
        commodity: (r.commodity ?? r.commodityName ?? null) as string | null,
        country: (r.country ?? r.countryName ?? null) as string | null,
        production: (r.production ?? r.productionValue ?? null) as number | null,
        supply: (r.supply ?? r.totalSupply ?? null) as number | null,
        distribution: (r.distribution ?? r.totalDistribution ?? null) as number | null,
      }),
    );
  }
}
