/**
 * Provider-specific error handling helpers.
 *
 * This module provides lightweight error classification and mapping utilities
 * used by the shared {@link ProviderHttpClient}. It re-exports the canonical
 * error classes from `@openmoney/provider-core` for convenience and adds
 * provider-specific helpers for error inspection and formatting.
 *
 * @module provider-errors
 */

import {
  ProviderError,
  RateLimitError,
  UnauthorizedError,
  EmptyDataError,
} from "@openmoney/provider-core";

export { ProviderError, RateLimitError, UnauthorizedError, EmptyDataError };

/**
 * HTTP status codes that map to known provider error types.
 */
export const HTTP_STATUS_MAP: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  429: "RATE_LIMITED",
  500: "SERVER_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
  504: "GATEWAY_TIMEOUT",
};

/**
 * Classify an HTTP response status into the appropriate error instance.
 *
 * - 429 → {@link RateLimitError} (parses `Retry-After` header if present)
 * - 401/403 → {@link UnauthorizedError}
 * - all others → {@link ProviderError}
 *
 * @param status  - HTTP status code
 * @param statusText - HTTP status text
 * @param retryAfterHeader - Raw value of the `Retry-After` response header (optional)
 * @param providerName - Name of the provider for the error message
 * @returns An appropriate {@link ProviderError} subclass instance
 */
export function classifyHttpError(
  status: number,
  statusText: string,
  retryAfterHeader?: string | null,
  providerName = "Provider",
): ProviderError {
  const base = `[${status} ${statusText}]`;

  switch (status) {
    case 429: {
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
      return new RateLimitError(
        `${providerName} rate limit exceeded. ${base}`,
        Number.isFinite(retryAfter) ? retryAfter : undefined,
      );
    }
    case 401:
    case 403:
      return new UnauthorizedError(
        `${providerName} authentication failed. ${base} — check your API credentials.`,
      );
    case 404:
      return new ProviderError(
        `${providerName} resource not found. ${base}`,
        "NOT_FOUND",
      );
    default:
      return new ProviderError(
        `${providerName} API error. ${base}`,
        HTTP_STATUS_MAP[status] ?? "UNKNOWN",
      );
  }
}

/**
 * Safely extract JSON from an HTTP response, returning `null` for non-JSON bodies.
 *
 * Providers often return HTML or plain-text error pages for 4xx/5xx responses.
 * This helper avoids throwing during JSON parsing of such responses.
 *
 * @param response - The fetch Response object
 * @returns Parsed JSON or `null`
 */
export async function safeParseJson<T = unknown>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json") && !contentType.includes("text/json")) {
    return null;
  }
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
