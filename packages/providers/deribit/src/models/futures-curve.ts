import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchDeribit } from "../utils/api";

export const DeribitFuturesCurveData = z.object({
  symbol: z.string(),
  expiration: z.string().nullish(),
  price: z.number().nullish(),
  provider: z.literal("deribit").default("deribit"),
});

export type DeribitFuturesCurveData = z.infer<typeof DeribitFuturesCurveData>;

export const DeribitFuturesCurveQueryParams = z.object({
  currency: z.enum(["BTC", "ETH", "SOL", "USDC"]).default("BTC"),
});

export type DeribitFuturesCurveQueryParams = z.infer<typeof DeribitFuturesCurveQueryParams>;

/**
 * Fetcher for futures curve (term structure) from Deribit.
 * Gets all active futures for a currency and returns their prices by expiration.
 */
export class DeribitFuturesCurveFetcher extends AbstractFetcher<
  typeof DeribitFuturesCurveQueryParams,
  typeof DeribitFuturesCurveData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof DeribitFuturesCurveQueryParams>,
  ): Promise<z.input<typeof DeribitFuturesCurveQueryParams>> {
    const currency = (params.currency ?? "BTC").toUpperCase() as "BTC" | "ETH" | "SOL" | "USDC";
    return { currency };
  }

  async extractData(
    query: z.infer<typeof DeribitFuturesCurveQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    // Get all active futures for this currency
    const instruments = await fetchDeribit<any[]>("get_instruments", {
      currency: query.currency,
      kind: "future",
      expired: false,
    });

    if (instruments.length === 0) {
      throw new EmptyDataError(`No futures found for ${query.currency}`);
    }

    // Get current prices for futures instruments
    const instrumentNames = instruments.map((i: any) => i.instrument_name);

    // Fetch book summaries for each instrument (limit to ~10)
    const curveResults: Array<{ symbol: string; expiration: string | null; price: number | null }> = [];
    const limited = instrumentNames.slice(0, 10);

    for (const name of limited) {
      try {
        const summaries = await fetchDeribit<any[]>("get_book_summary_by_instrument", {
          instrument_name: name,
        });
        const summary = summaries?.[0];
        if (summary) {
          curveResults.push({
            symbol: name,
            expiration: summary.expiration_timestamp
              ? new Date(summary.expiration_timestamp as number * 1000).toISOString()
              : null,
            price: summary.last_price ?? summary.mark_price ?? null,
          });
        }
      } catch {
        // Skip instruments that fail
        continue;
      }
    }

    return curveResults;
  }

  async transformData(
    raw: unknown,
  ): Promise<DeribitFuturesCurveData[]> {
    const results = raw as Array<{ symbol: string; expiration: string | null; price: number | null }>;
    if (results.length === 0) throw new EmptyDataError("No futures curve data returned");

    return results.map((r) =>
      DeribitFuturesCurveData.parse({
        symbol: r.symbol,
        expiration: r.expiration,
        price: r.price,
      }),
    );
  }
}
