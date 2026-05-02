import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { econdbFetch } from "../utils/api";
import type { EconDBCountry } from "../utils/api";

export const EconDBCountryListData = z.object({
  countryCode: z.string(),
  countryName: z.string(),
  currency: z.string().nullish(),
  region: z.string().nullish(),
  provider: z.literal("econdb").default("econdb"),
});

export type EconDBCountryListData = z.infer<typeof EconDBCountryListData>;

export const EconDBCountryListQueryParams = z.object({}).strict();

export type EconDBCountryListQueryParams = z.infer<typeof EconDBCountryListQueryParams>;

/**
 * Fetch the list of available countries from EconDB.
 */
export class EconDBCountryListFetcher extends AbstractFetcher<
  typeof EconDBCountryListQueryParams,
  typeof EconDBCountryListData
> {
  requireCredentials = true;

  async transformQuery(
    _params: z.input<typeof EconDBCountryListQueryParams>,
  ): Promise<z.input<typeof EconDBCountryListQueryParams>> {
    return {};
  }

  async extractData(
    _query: z.infer<typeof EconDBCountryListQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const apiKey = credentials.econdb_api_key;
    return econdbFetch<EconDBCountry[]>("/api/countries", apiKey);
  }

  async transformData(
    raw: unknown,
  ): Promise<EconDBCountryListData[]> {
    const countries = raw as EconDBCountry[];
    if (!countries || countries.length === 0) {
      throw new EmptyDataError("No countries returned from EconDB");
    }
    return countries.map((c) =>
      EconDBCountryListData.parse({
        countryCode: c.country_code,
        countryName: c.country_name,
        currency: c.currency ?? null,
        region: c.region ?? null,
      }),
    );
  }
}
