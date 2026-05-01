import { z } from 'zod';

export const ActionEnum = z.enum(['hold', 'add', 'reduce', 'exit', 'rebalance', 'hedge']);
export type Action = z.infer<typeof ActionEnum>;

export const SignalTypeEnum = z.enum(['recommendation', 'alert', 'forecast']);
export type SignalType = z.infer<typeof SignalTypeEnum>;

export const SignalSchema = z.object({
  id: z.string(),
  ticker: z.string().nullable(),
  portfolioId: z.string().nullable(),
  type: SignalTypeEnum,
  action: ActionEnum.nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  title: z.string(),
  description: z.string(),
  reasoning: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type Signal = z.infer<typeof SignalSchema>;

export const ActionRecommendationSchema = z.object({
  id: z.string(),
  ticker: z.string().nullable(),
  portfolioId: z.string(),
  action: ActionEnum,
  confidence: z.number().min(0).max(1),
  title: z.string(),
  reasoning: z.array(z.string()),
  triggeredBy: z.array(z.string()),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type ActionRecommendation = z.infer<typeof ActionRecommendationSchema>;
