import { z } from 'zod';

export const AssetClassEnum = z.enum(['equity', 'etf', 'crypto', 'forex', 'fixed_income', 'commodity']);
export type AssetClass = z.infer<typeof AssetClassEnum>;

export const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  currency: z.string().length(3).default('USD'),
  isDefault: z.boolean().default(false),
});
export type CreatePortfolioInput = z.infer<typeof CreatePortfolioSchema>;

export const UpdatePortfolioSchema = CreatePortfolioSchema.partial();
export type UpdatePortfolioInput = z.infer<typeof UpdatePortfolioSchema>;

export const CreatePositionSchema = z.object({
  ticker: z.string().min(1).max(10).toUpperCase(),
  name: z.string().max(200).optional(),
  assetClass: AssetClassEnum.default('equity'),
  quantity: z.number().positive(),
  avgEntryPrice: z.number().positive(),
  openedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;

export const UpdatePositionSchema = z.object({
  quantity: z.number().positive().optional(),
  avgEntryPrice: z.number().positive().optional(),
  currentPrice: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
  isOpen: z.boolean().optional(),
  closedAt: z.string().datetime().optional(),
});
export type UpdatePositionInput = z.infer<typeof UpdatePositionSchema>;

export const PortfolioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  currency: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Portfolio = z.infer<typeof PortfolioSchema>;

export const PositionSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string().nullable(),
  assetClass: z.string(),
  quantity: z.number(),
  avgEntryPrice: z.number(),
  currentPrice: z.number().nullable(),
  costBasis: z.number(),
  marketValue: z.number().nullable(),
  unrealizedPnl: z.number().nullable(),
  unrealizedPnlPercent: z.number().nullable(),
  isOpen: z.boolean(),
  openedAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Position = z.infer<typeof PositionSchema>;

export const PortfolioSummarySchema = z.object({
  totalValue: z.number(),
  totalCostBasis: z.number(),
  totalReturn: z.number(),
  totalReturnPercent: z.number(),
  dayPnl: z.number(),
  dayPnlPercent: z.number(),
  positionCount: z.number(),
  allocationByAsset: z.array(z.object({
    assetClass: z.string(),
    percent: z.number(),
  })),
});
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
