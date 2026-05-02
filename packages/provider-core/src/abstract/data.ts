import { z } from "zod";

/**
 * Base data schema that all provider data models extend.
 * Equivalent to OpenBB's Data (Pydantic BaseModel with alias handling).
 * Uses passthrough() to allow extra fields from providers.
 */
export const dataSchema = z.object({}).passthrough();

export type Data = z.infer<typeof dataSchema>;
