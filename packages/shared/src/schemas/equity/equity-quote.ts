import { z } from "zod";

export const EquityQuoteQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const EquityQuoteData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  assetType: z.string().nullish(),
  exchange: z.string().nullish(),
  bid: z.number().nullish(),
  ask: z.number().nullish(),
  lastPrice: z.number().nullish(),
  open: z.number().nullish(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  prevClose: z.number().nullish(),
  volume: z.number().nullish(),
  yearHigh: z.number().nullish(),
  yearLow: z.number().nullish(),
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
  currency: z.string().nullish(),
});

export type EquityQuoteQueryParams = z.input<typeof EquityQuoteQueryParams>;
export type EquityQuoteData = z.output<typeof EquityQuoteData>;
