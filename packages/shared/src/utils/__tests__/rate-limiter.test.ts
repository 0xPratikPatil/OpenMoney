import { describe, it, expect } from "bun:test";
import { RateLimiter } from "../rate-limiter";

describe("RateLimiter", () => {
  describe("constructor", () => {
    it("creates a limiter with valid params", () => {
      const limiter = new RateLimiter(5, 1000);
      expect(limiter).toBeInstanceOf(RateLimiter);
    });

    it("throws RangeError for maxRequests <= 0", () => {
      expect(() => new RateLimiter(0, 1000)).toThrow(RangeError);
      expect(() => new RateLimiter(-1, 1000)).toThrow(RangeError);
    });

    it("throws RangeError for windowMs <= 0", () => {
      expect(() => new RateLimiter(5, 0)).toThrow(RangeError);
      expect(() => new RateLimiter(5, -1)).toThrow(RangeError);
    });
  });

  describe("acquire()", () => {
    it("allows up to maxRequests within the window", async () => {
      const limiter = new RateLimiter(5, 1000);

      for (let i = 0; i < 5; i++) {
        await limiter.acquire(); // Should resolve immediately
      }

      // All 5 slots used
      const stats = limiter.getStats();
      expect(stats.used).toBe(5);
      expect(stats.remaining).toBe(0);
    });

    it("delays when at capacity", async () => {
      // Very short window so we can actually test this
      const limiter = new RateLimiter(2, 200);

      await limiter.acquire();
      await limiter.acquire();

      // Next acquire should wait
      const start = Date.now();
      await limiter.acquire();
      const elapsed = Date.now() - start;

      // Should have waited at least a bit
      expect(elapsed).toBeGreaterThan(0);
    });

    it("recovers after window expires", async () => {
      const limiter = new RateLimiter(1, 100);

      // Use the only slot
      await limiter.acquire();
      expect(limiter.getStats().remaining).toBe(0);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Now should be available again
      await limiter.acquire(); // Should not throw
      expect(limiter.getStats().used).toBe(1);
    });
  });

  describe("getStats()", () => {
    it("returns correct stats at rest", () => {
      const limiter = new RateLimiter(10, 1000);
      const stats = limiter.getStats();

      expect(stats.remaining).toBe(10);
      expect(stats.used).toBe(0);
      expect(stats.resetMs).toBe(0);
    });

    it("returns correct stats after acquiring", async () => {
      const limiter = new RateLimiter(10, 1000);

      await limiter.acquire();
      await limiter.acquire();
      await limiter.acquire();

      const stats = limiter.getStats();
      expect(stats.used).toBe(3);
      expect(stats.remaining).toBe(7);
      expect(stats.resetMs).toBeGreaterThan(0);
    });
  });
});
