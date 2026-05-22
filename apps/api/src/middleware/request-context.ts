/**
 * Request Context Middleware
 *
 * Generates a unique requestId (UUIDv4) per request, starts a performance
 * timer, injects logging context, and makes them available via
 * `c.get('requestId')` and `c.get('startTime')` for downstream handlers.
 *
 * Also adds X-Request-Id and X-Duration-Ms response headers.
 */
import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";
import { logger } from "@openmoney/shared";

/**
 * Extend Hono's context variables so we get typed access.
 */
declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
    startTime: number;
  }
}

/**
 * Middleware that injects a request context into every request.
 *
 * - Generates a unique requestId
 * - Starts a performance timer
 * - Sets `c.set('requestId', ...)` and `c.set('startTime', ...)`
 * - Adds `X-Request-Id` response header
 * - Logs request start and completion with duration
 */
export async function requestContext(c: Context, next: Next): Promise<void> {
  const requestId = randomUUID();
  const startTime = performance.now();

  c.set("requestId", requestId);
  c.set("startTime", startTime);

  c.res.headers.set("X-Request-Id", requestId);

  // Log incoming request
  logger.info(`→ ${c.req.method} ${c.req.path}`, {
    requestId,
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
    userAgent: c.req.header("User-Agent")?.slice(0, 80),
  });

  await next();

  const duration = Math.round((performance.now() - startTime) * 100) / 100;
  c.res.headers.set("X-Duration-Ms", String(duration));

  // Log request completion
  const status = c.res.status;
  logger.info(`← ${c.req.method} ${c.req.path}`, {
    requestId,
    status,
    duration,
    method: c.req.method,
    path: c.req.path,
  });
}

/**
 * Helper to get the requestId from context.
 */
export function getRequestId(c: Context): string {
  return c.get("requestId") ?? "unknown";
}

/**
 * Helper to compute the elapsed duration from the start time.
 */
export function getElapsedDuration(c: Context): number {
  const start = c.get("startTime") ?? performance.now();
  return Math.round((performance.now() - start) * 100) / 100;
}

