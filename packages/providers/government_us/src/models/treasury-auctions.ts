import { z } from "zod";
import { AbstractFetcher, EmptyDataError } from "@openmoney/provider-core";
import { treasuryFetch } from "../utils/api";

export const GovUSTreasuryAuctionsQueryParams = z.object({
  securityType: z.string().optional(),
});

export const GovUSTreasuryAuctionsData = z.object({
  date: z.string().nullish(),
  securityType: z.string().nullish(),
  cusip: z.string().nullish(),
  price: z.number().nullish(),
  yield: z.number().nullish(),
  totalAccepted: z.number().nullish(),
  provider: z.literal("government_us").default("government_us"),
});

export type GovUSTreasuryAuctionsData = z.infer<typeof GovUSTreasuryAuctionsData>;

/**
 * Fetch US Treasury auction results from TreasuryDirect.
 */
export class GovUSTreasuryAuctionsFetcher extends AbstractFetcher<
  typeof GovUSTreasuryAuctionsQueryParams,
  typeof GovUSTreasuryAuctionsData
> {
  requireCredentials = false;

  async transformQuery(params: z.input<typeof GovUSTreasuryAuctionsQueryParams>) {
    return { securityType: params.securityType };
  }

  async extractData(
    _query: z.infer<typeof GovUSTreasuryAuctionsQueryParams>,
    _credentials: Record<string, string>,
  ): Promise<unknown> {
    return treasuryFetch<unknown>("/securities/auctioned", { format: "json" });
  }

  async transformData(raw: unknown): Promise<GovUSTreasuryAuctionsData[]> {
    const data = raw as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      throw new EmptyDataError("No treasury auction data found");
    }

    return data.map((r) =>
      GovUSTreasuryAuctionsData.parse({
        date: (r.auctionDate ?? r.auction_date ?? null) as string | null,
        securityType: (r.securityType ?? r.security_type ?? null) as string | null,
        cusip: (r.cusip ?? null) as string | null,
        price: (r.price ?? r.averagePrice ?? null) as number | null,
        yield: (r.yieldData ?? r.averageYield ?? null) as number | null,
        totalAccepted: (r.totalAccepted ?? r.total_accepted ?? null) as number | null,
      }),
    );
  }
}
