/**
 * Request Context Middleware
 *
 * Generates a unique requestId (UUIDv4) per request, starts a performance
 * timer, and makes them available via `c.get('requestId')` and
 * `c.get('startTime')` for downstream handlers and logging.
 *
 * Also adds a standard X-Request-Id response header.
 */
import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";

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
 */
export async function requestContext(c: Context, next: Next): Promise<void> {
  const requestId = randomUUID();
  const startTime = performance.now();

  c.set("requestId", requestId);
  c.set("startTime", startTime);

  c.res.headers.set("X-Request-Id", requestId);

  await next();

  const duration = Math.round((performance.now() - startTime) * 100) / 100;
  c.res.headers.set("X-Duration-Ms", String(duration));
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
