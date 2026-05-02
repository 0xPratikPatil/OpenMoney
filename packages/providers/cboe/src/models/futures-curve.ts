import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { fetchFuturesRoots, fetchQuote } from "../utils/api";

export const CboeFuturesCurveData = z.object({
  symbol: z.string(),
  expiration: z.string(),
  price: z.number().nullish(),
  change: z.number().nullish(),
  volume: z.number().nullish(),
  openInterest: z.number().nullish(),
  provider: z.literal("cboe").default("cboe"),
});

export type CboeFuturesCurveData = z.infer<typeof CboeFuturesCurveData>;

export const CboeFuturesCurveQueryParams = z.object({
  root: z.string().min(1, "Futures root symbol is required").transform((s) => s.toUpperCase()),
});

export type CboeFuturesCurveQueryParams = z.infer<typeof CboeFuturesCurveQueryParams>;

/**
 * Fetcher for futures curve data from CBOE.
 */
export class CboeFuturesCurveFetcher extends AbstractFetcher<
  typeof CboeFuturesCurveQueryParams,
  typeof CboeFuturesCurveData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof CboeFuturesCurveQueryParams>,
  ) {
    return { root: params.root.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof CboeFuturesCurveQueryParams>,
    _credentials: Record<string, string>,
  ) {
    const roots = await fetchFuturesRoots();
    const rootData = roots.find(
      (r: any) => (r.root ?? r.symbol ?? "").toUpperCase() === query.root,
    );

    if (!rootData) {
      // Get all futures roots to understand available roots
      const allRoots = roots.map((r: any) => r.root ?? r.symbol).join(", ");
      throw new EmptyDataError(
        `Futures root "${query.root}" not found. Available roots: ${allRoots}`,
      );
    }

    // Fetch the futures chain for this root
    const chainSymbol = `/${query.root}`;
    const chainData = await fetchQuote(chainSymbol);
    return chainData ?? [];
  }

  async transformData(
    raw: unknown,
  ) {
    const data = raw as any;
    const futures = data?.data ?? [];

    if (futures.length === 0) throw new EmptyDataError("No futures curve data returned");

    return futures.map((f: Record<string, unknown>) =>
      CboeFuturesCurveData.parse({
        symbol: f.symbol ?? f.future_symbol,
        expiration: f.expiration ?? f.expiry ?? f.contract_date ?? "",
        price: f.current_price ?? f.price ?? null,
        change: f.change ?? null,
        volume: f.volume ?? null,
        openInterest: f.open_interest ?? f.oi ?? null,
      }),
    );
  }
}
