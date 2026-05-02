import { z } from "zod";

export const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  currency: z.string().default("USD"),
});

export const UpdatePortfolioSchema = CreatePortfolioSchema.partial();

export const PortfolioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  currency: z.string(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreatePositionSchema = z.object({
  ticker: z.string().transform((s) => s.toUpperCase()),
  name: z.string().optional(),
  assetClass: z.enum(["equity", "etf", "crypto", "forex", "fixed_income", "commodity"]).default("equity"),
  quantity: z.number().positive(),
  avgEntryPrice: z.number().positive(),
  notes: z.string().optional(),
});

export const UpdatePositionSchema = z.object({
  quantity: z.number().positive().optional(),
  avgEntryPrice: z.number().positive().optional(),
  notes: z.string().optional(),
  closedAt: z.coerce.date().optional(),
  isOpen: z.boolean().optional(),
});

export const PositionSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string().nullish(),
  assetClass: z.string(),
  quantity: z.number(),
  avgEntryPrice: z.number(),
  currentPrice: z.number().nullish(),
  costBasis: z.number(),
  marketValue: z.number().nullish(),
  unrealizedPnl: z.number().nullish(),
  unrealizedPnlPercent: z.number().nullish(),
  isOpen: z.boolean(),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date().nullish(),
  notes: z.string().nullish(),
});

export type CreatePortfolioSchema = z.input<typeof CreatePortfolioSchema>;
export type PortfolioSchema = z.output<typeof PortfolioSchema>;
export type CreatePositionSchema = z.input<typeof CreatePositionSchema>;
export type PositionSchema = z.output<typeof PositionSchema>;
