import { z } from "zod";

export const EquityHistoricalQueryParams = z.object({
  symbol: z.string().transform((s) => s.toUpperCase()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  interval: z
    .enum(["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"])
    .default("1d"),
});

export const EquityHistoricalData = z.object({
  date: z.coerce.date(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().nullish(),
  vwap: z.number().nullish(),
  adjClose: z.number().nullish(),
  splitRatio: z.number().nullish(),
  dividend: z.number().nullish(),
});

export type EquityHistoricalQueryParams = z.input<typeof EquityHistoricalQueryParams>;
export type EquityHistoricalData = z.output<typeof EquityHistoricalData>;
