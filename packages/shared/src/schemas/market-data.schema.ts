import { z } from 'zod';

export const MarketDataInterval = z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']);
export type MarketDataInterval = z.infer<typeof MarketDataInterval>;

export const MarketDataSchema = z.object({
  time: z.string().datetime(),
  ticker: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().nullable(),
  vwap: z.number().nullable(),
  interval: MarketDataInterval,
  source: z.string(),
});
export type MarketData = z.infer<typeof MarketDataSchema>;

export const PriceQuoteSchema = z.object({
  ticker: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number().nullable(),
  timestamp: z.string().datetime(),
  source: z.string(),
});
export type PriceQuote = z.infer<typeof PriceQuoteSchema>;

export const MarketDataQuerySchema = z.object({
  ticker: z.string().min(1).max(10).toUpperCase(),
  interval: MarketDataInterval.default('1d'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});
export type MarketDataQuery = z.infer<typeof MarketDataQuerySchema>;
