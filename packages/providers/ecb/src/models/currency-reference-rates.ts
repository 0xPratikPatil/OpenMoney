import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchEcbData, parseObservations } from "../utils/api";

export const EcbCurrencyReferenceRatesData = z.object({
  date: z.string(),
  currency: z.string(),
  rate: z.number().nullish(),
  provider: z.literal("ecb").default("ecb"),
});

export type EcbCurrencyReferenceRatesData = z.infer<typeof EcbCurrencyReferenceRatesData>;

export const EcbCurrencyReferenceRatesQueryParams = z.object({
  currencies: z.string().optional(), // comma-separated, e.g. "USD,GBP,JPY"
});

export type EcbCurrencyReferenceRatesQueryParams = z.infer<typeof EcbCurrencyReferenceRatesQueryParams>;

/**
 * Fetcher for ECB euro foreign exchange reference rates.
 * Uses SDMX wildcard (.) to fetch all available currencies in one request.
 */
export class EcbCurrencyReferenceRatesFetcher extends AbstractFetcher<
  typeof EcbCurrencyReferenceRatesQueryParams,
  typeof EcbCurrencyReferenceRatesData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof EcbCurrencyReferenceRatesQueryParams>,
  ): Promise<z.input<typeof EcbCurrencyReferenceRatesQueryParams>> {
    return { currencies: params.currencies };
  }

  async extractData(
    query: z.infer<typeof EcbCurrencyReferenceRatesQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    // Use wildcard for currency to get all available rates
    const dataflow = "EXR/D..EUR.SP00.A";
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
    const params: Record<string, string> = {
      startPeriod: sevenDaysAgo.toISOString().slice(0, 10),
    };

    const json = await fetchEcbData(dataflow, params);
    return { json, filterCurrencies: query.currencies };
  }

  async transformData(
    raw: unknown,
  ): Promise<EcbCurrencyReferenceRatesData[]> {
    const { json, filterCurrencies } = raw as any;
    const parsed = parseObservations(json);

    if (parsed.length === 0) throw new EmptyDataError("No currency rate data returned");

    // Group by currency and get latest rate for each
    const byCurrency = new Map<string, Array<Record<string, string | number | null>>>();

    for (const record of parsed) {
      const currency = (record.CURRENCY ?? record.currency ?? "") as string;
      if (!currency) continue;
      if (filterCurrencies) {
        const allowed = (filterCurrencies as string).split(",").map((c: string) => c.trim().toUpperCase());
        if (!allowed.includes(currency)) continue;
      }
      if (!byCurrency.has(currency)) {
        byCurrency.set(currency, []);
      }
      byCurrency.get(currency)!.push(record);
    }

    const results: EcbCurrencyReferenceRatesData[] = [];

    for (const [currency, records] of byCurrency) {
      // Get the latest (last) record for this currency
      const latest = records[records.length - 1];
      if (!latest) continue;

      results.push(
        EcbCurrencyReferenceRatesData.parse({
          date: (latest.TIME_PERIOD ?? latest.time_period ?? "") as string,
          currency,
          rate: latest.value as number | null,
        }),
      );
    }

    if (results.length === 0) throw new EmptyDataError("No currency rates could be parsed");
    return results;
  }
}
