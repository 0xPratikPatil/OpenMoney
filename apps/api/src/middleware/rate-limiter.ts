/**
 * Token-bucket rate limiter middleware.
 *
 * Anonymous users: 60 req/min
 * Authenticated users: 300 req/min
 *
 * Stores token state in-memory (sufficient for single-process Bun).
 * For multi-process/containerized deployments, swap to Redis-backed storage.
 */

import { createMiddleware } from "hono/factory";

const ANON_CAPACITY = 60;
const ANON_REFILL_PER_SEC = 60 / 60;
const AUTH_CAPACITY = 300;
const AUTH_REFILL_PER_SEC = 300 / 60;

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

function getBucket(ip: string, isAuthenticated: boolean): Bucket {
  const max = isAuthenticated ? AUTH_CAPACITY : ANON_CAPACITY;
  const refillRate = isAuthenticated ? AUTH_REFILL_PER_SEC : ANON_REFILL_PER_SEC;

  let bucket = buckets.get(ip);
  const now = Date.now();

  if (!bucket) {
    bucket = { tokens: max, lastRefill: now };
    buckets.set(ip, bucket);
  } else {
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(max, bucket.tokens + elapsed * refillRate);
    bucket.lastRefill = now;
  }

  bucket.tokens -= 1;
  return bucket;
}

function cleanupBuckets(): void {
  const now = Date.now();
  for (const [ip, bucket] of buckets) {
    if (now - bucket.lastRefill > 180_000) {
      buckets.delete(ip);
    }
  }
}

setInterval(cleanupBuckets, 60_000);

export const rateLimiter = createMiddleware(async (c, next) => {
  const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim()
    ?? c.req.header("x-real-ip")
    ?? "unknown";
  const isAuthenticated = c.get("userId") != null;
  const bucket = getBucket(ip, isAuthenticated);

  if (bucket.tokens < 0) {
    const retryAfter = Math.ceil(
      -bucket.tokens / (isAuthenticated ? AUTH_REFILL_PER_SEC : ANON_REFILL_PER_SEC),
    );
    return c.json(
      {
        success: false,
        error: { code: "RATE_LIMITED", message: "Too many requests. Please try again." },
      },
      429,
      { "Retry-After": String(retryAfter) },
    );
  }

  await next();
});
