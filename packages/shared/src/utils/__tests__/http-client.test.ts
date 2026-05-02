import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { ProviderHttpClient } from "../http-client";
import { RateLimitError, UnauthorizedError, ProviderError } from "../provider-errors";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal mock response that quacks like a `Response`.
 * Defaults to status 200 with `Content-Type: application/json`.
 */
function mockResponse(overrides: Partial<Response> & { _body?: unknown } = {}): Response {
  const body = overrides._body !== undefined ? JSON.stringify(overrides._body) : "{}";
  const rawHeaders: Record<string, string> = {
    "content-type": "application/json",
    ...((overrides.headers ?? {}) as Record<string, string>),
  };
  return {
    ok: overrides.ok ?? true,
    status: overrides.status ?? 200,
    statusText: overrides.statusText ?? "OK",
    headers: {
      get(name: string) {
        const lower = name.toLowerCase();
        for (const key of Object.keys(rawHeaders)) {
          if (key.toLowerCase() === lower) return rawHeaders[key]!;
        }
        return null;
      },
      has(name: string) {
        const lower = name.toLowerCase();
        return Object.keys(rawHeaders).some((k) => k.toLowerCase() === lower);
      },
    } as unknown as Headers,
    json: async () => (overrides._body !== undefined ? overrides._body : {}),
    text: async () => body,
  } as Response;
}

