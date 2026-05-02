/**
 * Standardized API response envelope.
 * Every API response follows this format for consistency.
 *
 * Conventions:
 *   - All endpoints return { success, data, meta } or { success, error, meta }
 *   - `meta.timestamp` is ISO 8601
 *   - `meta.duration` is wall-clock ms, rounded to 2 decimals
 *   - `meta.requestId` is a UUIDv4 for distributed tracing
 *   - `meta.total` is present for list endpoints
 */

export interface ApiMeta {
  /** Request timestamp in ISO 8601 */
  timestamp: string;
  /** Wall-clock duration in milliseconds (rounded to 2 decimals) */
  duration: number;
  /** Provider that served the data (if applicable) */
  provider?: string;
  /** Model/endpoint that was queried (if applicable) */
  model?: string;
  /** Unique request ID for tracing */
  requestId: string;
  /** Total count of items in data array (for list endpoints) */
  total?: number;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

/**
 * Create a successful API response.
 *
 * @param data - The response payload.
 * @param options - Optional meta overrides (provider, model, total).
 */
export function ok<T>(data: T, options?: {
  provider?: string;
  model?: string;
  total?: number;
  duration?: number;
}): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      duration: options?.duration ?? 0,
      requestId: crypto.randomUUID(),
      ...options,
    },
  };
}

/**
 * Create an error API response.
 */
export function fail(code: string, message: string, details?: unknown): ApiError {
  return {
    success: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      duration: 0,
      requestId: crypto.randomUUID(),
    },
  };
}

/**
 * Wrap a provider query execution with the standardized response format.
 *
 * Measures wall-clock duration, catches errors (ProviderError, EmptyDataError,
 * UnauthorizedError, RateLimitError), and returns a structured ApiResult.
 *
 * @param executor   - A QueryExecutor instance.
 * @param provider   - Provider name (e.g. "yfinance").
 * @param model      - Model name (e.g. "equity/quote").
 * @param params     - Query parameters forwarded to the fetcher.
 * @param credentials - Optional API credentials.
 * @returns A promise resolving to either ApiResponse<T> or ApiError.
 */
export async function executeProviderQuery<T>(
  executor: {
    execute<T>(
      providerName: string,
      modelName: string,
      params: Record<string, unknown>,
      credentials?: Record<string, string>,
      options?: Record<string, unknown>,
    ): Promise<T>;
  },
  provider: string,
  model: string,
  params: Record<string, unknown>,
  credentials?: Record<string, string>,
): Promise<ApiResult<T>> {
  const start = performance.now();
  const requestId = crypto.randomUUID();

  try {
    const data = await executor.execute<T>(provider, model, params, credentials);
    const duration = roundMs(performance.now() - start);

    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        duration,
        requestId,
        provider,
        model,
        total: Array.isArray(data) ? data.length : undefined,
      },
    };
  } catch (error) {
    const duration = roundMs(performance.now() - start);
    const code = error instanceof Error
      ? ((error as unknown as Record<string, unknown>).code as string) ?? "UNKNOWN_ERROR"
      : "UNKNOWN_ERROR";
    const message = error instanceof Error ? error.message : "An unexpected error occurred";

    return {
      success: false,
      error: { code, message },
      meta: {
        timestamp: new Date().toISOString(),
        duration,
        requestId,
        provider,
        model,
      },
    };
  }
}

/** Round milliseconds to 2 decimal places. */
function roundMs(ms: number): number {
  return Math.round(ms * 100) / 100;
}
