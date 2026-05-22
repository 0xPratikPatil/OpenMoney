/**
 * Standardized API response envelope — OpenMoney
 *
 * Every API response follows this format for consistency:
 *   - Success: { success: true, data: T, meta: { timestamp, duration, requestId, ... } }
 *   - Error:   { success: false, error: { code, message, details? }, meta: { ... } }
 *
 * This is enforced across ALL routes and providers for uniform client handling.
 */

import { OpenMoneyError, logger } from "@openmoney/shared";

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
  /** Whether a fallback provider was used */
  fallback?: boolean;
  /** The originally requested provider (if different from actual) */
  requestedProvider?: string;
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
 * Wrap a provider query execution with the standardized response format
 * and global logging.
 *
 * Measures wall-clock duration, catches and normalizes all errors,
 * and returns a structured ApiResult.
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
    logger.info(`Provider query: ${provider}/${model}`, {
      requestId,
      provider,
      model,
      paramsKeys: Object.keys(params).join(","),
    });

    const data = await executor.execute<T>(provider, model, params, credentials);
    const duration = roundMs(performance.now() - start);

    logger.info(`Provider query success: ${provider}/${model}`, {
      requestId,
      provider,
      model,
      duration,
      total: Array.isArray(data) ? data.length : undefined,
    });

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
    const omError = OpenMoneyError.from(error);

    logger.error(`Provider query failed: ${provider}/${model} — ${omError.code}`, {
      requestId,
      provider,
      model,
      duration,
      code: omError.code,
      message: omError.message,
    });

    return {
      success: false,
      error: { code: omError.code, message: omError.message, details: omError.details },
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
