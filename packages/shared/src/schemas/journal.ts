import { z } from "zod";

export const CreatePredictionSchema = z.object({
  title: z.string().min(1).max(200),
  ticker: z.string().transform((s) => s.toUpperCase()).optional(),
  direction: z.enum(["bullish", "bearish", "neutral"]),
  thesis: z.string().min(1),
  catalysts: z.string().optional(),
  timeframe: z.enum(["short_term", "medium_term", "long_term"]),
  confidence: z.number().int().min(50).max(99),
  expectedOutcome: z.string().optional(),
  positionId: z.string().optional(),
});

export const UpdatePredictionSchema = z.object({
  actualOutcome: z.enum(["correct", "incorrect", "too_early", "too_late"]).optional(),
  outcomeDate: z.coerce.date().optional(),
  outcomeNotes: z.string().optional(),
});

export const PredictionSchema = z.object({
  id: z.string(),
  title: z.string(),
  ticker: z.string().nullish(),
  direction: z.string(),
  thesis: z.string(),
  catalysts: z.string().nullish(),
  timeframe: z.string(),
  confidence: z.number(),
  expectedOutcome: z.string().nullish(),
  actualOutcome: z.string().nullish(),
  outcomeDate: z.coerce.date().nullish(),
  outcomeNotes: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const PredictionStatsSchema = z.object({
  totalPredictions: z.number(),
  resolvedPredictions: z.number(),
  accuracy: z.number().nullish(),
  brierScore: z.number().nullish(),
  calibrationData: z.array(z.object({
    confidenceBucket: z.number(),
    actualAccuracy: z.number(),
    count: z.number(),
  })),
});

export type CreatePredictionSchema = z.input<typeof CreatePredictionSchema>;
export type PredictionSchema = z.output<typeof PredictionSchema>;
export type PredictionStatsSchema = z.output<typeof PredictionStatsSchema>;
