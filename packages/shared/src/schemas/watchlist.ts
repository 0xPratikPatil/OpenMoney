import { z } from "zod";

export const CreateWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
});

export const WatchlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const WatchlistItemSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  note: z.string().nullish(),
  addedAt: z.coerce.date(),
});

export type CreateWatchlistSchema = z.input<typeof CreateWatchlistSchema>;
export type WatchlistSchema = z.output<typeof WatchlistSchema>;
