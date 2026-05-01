import { z } from 'zod';

export const RiskMetricsSchema = z.object({
  portfolioVaR95: z.number(),
  portfolioVaR99: z.number(),
  portfolioCVaR95: z.number(),
  sharpeRatio: z.number(),
  sortinoRatio: z.number(),
  maxDrawdown: z.number(),
  maxDrawdownDate: z.string().datetime().nullable(),
  beta: z.number().nullable(),
  correlationMatrix: z.array(z.object({
    ticker: z.string(),
    correlations: z.record(z.number()),
  })),
  positionRiskContributions: z.array(z.object({
    ticker: z.string(),
    marginalVaR: z.number(),
    componentVaR: z.number(),
  })),
  asOfDate: z.string().datetime(),
});
export type RiskMetrics = z.infer<typeof RiskMetricsSchema>;

export const RiskSummarySchema = z.object({
  var95: z.number(),
  var99: z.number(),
  sharpe: z.number(),
  sortino: z.number(),
  maxDrawdown: z.number(),
  beta: z.number().nullable(),
});
export type RiskSummary = z.infer<typeof RiskSummarySchema>;
