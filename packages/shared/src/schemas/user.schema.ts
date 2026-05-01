import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const UserPreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  defaultPortfolioId: z.string().optional(),
  riskFreeRate: z.number().default(5),
  benchmarkTicker: z.string().default('SPY'),
  emailNotifications: z.boolean().default(true),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
