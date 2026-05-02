import { z } from "zod";
import { AbstractFetcher } from "@openmoney/provider-core";
import { fetchInsiderTrading } from "../utils/api";

export const TmxInsiderTradingData = z.object({
  date: z.string().nullish(),
  insiderName: z.string().nullish(),
  relationship: z.string().nullish(),
  transactionType: z.string().nullish(),
  quantity: z.number().nullish(),
  price: z.number().nullish(),
  value: z.number().nullish(),
  provider: z.literal("tmx").default("tmx"),
});

export type TmxInsiderTradingData = z.infer<typeof TmxInsiderTradingData>;

export const TmxInsiderTradingQueryParams = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .transform((s) => s.toUpperCase()),
});

export type TmxInsiderTradingQueryParams = z.infer<typeof TmxInsiderTradingQueryParams>;

/**
 * Fetcher for insider trading transactions from TMX Money.
 * Endpoint: GET /api/company/{symbol}/insider-transactions
 */
export class TmxInsiderTradingFetcher extends AbstractFetcher<
  typeof TmxInsiderTradingQueryParams,
  typeof TmxInsiderTradingData
> {
  requireCredentials = false;

  async transformQuery(
    params: z.input<typeof TmxInsiderTradingQueryParams>,
  ) {
    return { symbol: params.symbol.toUpperCase() };
  }

  async extractData(
    query: z.infer<typeof TmxInsiderTradingQueryParams>,
    _credentials: Record<string, string>,
  ) {
    return fetchInsiderTrading(query.symbol);
  }

  async transformData(raw: unknown) {
    const rows = raw as Array<Record<string, unknown>>;
    return rows.map((row) =>
      TmxInsiderTradingData.parse({
        date: row.date ?? row.transactionDate,
        insiderName: row.insiderName ?? row.name,
        relationship: row.relationship ?? row.position,
        transactionType: row.transactionType ?? row.type,
        quantity: row.quantity ?? row.shares,
        price: row.price,
        value: row.value ?? row.totalValue,
      }),
    );
  }
}
