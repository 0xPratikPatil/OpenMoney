import { z } from 'zod';

export const DataSourceEnum = z.enum(['polygon', 'alpha_vantage', 'yfinance', 'fred']);
export type DataSource = z.infer<typeof DataSourceEnum>;

export const AdapterConfigSchema = z.object({
  source: DataSourceEnum,
  enabled: z.boolean().default(true),
  apiKey: z.string().optional(),
  rateLimitMs: z.number().int().positive().default(2000),
  priority: z.number().int().min(1).max(10).default(5),
});
export type AdapterConfig = z.infer<typeof AdapterConfigSchema>;

export const IngestionJobSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  interval: z.string(),
  source: DataSourceEnum,
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  error: z.string().nullable(),
});
export type IngestionJob = z.infer<typeof IngestionJobSchema>;

export const NormalizedTickSchema = z.object({
  time: z.string().datetime(),
  ticker: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().nullable(),
  vwap: z.number().nullable(),
  interval: z.string(),
  source: z.string(),
});
export type NormalizedTick = z.infer<typeof NormalizedTickSchema>;
