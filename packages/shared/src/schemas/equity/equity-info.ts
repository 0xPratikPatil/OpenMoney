import { z } from "zod";

export const EquityInfoQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
});

export const EquityInfoData = z.object({
  symbol: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  exchange: z.string().nullish(),
  currency: z.string().nullish(),
  country: z.string().nullish(),
  sector: z.string().nullish(),
  industry: z.string().nullish(),
  marketCap: z.number().int().nullish(),
  sharesOutstanding: z.number().int().nullish(),
  employees: z.number().int().nullish(),
  beta: z.number().nullish(),
  dividendYield: z.number().nullish(),
  website: z.string().nullish(),
  phone: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
});

export type EquityInfoQueryParams = z.input<typeof EquityInfoQueryParams>;
export type EquityInfoData = z.output<typeof EquityInfoData>;
