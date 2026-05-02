/**
 * Simple token-bucket rate limiter for provider API requests.
 *
 * Many data providers (Alpha Vantage, Polygon, Tiingo, etc.) enforce strict
 * per-minute or per-second rate limits. This class ensures the SDK respects
 * those limits by throttling requests client-side.
 *
 * @module rate-limiter
 */

/**
 * Configuration for the {@link RateLimiter}.
 */
export interface RateLimiterConfig {
  /** Maximum number of requests allowed within `windowMs`. */
  maxRequests: number;
  /** Duration of the rate-limit window in milliseconds. */
  windowMs: number;
}

/**
 * Rate limiter statistics.
 */
export interface RateLimiterStats {
  /** Number of requests still available in the current window. */
  remaining: number;
  /** Milliseconds until the current window resets. */
  resetMs: number;
  /** Total number of requests made so far in this window. */
  used: number;
}

/**
 * Simple sliding-window rate limiter.
 *
 * Usage:
 * ```ts
 * const limiter = new RateLimiter(5, 1000); // 5 requests per second
 * await limiter.acquire(); // may delay to stay within limits
 * ```
 *
 * The limiter uses a FIFO queue of timestamps. When the queue exceeds
 * `maxRequests` within `windowMs`, `acquire()` delays until the oldest
 * timestamp expires.
 */
export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly timestamps: number[] = [];

  /**
   * @param maxRequests - Maximum number of requests allowed within the window.
   * @param windowMs    - Duration of the window in milliseconds.
   */
  constructor(maxRequests: number, windowMs: number) {
    if (maxRequests <= 0) {
      throw new RangeError("maxRequests must be a positive integer");
    }
    if (windowMs <= 0) {
      throw new RangeError("windowMs must be a positive integer");
    }
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Acquire permission to make a request.
   *
   * If the rate limit has been reached, this method will delay (via a Promise)
   * until a slot becomes available in the current window.
   */
  async acquire(): Promise<void> {
    this.prune();

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(Date.now());
      return;
    }

    // Window is full — wait until the oldest timestamp expires
    const oldest = this.timestamps[0]!;
    const waitMs = oldest + this.windowMs - Date.now();

    if (waitMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    }

    // After waiting, prune and record
    this.prune();
    this.timestamps.push(Date.now());
  }

  /**
   * Returns current rate-limiter statistics without acquiring a slot.
   */
  getStats(): RateLimiterStats {
    this.prune();
    return {
      remaining: Math.max(0, this.maxRequests - this.timestamps.length),
      resetMs: this.timestamps.length > 0
        ? Math.max(0, this.timestamps[0]! + this.windowMs - Date.now())
        : 0,
      used: this.timestamps.length,
    };
  }

  /**
   * Remove timestamps that have fallen outside the current window.
   */
  private prune(): void {
    const cutoff = Date.now() - this.windowMs;
    while (this.timestamps.length > 0 && this.timestamps[0]! < cutoff) {
      this.timestamps.shift();
    }
  }
}
