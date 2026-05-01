import { z } from 'zod';

export const DirectionEnum = z.enum(['bullish', 'bearish', 'neutral']);
export type Direction = z.infer<typeof DirectionEnum>;

export const TimeframeEnum = z.enum(['short_term', 'medium_term', 'long_term']);
export type Timeframe = z.infer<typeof TimeframeEnum>;

export const ActualOutcomeEnum = z.enum(['correct', 'incorrect', 'too_early', 'too_late', 'unresolved']);
export type ActualOutcome = z.infer<typeof ActualOutcomeEnum>;

export const CreatePredictionSchema = z.object({
  title: z.string().min(1).max(200),
  ticker: z.string().min(1).max(10).toUpperCase().optional(),
  direction: DirectionEnum,
  thesis: z.string().min(1).max(5000),
  catalysts: z.string().max(2000).optional(),
  timeframe: TimeframeEnum,
  confidence: z.number().int().min(50).max(99),
  expectedOutcome: z.string().max(500).optional(),
  positionId: z.string().optional(),
});
export type CreatePredictionInput = z.infer<typeof CreatePredictionSchema>;

export const UpdatePredictionSchema = z.object({
  actualOutcome: ActualOutcomeEnum,
  outcomeDate: z.string().datetime().optional(),
  outcomeNotes: z.string().max(2000).optional(),
});
export type UpdatePredictionInput = z.infer<typeof UpdatePredictionSchema>;

export const PredictionSchema = z.object({
  id: z.string(),
  title: z.string(),
  ticker: z.string().nullable(),
  direction: DirectionEnum,
  thesis: z.string(),
  catalysts: z.string().nullable(),
  timeframe: TimeframeEnum,
  confidence: z.number().int(),
  expectedOutcome: z.string().nullable(),
  actualOutcome: ActualOutcomeEnum.nullable(),
  outcomeDate: z.string().datetime().nullable(),
  outcomeNotes: z.string().nullable(),
  userId: z.string(),
  positionId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Prediction = z.infer<typeof PredictionSchema>;

export const PredictionStatsSchema = z.object({
  total: z.number(),
  resolved: z.number(),
  correct: z.number(),
  incorrect: z.number(),
  accuracy: z.number(),
  brierScore: z.number(),
  calibration: z.array(z.object({
    bracket: z.string(),
    count: z.number(),
    accuracy: z.number(),
  })),
});
export type PredictionStats = z.infer<typeof PredictionStatsSchema>;
