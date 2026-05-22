/**
 * Standardized Error Class — OpenMoney
 *
 * Every error thrown within the system should be an instanceof OpenMoneyError.
 * This ensures consistent structure across all providers and API routes.
 */

import type { ErrorCodeType } from "./codes";
import { errorCodeToHttpStatus, errorCodeDescription } from "./codes";

export class OpenMoneyError extends Error {
  public readonly code: ErrorCodeType;
  public readonly httpStatus: number;
  public readonly details?: unknown;
  public readonly cause?: Error;

  constructor(
    code: ErrorCodeType,
    message?: string,
    opts?: { details?: unknown; cause?: Error },
  ) {
    super(message ?? errorCodeDescription(code));
    this.name = "OpenMoneyError";
    this.code = code;
    this.httpStatus = errorCodeToHttpStatus(code);
    this.details = opts?.details;
    this.cause = opts?.cause;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenMoneyError);
    }
  }

  /** Serialize to a JSON-safe object for API responses */
  toJSON(): { code: string; message: string; details?: unknown; httpStatus: number } {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      httpStatus: this.httpStatus,
    };
  }

  /** Create from an unknown error (normalization) */
  static from(error: unknown, fallbackCode: ErrorCodeType = "UNKNOWN_ERROR"): OpenMoneyError {
    if (error instanceof OpenMoneyError) return error;

    // Check for common error shapes from different providers
    const err = error as Record<string, unknown> | null;

    if (err?.status === 429 || err?.code === "RATE_LIMIT") {
      return new OpenMoneyError("RATE_LIMIT", "Provider rate limit exceeded", {
        details: err?.message ?? err,
      });
    }
    if (err?.status === 401 || err?.status === 403) {
      return new OpenMoneyError("UNAUTHORIZED", "Provider authentication failed", {
        details: err?.message ?? err,
      });
    }
    if (err?.status === 404 || err?.code === "EMPTY_DATA") {
      return new OpenMoneyError("EMPTY_DATA", "No data found", {
        details: err?.message ?? err,
      });
    }
    if (err?.code === "TIMEOUT" || err?.name === "TimeoutError") {
      return new OpenMoneyError("TIMEOUT", "Request timed out");
    }

    const message = error instanceof Error ? error.message : String(error);
    return new OpenMoneyError(fallbackCode, message, { cause: error instanceof Error ? error : undefined });
  }
}
