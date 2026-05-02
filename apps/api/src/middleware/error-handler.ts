/**
 * Error Handler Middleware
 *
 * A Hono middleware that catches all errors thrown by downstream handlers.
 * Maps known error codes (from ProviderError subclasses) to HTTP status
 * codes and returns a standardized `ApiError` response.
 *
 * Logs errors with requestId for distributed tracing.
 */
import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import {
  ProviderError,
  EmptyDataError,
  UnauthorizedError,
  RateLimitError,
} from "@openmoney/provider-core";
import { getRequestId, getElapsedDuration } from "./request-context";
import { fail } from "../lib/response";

/**
 * Determine the error code from any thrown error.
 */
function getErrorCode(error: unknown): string {
  if (error instanceof EmptyDataError) return "EMPTY_DATA";
  if (error instanceof UnauthorizedError) return "UNAUTHORIZED";
  if (error instanceof RateLimitError) return "RATE_LIMIT";
  if (error instanceof ProviderError) return error.code ?? "PROVIDER_ERROR";
  if (error instanceof SyntaxError) return "PARSE_ERROR";
  if (error instanceof TypeError) return "TYPE_ERROR";
  return "INTERNAL_ERROR";
}

/**
 * Determine the HTTP status code from any thrown error.
 */
function getHttpStatus(error: unknown): StatusCode {
  if (error instanceof EmptyDataError) return 404;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof RateLimitError) return 429;
  if (error instanceof ProviderError) return 400;
  if (error instanceof SyntaxError) return 400;
  return 500 as StatusCode;
}

/**
 * Get the error message from any thrown error.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

/**
 * Global error handler for Hono.
 *
 * Usage in index.ts:
 * ```ts
 * app.onError(errorHandler);
 * ```
 */
export function errorHandler(err: Error, c: Context): Response {
  const requestId = getRequestId(c);
  const duration = getElapsedDuration(c);
  const code = getErrorCode(err);
  const message = getErrorMessage(err);
  const status = getHttpStatus(err);

  // Log the error with requestId for tracing
  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      code,
      message,
      status,
      duration,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    }),
  );

  const body = fail(code, message, { requestId });
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