let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ProviderHttpClient", () => {
  // ---- Construction ----
  describe("constructor", () => {
    it("creates a client with defaults", () => {
      const client = new ProviderHttpClient({ baseUrl: "https://api.example.com" });
      expect(client).toBeInstanceOf(ProviderHttpClient);
      expect(client.getCacheStats()).toEqual({ size: 0, hits: 0, misses: 0 });
    });
  });

  // ---- GET requests ----
  describe("get()", () => {
    it("performs a basic GET and parses JSON", async () => {
      const data = { symbol: "AAPL", price: 150 };
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(mockResponse({ _body: data })),
      );

      const client = new ProviderHttpClient({ baseUrl: "https://api.example.com" });
      const result = await client.get<{ symbol: string; price: number }>("/v3/quote/AAPL");

      expect(result).toEqual(data);
    });

    it("appends query parameters", async () => {
      let capturedUrl = "";
      globalThis.fetch = mock<typeof fetch>((url: string) => {
        capturedUrl = url;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({ baseUrl: "https://api.example.com" });
      await client.get("/v3/data", { symbol: "AAPL", limit: 10 });

      expect(capturedUrl).toContain("symbol=AAPL");
      expect(capturedUrl).toContain("limit=10");
    });

    it("skips undefined query parameters", async () => {
      let capturedUrl = "";
      globalThis.fetch = mock<typeof fetch>((url: string) => {
        capturedUrl = url;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({ baseUrl: "https://api.example.com" });
      await client.get("/v3/data", { symbol: "AAPL", limit: undefined });

      expect(capturedUrl).toContain("symbol=AAPL");
      expect(capturedUrl).not.toContain("limit=");
    });

    it("sends default User-Agent header", async () => {
      let capturedHeaders: Record<string, string> = {};
      globalThis.fetch = mock<typeof fetch>((url: string, init: RequestInit) => {
        capturedHeaders = (init.headers ?? {}) as Record<string, string>;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({ baseUrl: "https://api.example.com" });
      await client.get("/test");

      expect(capturedHeaders["User-Agent"]).toBe("OpenMoney/0.1.0 (+https://openmoney.dev)");
    });

    it("allows custom User-Agent", async () => {
      let capturedHeaders: Record<string, string> = {};
      globalThis.fetch = mock<typeof fetch>((url: string, init: RequestInit) => {
        capturedHeaders = (init.headers ?? {}) as Record<string, string>;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        userAgent: "CustomAgent/1.0",
      });
      await client.get("/test");

      expect(capturedHeaders["User-Agent"]).toBe("CustomAgent/1.0");
    });
  });

  // ---- POST requests ----
  describe("post()", () => {
    it("performs a POST with JSON body", async () => {
      let capturedBody = "";
      globalThis.fetch = mock<typeof fetch>((url: string, init: RequestInit) => {
        capturedBody = (init.body ?? "") as string;
        return Promise.resolve(mockResponse({ _body: { id: 1 } }));
      });

      const client = new ProviderHttpClient({ baseUrl: "https://api.example.com" });
      const result = await client.post<{ id: number }>("/v3/create", { name: "test" });

      expect(result).toEqual({ id: 1 });
      expect(capturedBody).toBe('{"name":"test"}');
    });
  });

  // ---- Error handling ----
  describe("error handling", () => {
    it("throws RateLimitError on 429", async () => {
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(
          mockResponse({
            ok: false,
            status: 429,
            statusText: "Too Many Requests",
            headers: { "Retry-After": "5" },
          }),
        ),
      );

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 0 },
      });

      await expect(client.get("/test")).rejects.toThrow(RateLimitError);
    });

    it("throws UnauthorizedError on 401", async () => {
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(
          mockResponse({ ok: false, status: 401, statusText: "Unauthorized" }),
        ),
      );

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 0 },
      });

      await expect(client.get("/test")).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError on 403", async () => {
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(
          mockResponse({ ok: false, status: 403, statusText: "Forbidden" }),
        ),
      );

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 0 },
      });

      await expect(client.get("/test")).rejects.toThrow(UnauthorizedError);
    });

    it("throws ProviderError on 404", async () => {
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(
          mockResponse({ ok: false, status: 404, statusText: "Not Found" }),
        ),
      );

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 0 },
      });

      await expect(client.get("/test")).rejects.toThrow(ProviderError);
    });

    it("throws ProviderError with correct code for 500", async () => {
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(
          mockResponse({ ok: false, status: 500, statusText: "Internal Server Error" }),
        ),
      );

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 0 },
      });

      let error: ProviderError | undefined;
      try {
        await client.get("/test");
      } catch (e) {
        error = e as ProviderError;
      }
      expect(error).toBeInstanceOf(ProviderError);
      expect(error!.code).toBe("SERVER_ERROR");
    });
  });

  // ---- Retry logic ----
  describe("retry", () => {
    it("retries on 429 then succeeds", async () => {
      const successResponse = mockResponse({ _body: { ok: true } });
      const rateLimitResponse = mockResponse({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Retry-After": "0" },
      });

      let callCount = 0;
      globalThis.fetch = mock<typeof fetch>(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve(rateLimitResponse);
        return Promise.resolve(successResponse);
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 2, baseDelayMs: 10 },
      });

      const result = await client.get<{ ok: boolean }>("/test");
      expect(result).toEqual({ ok: true });
      expect(callCount).toBe(2);
    });

    it("retries on network error then succeeds", async () => {
      const successResponse = mockResponse({ _body: { ok: true } });

      let callCount = 0;
      globalThis.fetch = mock<typeof fetch>(() => {
        callCount++;
        if (callCount === 1) return Promise.reject(new Error("Network failure"));
        if (callCount === 2) return Promise.reject(new Error("Network failure 2"));
        return Promise.resolve(successResponse);
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 3, baseDelayMs: 10 },
      });

      const result = await client.get<{ ok: boolean }>("/test");
      expect(result).toEqual({ ok: true });
      expect(callCount).toBe(3);
    });

    it("throws after exhausting all retries", async () => {
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(
          mockResponse({ ok: false, status: 500, statusText: "Error" }),
        ),
      );

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 2, baseDelayMs: 10 },
      });

      await expect(client.get("/test")).rejects.toThrow(ProviderError);
    });

    it("does not retry on 4xx errors other than 429", async () => {
      let callCount = 0;
      globalThis.fetch = mock<typeof fetch>(() => {
        callCount++;
        return Promise.resolve(
          mockResponse({ ok: false, status: 404, statusText: "Not Found" }),
        );
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        retry: { maxRetries: 3, baseDelayMs: 10 },
      });

      await expect(client.get("/test")).rejects.toThrow(ProviderError);
      expect(callCount).toBe(1); // Not retried
    });
  });

  // ---- Auth injection ----
  describe("auth injection", () => {
    it("injects credentials as query parameter (type=query)", async () => {
      let capturedUrl = "";
      globalThis.fetch = mock<typeof fetch>((url: string) => {
        capturedUrl = url;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "query", key: "apikey", credentialKey: "my_key" },
      });

      await client.get("/v3/data", {}, { my_key: "secret123" });
      expect(capturedUrl).toContain("apikey=secret123");
    });

    it("injects credentials as header (type=header)", async () => {
      let capturedHeaders: Record<string, string> = {};
      globalThis.fetch = mock<typeof fetch>((url: string, init: RequestInit) => {
        capturedHeaders = (init.headers ?? {}) as Record<string, string>;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "header", key: "X-API-Key", credentialKey: "my_key" },
      });

      await client.get("/v3/data", {}, { my_key: "secret123" });
      expect(capturedHeaders["X-API-Key"]).toBe("secret123");
    });

    it("injects credentials as Bearer token (type=bearer)", async () => {
      let capturedHeaders: Record<string, string> = {};
      globalThis.fetch = mock<typeof fetch>((url: string, init: RequestInit) => {
        capturedHeaders = (init.headers ?? {}) as Record<string, string>;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        auth: { type: "bearer", key: "Authorization", credentialKey: "token" },
      });

      await client.get("/v3/data", {}, { token: "my-bearer-token" });
      expect(capturedHeaders["Authorization"]).toBe("Bearer my-bearer-token");
    });
  });

  // ---- Caching ----
  describe("caching", () => {
    it("caches GET responses and returns cached value on repeat call", async () => {
      let callCount = 0;
      globalThis.fetch = mock<typeof fetch>(() => {
        callCount++;
        return Promise.resolve(mockResponse({ _body: { value: callCount } }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        cache: { enabled: true, ttlMs: 60_000 },
      });

      const r1 = await client.get<{ value: number }>("/test");
      const r2 = await client.get<{ value: number }>("/test");

      expect(r1).toEqual({ value: 1 });
      expect(r2).toEqual({ value: 1 }); // cached, still 1
      expect(callCount).toBe(1);
    });

    it("cache miss when cache is disabled", async () => {
      let callCount = 0;
      globalThis.fetch = mock<typeof fetch>(() => {
        callCount++;
        return Promise.resolve(mockResponse({ _body: { value: callCount } }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        cache: { enabled: false },
      });

      await client.get("/test");
      await client.get("/test");

      expect(callCount).toBe(2);
    });

    it("clearCache empties the cache", async () => {
      let callCount = 0;
      globalThis.fetch = mock<typeof fetch>(() => {
        callCount++;
        return Promise.resolve(mockResponse({ _body: { value: callCount } }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        cache: { enabled: true, ttlMs: 60_000 },
      });

      await client.get("/test");
      client.clearCache();
      await client.get("/test");

      expect(callCount).toBe(2);
    });

    it("getCacheStats returns correct statistics", async () => {
      globalThis.fetch = mock<typeof fetch>(() =>
        Promise.resolve(mockResponse({ _body: { x: 1 } })),
      );

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        cache: { enabled: true, ttlMs: 60_000 },
      });

      expect(client.getCacheStats()).toEqual({ size: 0, hits: 0, misses: 0 });

      await client.get("/a"); // miss
      expect(client.getCacheStats()).toMatchObject({ size: 1, hits: 0, misses: 1 });

      await client.get("/a"); // hit
      expect(client.getCacheStats()).toMatchObject({ size: 1, hits: 1, misses: 1 });

      await client.get("/b"); // miss
      expect(client.getCacheStats()).toMatchObject({ size: 2, hits: 1, misses: 2 });
    });
  });

  // ---- Request timeout ----
  describe("timeout", () => {
    it("throws on timeout", async () => {
      // Mock fetch that respects AbortController signals
      globalThis.fetch = ((_url: string, init: RequestInit) => {
        const signal = (init as { signal?: AbortSignal }).signal;
        return new Promise<Response>((_resolve, reject) => {
          const onAbort = () => {
            reject(new Error("The operation was aborted"));
          };
          if (signal?.aborted) {
            onAbort();
            return;
          }
          signal?.addEventListener("abort", onAbort, { once: true });
        });
      }) as unknown as typeof fetch;

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        timeout: 50,
        retry: { maxRetries: 0 },
      });

      await expect(client.get("/test")).rejects.toThrow();
    });
  });

  // ---- Default params ----
  describe("default params", () => {
    it("sends default params with every request", async () => {
      let capturedUrl = "";
      globalThis.fetch = mock<typeof fetch>((url: string) => {
        capturedUrl = url;
        return Promise.resolve(mockResponse({ _body: {} }));
      });

      const client = new ProviderHttpClient({
        baseUrl: "https://api.example.com",
        defaultParams: { format: "json" },
      });

      await client.get("/v3/data");
      expect(capturedUrl).toContain("format=json");
    });
  });
});
