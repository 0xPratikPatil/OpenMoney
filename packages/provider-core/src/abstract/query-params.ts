import { z } from "zod";

/**
 * Base query parameters schema that all provider query params extend.
 * Equivalent to OpenBB's QueryParams (Pydantic BaseModel).
 * Uses passthrough() to allow extra provider-specific fields.
 */
export const queryParamsSchema = z.object({}).passthrough();

export type QueryParams = z.infer<typeof queryParamsSchema>;
