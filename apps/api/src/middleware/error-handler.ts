/**
 * Error Handler Middleware
 *
 * A Hono middleware that catches all errors thrown by downstream handlers.
 * Normalizes provider errors, Zod validation errors, and unknown errors
 * into a standardized ApiError response using OpenMoneyError codes.
 *
 * Logs errors through the global logger with requestId for distributed tracing.
 */
import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import {
  ProviderError,
  EmptyDataError,
  UnauthorizedError,
  RateLimitError,
} from "@openmoney/provider-core";
import { ErrorCode, OpenMoneyError, logger } from "@openmoney/shared";
import { getRequestId, getElapsedDuration } from "./request-context";
import { fail } from "../lib/response";

/**
 * Normalize any thrown error into a standardized error code + HTTP status.
 */
function normalizeError(error: unknown): {
  code: string;
  message: string;
  status: StatusCode;
  details?: unknown;
} {
  // OpenMoneyError — already standardized
  if (error instanceof OpenMoneyError) {
    return {
      code: error.code,
      message: error.message,
      status: error.httpStatus as StatusCode,
      details: error.details,
    };
  }

  // Provider-specific errors
  if (error instanceof EmptyDataError) {
    return { code: ErrorCode.EMPTY_DATA, message: error.message, status: 404 };
  }
  if (error instanceof UnauthorizedError) {
    return { code: ErrorCode.UNAUTHORIZED, message: error.message, status: 401 };
  }
  if (error instanceof RateLimitError) {
    return { code: ErrorCode.RATE_LIMIT, message: error.message, status: 429 };
  }
  if (error instanceof ProviderError) {
    return {
      code: error.code ?? ErrorCode.INTERNAL_ERROR,
      message: error.message,
      status: 400,
    };
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Request validation failed",
      status: 400,
      details: error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    };
  }

  // Known HTTP errors (from fetch, etc.)
  const err = error as Record<string, unknown> | null;
  if (err?.name === "TimeoutError" || err?.code === "ETIMEDOUT") {
    return { code: ErrorCode.TIMEOUT, message: "Request timed out", status: 504 };
  }

  // Default: internal error
  const message = error instanceof Error ? error.message : String(error);
  return { code: ErrorCode.INTERNAL_ERROR, message, status: 500 };
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
  const { code, message, status, details } = normalizeError(err);

  // Log through global logger
  logger.error(`Error: ${code} — ${message}`, {
    requestId,
    code,
    status,
    duration,
    path: c.req.path,
    method: c.req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack?.split("\n").slice(0, 5) : undefined,
    details,
  });

  const body = fail(code, message, { requestId, ...(details ? { details } : {}) });
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
