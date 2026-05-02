import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { nasdaqFetch, extractDatatable } from "../utils/api";

export const NasdaqCompanyFilingsQueryParams = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  count: z.coerce.number().int().min(1).max(100).default(20),
});

export const NasdaqCompanyFilingsData = z.object({
  date: z.string().nullish(),
  formType: z.string().nullish(),
  description: z.string().nullish(),
  url: z.string().nullish(),
  provider: z.literal("nasdaq").default("nasdaq"),
});

export type NasdaqCompanyFilingsData = z.infer<typeof NasdaqCompanyFilingsData>;

/**
 * Fetch company filings from Nasdaq Data Link (SHARADER/EC2).
 */
export class NasdaqCompanyFilingsFetcher extends AbstractFetcher<
  typeof NasdaqCompanyFilingsQueryParams,
  typeof NasdaqCompanyFilingsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof NasdaqCompanyFilingsQueryParams>) {
    return {
      symbol: params.symbol.toUpperCase(),
      count: params.count ?? 20,
    };
  }

  async extractData(
    query: z.infer<typeof NasdaqCompanyFilingsQueryParams>,
    credentials: Record<string, string>,
  ) {
    const apiKey = credentials["nasdaq_api_key"];
    const raw = await nasdaqFetch<unknown>(
      "/datatables/SHARADER/EC2",
      { ticker: query.symbol },
      apiKey,
    );
    return raw;
  }

  async transformData(raw: unknown) {
    const rows = extractDatatable(raw);
    if (rows.length === 0) throw new EmptyDataError("No company filings found");

    return rows.map((r) =>
      NasdaqCompanyFilingsData.parse({
        date: (r.date ?? r.filing_date ?? null) as string | null,
        formType: (r.form_type ?? r.formType ?? null) as string | null,
        description: (r.description ?? r.title ?? null) as string | null,
        url: (r.url ?? r.filing_url ?? null) as string | null,
      }),
    );
  }
}
