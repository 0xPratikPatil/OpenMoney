import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { treasuryFetch } from "../utils/api";

export const GovUSTreasuryPricesQueryParams = z.object({
  cusip: z.string().optional(),
});

export const GovUSTreasuryPricesData = z.object({
  cusip: z.string().nullish(),
  price: z.number().nullish(),
  yield: z.number().nullish(),
  maturity: z.string().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  provider: z.literal("government_us").default("government_us"),
});

export type GovUSTreasuryPricesData = z.infer<typeof GovUSTreasuryPricesData>;

/**
 * Fetch US Treasury security prices from TreasuryDirect.
 */
export class GovUSTreasuryPricesFetcher extends AbstractFetcher<
  typeof GovUSTreasuryPricesQueryParams,
  typeof GovUSTreasuryPricesData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof GovUSTreasuryPricesQueryParams>) {
    return { cusip: params.cusip };
  }

  async extractData(
    _query: z.infer<typeof GovUSTreasuryPricesQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return treasuryFetch<unknown>("/securities/searched", { format: "json" });
  }

  async transformData(raw: unknown): Promise<GovUSTreasuryPricesData[]> {
    const data = raw as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      throw new EmptyDataError("No treasury price data found");
    }

    return data.map((r) =>
      GovUSTreasuryPricesData.parse({
        cusip: (r.cusip ?? null) as string | null,
        price: (r.price ?? r.bidPrice ?? null) as number | null,
        yield: (r.yieldData ?? r.maturityYield ?? null) as number | null,
        maturity: (r.maturityDate ?? r.maturity_date ?? null) as string | null,
        bid: (r.bid ?? r.bidPrice ?? null) as number | null,
        ask: (r.ask ?? r.askPrice ?? null) as number | null,
      }),
    );
  }
}
