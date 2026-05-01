import { z } from 'zod';

export const CreateWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
  isDefault: z.boolean().default(false),
});
export type CreateWatchlistInput = z.infer<typeof CreateWatchlistSchema>;

export const AddWatchlistItemSchema = z.object({
  ticker: z.string().min(1).max(10).toUpperCase(),
  note: z.string().max(500).optional(),
});
export type AddWatchlistItemInput = z.infer<typeof AddWatchlistItemSchema>;

export const WatchlistItemSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  note: z.string().nullable(),
  addedAt: z.string().datetime(),
});
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;

export const WatchlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(WatchlistItemSchema).optional(),
});
export type Watchlist = z.infer<typeof WatchlistSchema>;
