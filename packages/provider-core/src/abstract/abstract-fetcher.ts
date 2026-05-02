import type { z } from "zod";
import { queryParamsSchema } from "./query-params";
import { dataSchema } from "./data";

/**
 * Fetcher error types matching OpenBB's error hierarchy.
 */
export class ProviderError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "ProviderError";
  }
}

export class EmptyDataError extends ProviderError {
  constructor(message = "No data returned from provider") {
    super(message, "EMPTY_DATA");
    this.name = "EmptyDataError";
  }
}

export class UnauthorizedError extends ProviderError {
  constructor(message = "Invalid or missing API credentials") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class RateLimitError extends ProviderError {
  constructor(message = "Rate limit exceeded", public readonly retryAfter?: number) {
    super(message, "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

/**
 * AnnotatedResult wrapper (port of OpenBB's AnnotatedResult).
 */
export interface AnnotatedResult<T> {
  result: T;
  metadata?: Record<string, unknown>;
}

/**
 * AbstractFetcher — the core TET (Transform-Extract-Transform) pattern.
 *
 * Direct port of OpenBB's Fetcher[Q, R] generic class.
 *
 * Lifecycle:
 *   1. transformQuery(params) — normalize user params, apply defaults
 *   2. extractData(query, credentials) — fetch raw data from provider API
 *   3. transformData(raw, query) — normalize output to standard schema
 */
export abstract class AbstractFetcher<
  TQueryParams extends z.ZodTypeAny = typeof queryParamsSchema,
  TData extends z.ZodTypeAny = typeof dataSchema,
> {
  /** Whether credentials are required for this fetcher. */
  abstract requireCredentials: boolean;

  /**
   * Step 1 — Transform: Normalize user-provided params to provider-specific query format.
   * Sets defaults, resolves aliases, validates constraints.
   * Equivalent to OpenBB's transform_query(params) → Q
   */
  abstract transformQuery(
    params: z.input<TQueryParams>,
  ): z.input<TQueryParams> | Promise<z.input<TQueryParams>>;

  /**
   * Step 2 — Extract: Fetch raw data from the provider's external API.
   * Returns untyped JSON data.
   * Equivalent to OpenBB's extract_data(query, credentials) → Any
   */
  abstract extractData(
    query: z.infer<TQueryParams>,
    credentials: Record<string, string>,
    options?: Record<string, unknown>,
  ): Promise<unknown>;

  /**
   * Step 3 — Transform: Convert raw API response into standardized output.
   * Normalizes field names, formats, types.
   * Equivalent to OpenBB's transform_data(query, data, **kwargs) → R
   */
  abstract transformData(
    raw: unknown,
    query?: z.infer<TQueryParams>,
  ): Promise<z.output<TData>[]>;

  /**
   * Execute the full TET pipeline.
   * Equivalent to OpenBB's fetch_data(params, credentials, **kwargs)
   */
  async fetchData(
    params: z.input<TQueryParams>,
    credentials: Record<string, string>,
    options?: Record<string, unknown>,
  ): Promise<z.output<TData>[]> {
    const query = await this.transformQuery(params);
    const raw = await this.extractData(query, credentials, options);
    return this.transformData(raw, query);
  }
}
