/**
 * Standardized Error Codes — OpenMoney
 *
 * Every error in the system is classified into one of these codes.
 * This ensures consistent error handling across all providers,
 * API routes, and frontend components.
 */

export const ErrorCode = {
  // ── Provider errors ─────────────────────────────────
  /** Provider not found in registry */
  PROVIDER_NOT_FOUND: "PROVIDER_NOT_FOUND",
  /** Requested model not supported by this provider */
  FETCHER_NOT_FOUND: "FETCHER_NOT_FOUND",
  /** Provider requires credentials but none were supplied */
  UNAUTHORIZED: "UNAUTHORIZED",
  /** Rate limit exceeded (429 from provider) */
  RATE_LIMIT: "RATE_LIMIT",
  /** Provider returned empty/zero results */
  EMPTY_DATA: "EMPTY_DATA",
  /** Provider is temporarily unavailable (circuit open) */
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
  /** All available providers failed for this model */
  ALL_PROVIDERS_FAILED: "ALL_PROVIDERS_FAILED",

  // ── Validation errors ───────────────────────────────
  /** Invalid request parameters */
  VALIDATION_ERROR: "VALIDATION_ERROR",
  /** Required parameter missing */
  MISSING_PARAM: "MISSING_PARAM",
  /** Parameter type mismatch */
  INVALID_TYPE: "INVALID_TYPE",

  // ── Data errors ─────────────────────────────────────
  /** Symbol/ticker not found */
  SYMBOL_NOT_FOUND: "SYMBOL_NOT_FOUND",
  /** Data is stale or outside acceptable freshness window */
  DATA_STALE: "DATA_STALE",

  // ── System errors ───────────────────────────────────
  /** Internal server error */
  INTERNAL_ERROR: "INTERNAL_ERROR",
  /** External service timeout */
  TIMEOUT: "TIMEOUT",
  /** Network error reaching provider */
  NETWORK_ERROR: "NETWORK_ERROR",
  /** Unknown/unexpected error */
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Map error codes to HTTP status codes */
export function errorCodeToHttpStatus(code: ErrorCodeType): number {
  const map: Record<string, number> = {
    PROVIDER_NOT_FOUND: 404,
    FETCHER_NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    RATE_LIMIT: 429,
    EMPTY_DATA: 404,
    PROVIDER_UNAVAILABLE: 503,
    ALL_PROVIDERS_FAILED: 502,
    VALIDATION_ERROR: 400,
    MISSING_PARAM: 400,
    INVALID_TYPE: 400,
    SYMBOL_NOT_FOUND: 404,
    DATA_STALE: 422,
    INTERNAL_ERROR: 500,
    TIMEOUT: 504,
    NETWORK_ERROR: 502,
    UNKNOWN_ERROR: 500,
  };
  return map[code] ?? 500;
}

/** Human-readable descriptions for error codes */
export function errorCodeDescription(code: ErrorCodeType): string {
  const descriptions: Record<string, string> = {
    PROVIDER_NOT_FOUND: "The requested data provider is not available",
    FETCHER_NOT_FOUND: "This data model is not supported by the selected provider",
    UNAUTHORIZED: "API key or credentials required for this provider",
    RATE_LIMIT: "Provider rate limit exceeded — try again shortly",
    EMPTY_DATA: "No data found for the requested parameters",
    PROVIDER_UNAVAILABLE: "Provider is temporarily unavailable",
    ALL_PROVIDERS_FAILED: "All available providers failed to return data",
    VALIDATION_ERROR: "Invalid request parameters",
    MISSING_PARAM: "A required parameter is missing",
    INVALID_TYPE: "Parameter type is incorrect",
    SYMBOL_NOT_FOUND: "Symbol or ticker not found",
    DATA_STALE: "The available data is outdated",
    INTERNAL_ERROR: "An unexpected internal error occurred",
    TIMEOUT: "The request timed out",
    NETWORK_ERROR: "Network error while contacting provider",
    UNKNOWN_ERROR: "An unexpected error occurred",
  };
  return descriptions[code] ?? code;
}
