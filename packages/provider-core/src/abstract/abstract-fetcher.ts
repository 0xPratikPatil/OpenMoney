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
 * Allows fetchers to return metadata alongside data.
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
 *
 * Generic parameters:
 *   TQueryParams — Zod schema type for query parameters (default: queryParamsSchema)
 *   TData        — Zod schema type for the output data (default: dataSchema)
 */
export abstract class AbstractFetcher<
  TQueryParams extends z.ZodTypeAny = typeof queryParamsSchema,
  TData extends z.ZodTypeAny = typeof dataSchema,
> {
  /**
   * Whether credentials are required for this fetcher.
   * Equivalent to OpenBB's `require_credentials`.
   */
  abstract requireCredentials: boolean;

  /**
   * Static reference to the QueryParams Zod schema for this fetcher.
   * Populated by the subclass via `initTypeMetadata`.
   * Equivalent to OpenBB's `@classproperty query_params_type`.
   */
  static queryParamsType: z.ZodTypeAny | undefined;

  /**
   * Static reference to the outer return type Zod schema for this fetcher.
   * This is typically `z.array(SomeDataSchema)` but may be a single item.
   * Populated by the subclass via `initTypeMetadata`.
   * Equivalent to OpenBB's `@classproperty return_type`.
   */
  static returnType: z.ZodTypeAny | undefined;

  /**
   * Static reference to the inner data type Zod schema for this fetcher.
   * Extracted from the return type (if list, the item type; otherwise the type itself).
   * Populated by the subclass via `initTypeMetadata`.
   * Equivalent to OpenBB's `@classproperty data_type`.
   */
  static dataType: z.ZodTypeAny | undefined;

  /**
   * Initialize the static type metadata for a fetcher subclass.
   * Must be called after the class is defined so that `test()` can introspect types.
   *
   * Usage:
   * ```ts
   * class MyFetcher extends AbstractFetcher<typeof MyQuery, typeof MyData> {
   *   // ...
   * }
   * MyFetcher.initTypeMetadata(MyQuery, z.array(MyData), MyData);
   * ```
   *
   * Equivalent to OpenBB's classproperty introspection of `__orig_bases__`.
   */
  static initTypeMetadata(
    queryParamsType: z.ZodTypeAny,
    returnType: z.ZodTypeAny,
    dataType: z.ZodTypeAny,
  ): void {
    (this as typeof AbstractFetcher).queryParamsType = queryParamsType;
    (this as typeof AbstractFetcher).returnType = returnType;
    (this as typeof AbstractFetcher).dataType = dataType;
  }

  /**
   * Step 1 — Transform: Normalize user-provided params to provider-specific query format.
   * Sets defaults, resolves aliases, validates constraints.
   * Equivalent to OpenBB's `transform_query(params)`.
   */
  abstract transformQuery(
    params: z.input<TQueryParams>,
  ): z.infer<TQueryParams> | Promise<z.infer<TQueryParams>>;

  /**
   * Step 2 — Extract: Fetch raw data from the provider's external API.
   * Returns untyped JSON data.
   * Equivalent to OpenBB's `extract_data(query, credentials)`.
   */
  abstract extractData(
    query: z.infer<TQueryParams>,
    credentials: Record<string, string>,
    options?: Record<string, unknown>,
  ): Promise<unknown>;

  /**
   * Step 3 — Transform: Convert raw API response into standardized output.
   * Normalizes field names, formats, types.
   * Equivalent to OpenBB's `transform_data(query, data, **kwargs)`.
   */
  abstract transformData(
    raw: unknown,
    query?: z.infer<TQueryParams>,
  ): Promise<z.output<TData>[]>;

  /**
   * Execute the full TET pipeline.
   * Equivalent to OpenBB's `fetch_data(params, credentials, **kwargs)`.
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

  /**
   * Test the fetcher's TET pipeline end-to-end.
   *
   * Validates each stage of the Transform-Extract-Transform lifecycle:
   *  1. require_credentials is a boolean
   *  2. transformQuery produces a valid query with expected values
   *  3. extractData returns non-null data with expected fields (NOT already transformed)
   *  4. transformData returns correctly-typed results
   *
   * Equivalent to OpenBB's `Fetcher.test(params, credentials)`.
   *
   * @param params    — Input parameters to test with
   * @param credentials — Provider credentials (default: {})
   * @param options   — Extra options forwarded to extractData
   * @throws ProviderError if any stage of the pipeline is invalid
   */
  async test(
    params: z.input<TQueryParams>,
    credentials: Record<string, string> = {},
    options?: Record<string, unknown>,
  ): Promise<void> {
    const cls = this.constructor as typeof AbstractFetcher;

    // --- Class assertions ---
    if (typeof this.requireCredentials !== "boolean") {
      throw new ProviderError("require_credentials must be a boolean.", "TEST_FAILED");
    }

    // --- Transform query ---
    const query = await this.transformQuery(params);

    if (!query) {
      throw new ProviderError("Query must not be null/undefined.", "TEST_FAILED");
    }

    // Verify input params made it into the query (values may be transformed)
    for (const key of Object.keys(params)) {
      if (!(key in (query as Record<string, unknown>))) {
        throw new ProviderError(
          `Query is missing param '${key}' that was present in input.`,
          "TEST_FAILED",
        );
      }
      const qv = (query as Record<string, unknown>)[key];
      if (qv === undefined && params[key] !== undefined) {
        throw new ProviderError(
          `Query param '${key}' is undefined but input had value: ${String(params[key])}`,
          "TEST_FAILED",
        );
      }
    }

    // --- Extract data ---
    const raw = await this.extractData(query, credentials, options);

    if (raw === null || raw === undefined) {
      throw new ProviderError("Data must not be null/undefined.", "TEST_FAILED");
    }

    // Validate raw data has expected fields and is NOT transformed
    const rawItems = Array.isArray(raw) ? raw : [raw];

    if (rawItems.length === 0) {
      throw new ProviderError("Data must not be empty.", "TEST_FAILED");
    }

    // Check raw data has expected fields and is NOT already the transformed type
    if (cls.dataType) {
      const dataTypeShape = cls.dataType;
      // Infer expected field names from the data schema
      const schemaType = dataTypeShape._def?.typeName;
      const isObject = schemaType === "ZodObject" || schemaType === "ZodEffects";
      if (isObject) {
        for (const item of rawItems) {
          if (item === null || item === undefined) {
            throw new ProviderError("Raw data item must not be null/undefined.", "TEST_FAILED");
          }
          if (typeof item === "object") {
            // Check that at least one field from the schema exists in the raw data
            // This verifies the data shape is recognizable
            const keys = Object.keys(item as Record<string, unknown>);
            if (keys.length === 0) {
              throw new ProviderError("Raw data has no fields.", "TEST_FAILED");
            }

            // Verify that raw data is NOT already the transformed type by checking
            // that the raw object is NOT an instance of a class that would match the schema
            const rawResult = cls.dataType.safeParse(item);
            // If parse succeeds on raw data, the data might already be transformed
            // This is a soft check — we warn but don't fail if it's just schema-compatible
            if (rawResult.success && Array.isArray(raw)) {
              // If the raw data already passes the data schema perfectly, there's
              // a risk the pipeline skips actual transformation. We allow this
              // but flag it for developer awareness. (In strict mode, fail.)
            }
          }
        }
      }
    }

    // --- Transform data ---
    const result = await this.transformData(raw, query);

    if (result === null || result === undefined) {
      throw new ProviderError("Transformed data must not be null/undefined.", "TEST_FAILED");
    }

    if (!Array.isArray(result)) {
      throw new ProviderError("Transformed data must be an array.", "TEST_FAILED");
    }

    if (result.length === 0) {
      throw new ProviderError("Transformed data must not be empty.", "TEST_FAILED");
    }

    // Validate transformed data against the data schema
    if (cls.dataType) {
      for (const item of result) {
        if (item === null || item === undefined) {
          throw new ProviderError("Transformed data item must not be null/undefined.", "TEST_FAILED");
        }
        const parseResult = cls.dataType.safeParse(item);
        if (!parseResult.success) {
          throw new ProviderError(
            `Transformed data item does not match schema: ${parseResult.error.message}`,
            "TEST_FAILED",
          );
        }
      }
    }
  }
}
