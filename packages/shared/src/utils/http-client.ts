/**
 * Shared Provider HTTP Client
 *
 * Eliminates massive code duplication across all 33+ provider packages by
 * providing a single, configurable HTTP client that handles:
 *
 * - Automatic retry with exponential backoff + jitter
 * - Rate-limit detection (HTTP 429 → {@link RateLimitError})
 * - Auth-error detection (HTTP 401/403 → {@link UnauthorizedError})
 * - Standard error mapping for all other HTTP statuses
 * - In-memory response caching with configurable TTL
 * - Request timeout
 * - User-Agent header management
 * - Credential injection strategies (query param, header, bearer token)
 * - Structured logging hooks via `logger` callback
 *
 * @module http-client
 */

import {
  ProviderError,
  RateLimitError,
  UnauthorizedError,
} from "@openmoney/provider-core";
import { classifyHttpError, safeParseJson } from "./provider-errors.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Credential injection strategy.
 *
 * - `"header"`:  Adds a header like `X-API-Key: <value>`
 * - `"query"`:   Adds a query parameter like `?apikey=<value>`
 * - `"bearer"`:  Adds an `Authorization: Bearer <value>` header
 */
export type AuthType = "header" | "query" | "bearer";

/**
 * Authentication configuration for a provider.
 */
export interface AuthConfig {
  /** How the credential is sent. */
  type: AuthType;
  /**
   * The header name (for `"header"` / `"bearer"`) or query-param name
   * (for `"query"`).  Examples: `"X-API-Key"`, `"apikey"`, `"Authorization"`.
   */
  key: string;
  /**
   * The key used to look up the credential value from the credentials map
   * passed at request time.  Example: `"fmp_api_key"`, `"polygon_api_key"`.
   */
  credentialKey: string;
}

/**
 * Retry configuration.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3). */
  maxRetries: number;
  /** Base delay in ms before the first retry (default: 1000). */
  baseDelayMs: number;
  /** Maximum delay in ms between retries (default: 10_000). */
  maxDelayMs: number;
}

/**
 * Cache configuration.
 *
 * Caching is opt-in; it is disabled by default.
 */
export interface CacheConfig {
  /** Whether caching is enabled (default: false). */
  enabled: boolean;
  /** Time-to-live for cached entries in ms (default: 60_000). */
  ttlMs: number;
}

/**
 * Rate-limit detection configuration.
 */
export interface RateLimitDetectionConfig {
  /** Whether to check for rate-limit responses (default: true). */
  enabled: boolean;
  /** The response header to read the retry-after value from (default: "Retry-After"). */
  retryAfterHeader: string;
}

/**
 * Optional logger interface.  Silently ignored when not provided.
 */
export interface Logger {
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

/**
 * Full configuration for the {@link ProviderHttpClient}.
 */
export interface HttpClientConfig {
  /** Base URL for all requests (e.g. `"https://financialmodelingprep.com/api"`). */
  baseUrl: string;

  /** Optional default headers sent with every request. */
  headers?: Record<string, string>;

  /** Optional default query parameters sent with every request. */
  defaultParams?: Record<string, string>;

  /** Request timeout in milliseconds (default: 30_000). */
  timeout?: number;

  /** Retry configuration. */
  retry?: Partial<RetryConfig>;

  /** Cache configuration (opt-in, disabled by default). */
  cache?: Partial<CacheConfig>;

  /** Rate-limit detection configuration. */
  rateLimitDetection?: Partial<RateLimitDetectionConfig>;

  /** Custom User-Agent string. */
  userAgent?: string;

  /** Credential injection strategy. */
  auth?: AuthConfig;

  /** Optional structured logger. */
  logger?: Logger;
}

/**
 * Resolved (post-merge-with-defaults) internal config type.
 */
interface ResolvedConfig {
  baseUrl: string;
  headers: Record<string, string>;
  defaultParams: Record<string, string>;
  timeout: number;
  retry: RetryConfig;
  cache: CacheConfig;
  rateLimitDetection: RateLimitDetectionConfig;
  userAgent: string;
  auth: AuthConfig | undefined;
  logger: Logger | undefined;
}

/**
 * Internal request options passed through the pipeline.
 */
export interface InternalRequestOptions {
  method: string;
  path: string;
  queryParams?: Record<string, string | number | undefined>;
  body?: unknown;
  credentials?: Record<string, string>;
  /** Override the base URL for this request. */
  baseUrlOverride?: string;
  /** Override headers for this request (merged on top of defaults). */
  headersOverride?: Record<string, string>;
}

/**
 * Cache entry stored in the in-memory cache.
 */
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Cache statistics.
 */
export interface CacheStats {
  /** Number of entries currently in the cache. */
  size: number;
  /** Number of cache hits since creation or last {@link clearCache}. */
  hits: number;
  /** Number of cache misses since creation or last {@link clearCache}. */
  misses: number;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRY: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1_000,
  maxDelayMs: 10_000,
};
const DEFAULT_CACHE: CacheConfig = {
  enabled: false,
  ttlMs: 60_000,
};
const DEFAULT_RATE_LIMIT: RateLimitDetectionConfig = {
  enabled: true,
  retryAfterHeader: "Retry-After",
};
const DEFAULT_USER_AGENT = "OpenMoney/0.1.0 (+https://openmoney.dev)";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Shared HTTP client for all OpenMoney data providers.
 *
 * Designed to eliminate the error-handling / retry / caching / auth-injection
 * boilerplate that every provider package currently duplicates.
 *
 * @example
 * ```ts
 * const client = new ProviderHttpClient({
 *   baseUrl: "https://financialmodelingprep.com/api",
 *   auth: { type: "query", key: "apikey", credentialKey: "fmp_api_key" },
 *   retry: { maxRetries: 3 },
 *   cache: { enabled: true, ttlMs: 30_000 },
 * });
 *
 * const data = await client.get<FmpQuote[]>("/v3/quote/AAPL", {}, { fmp_api_key: "abc" });
 * ```
 */
export class ProviderHttpClient {
  private readonly config: ResolvedConfig;
  private readonly cache: Map<string, CacheEntry<unknown>> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  // -----------------------------------------------------------------------
  // Construction
  // -----------------------------------------------------------------------

  constructor(config: HttpClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      headers: config.headers ?? {},
      defaultParams: config.defaultParams ?? {},
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
      retry: { ...DEFAULT_RETRY, ...config.retry },
      cache: { ...DEFAULT_CACHE, ...config.cache },
      rateLimitDetection: { ...DEFAULT_RATE_LIMIT, ...config.rateLimitDetection },
      userAgent: config.userAgent ?? DEFAULT_USER_AGENT,
      auth: config.auth,
      logger: config.logger,
    };
  }

  // -----------------------------------------------------------------------
  // Public HTTP methods
  // -----------------------------------------------------------------------

  /**
   * Perform an HTTP GET request.
   *
   * @param path        - URL path relative to `baseUrl` (e.g. `"/v3/quote/AAPL"`)
   * @param params      - Optional query parameters (values set to `undefined` are omitted)
   * @param credentials - Provider credentials map, used for auth injection
   * @returns Parsed response body typed as `T`
   */
  async get<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
    credentials?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>({
      method: "GET",
      path,
      queryParams: params,
      credentials,
    });
  }

  /**
   * Perform an HTTP POST request.
   *
   * @param path        - URL path relative to `baseUrl`
   * @param body        - Request body (serialized to JSON)
   * @param credentials - Provider credentials map
   * @returns Parsed response body typed as `T`
   */
  async post<T>(
    path: string,
    body?: unknown,
    credentials?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>({
      method: "POST",
      path,
      body,
      credentials,
    });
  }

  /**
   * Low-level request method.  Most callers should use {@link get} or
   * {@link post} instead.
   *
   * @typeParam T - Expected response shape
   */
  async request<T>(options: InternalRequestOptions): Promise<T> {
    const {
      method,
      path,
      queryParams,
      body,
      credentials,
      baseUrlOverride,
      headersOverride,
    } = options;

    // Build URL
    const baseUrl = baseUrlOverride ?? this.config.baseUrl;
    const url = new URL(path.startsWith("http") ? path : `${baseUrl}${path}`);

    // Apply default query params
    const defaultParams = this.config.defaultParams;
    for (const key of Object.keys(defaultParams)) {
      url.searchParams.set(key, defaultParams[key]!);
    }

    // Apply per-request query params (skip undefined)
    if (queryParams) {
      for (const [key, val] of Object.entries(queryParams)) {
        if (val !== undefined) {
          url.searchParams.set(key, String(val));
        }
      }
    }

    // Inject credentials into query if configured
    const auth = this.config.auth;
    if (auth?.type === "query" && credentials) {
      const credVal = credentials[auth.credentialKey];
      if (credVal) {
        url.searchParams.set(auth.key, credVal);
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      ...this.config.headers,
      ...headersOverride,
      "User-Agent": this.config.userAgent,
    };

    if (body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    // Inject credentials into headers if configured
    if (credentials && auth) {
      const credVal = credentials[auth.credentialKey];
      if (credVal) {
        if (auth.type === "header") {
          headers[auth.key] = credVal;
        } else if (auth.type === "bearer") {
          headers[auth.key] = `Bearer ${credVal}`;
        }
        // "query" type already handled above
      }
    }

    // Optional: check cache for GET requests
    const cacheKey = this.cacheKey(method, url.toString());
    if (method === "GET") {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached !== undefined) return cached;
    }

    // Serialize body
    const bodyString = body !== undefined ? JSON.stringify(body) : undefined;

    // Execute with retry
    const result = await this.executeWithRetry<T>({
      method,
      url: url.toString(),
      headers,
      body: bodyString,
      cacheKey: method === "GET" ? cacheKey : undefined,
    });

    return result;
  }

  // -----------------------------------------------------------------------
  // Cache management
  // -----------------------------------------------------------------------

  /**
   * Remove all cached entries.
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Returns current cache statistics.
   */
  getCacheStats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
    };
  }

  // -----------------------------------------------------------------------
  // Private: retry loop
  // -----------------------------------------------------------------------

  /**
   * Execute a single HTTP request with retry & timeout logic.
   */
  private async executeWithRetry<T>(opts: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    cacheKey?: string;
  }): Promise<T> {
    const { method, url, headers, body, cacheKey } = opts;
    const { maxRetries, baseDelayMs, maxDelayMs } = this.config.retry;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          method,
          headers,
          body: body ?? null,
        });

        // Handle non-2xx responses
        if (!response.ok) {
          const retryAfter = response.headers.get(
            this.config.rateLimitDetection.retryAfterHeader,
          );
          const error = classifyHttpError(
            response.status,
            response.statusText,
            retryAfter,
            url,
          );

          // Retry on 429 (rate-limit) or 5xx (server errors)
          const isRetryable =
            response.status === 429 || response.status >= 500;

          if (isRetryable && attempt < maxRetries) {
            const delay = this.calculateDelay(
              attempt,
              baseDelayMs,
              maxDelayMs,
              retryAfter,
            );
            this.config.logger?.warn(
              `[ProviderHttpClient] ${method} ${url} → ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
            );
            await this.sleep(delay);
            continue;
          }

          lastError = error;
          break;
        }

        // Parse response body
        const data = await safeParseJson<T>(response);
        if (data === null) {
          // Some providers return plain text for empty results
          const text = await response.text().catch(() => "");
          if (text.length === 0) {
            // Empty successful response (e.g. 204 No Content)
            return undefined as unknown as T;
          }
          return text as unknown as T;
        }

        // Cache GET responses
        if (cacheKey) {
          this.setInCache(cacheKey, data);
        }

        return data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Retry on network / timeout errors
        if (attempt < maxRetries) {
          const delay = this.calculateDelay(attempt, baseDelayMs, maxDelayMs);
          this.config.logger?.warn(
            `[ProviderHttpClient] ${method} ${url} → network error: ${lastError.message}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
          );
          await this.sleep(delay);
          continue;
        }
        break;
      }
    }

    throw lastError ?? new ProviderError("Request failed after retries", "REQUEST_FAILED");
  }

  // -----------------------------------------------------------------------
  // Private: fetch with timeout
  // -----------------------------------------------------------------------

  /**
   * Wrapper around `fetch` that aborts after the configured timeout.
   */
  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  // -----------------------------------------------------------------------
  // Private: cache helpers
  // -----------------------------------------------------------------------

  /**
   * Build a deterministic cache key from method + URL.
   */
  private cacheKey(method: string, url: string): string {
    return `${method}:${url}`;
  }

  /**
   * Attempt to retrieve a cached value.  Expired entries are evicted.
   */
  private getFromCache<T>(key: string): T | undefined {
    if (!this.config.cache.enabled) return undefined;

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.cacheMisses++;
      return undefined;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.cacheMisses++;
      return undefined;
    }

    this.cacheHits++;
    return entry.data;
  }

  /**
   * Store a value in the cache.
   */
  private setInCache<T>(key: string, data: T): void {
    if (!this.config.cache.enabled) return;

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.config.cache.ttlMs,
    });
  }

  // -----------------------------------------------------------------------
  // Private: retry delay calculation
  // -----------------------------------------------------------------------

  /**
   * Calculate the delay before the next retry attempt.
   *
   * Implements exponential backoff with full jitter (like OpenBB's pattern):
   * ```
   * delay = min(baseDelayMs * 2^attempt, maxDelayMs)
   * jittered = random_between(0, delay)
   * ```
   *
   * If a `Retry-After` header value is provided, it takes precedence.
   *
   * @param attempt          - Zero-based attempt number
   * @param baseDelayMs      - Base delay in ms
   * @param maxDelayMs       - Cap on delay in ms
   * @param retryAfterSeconds - Optional `Retry-After` value from response header
   */
  private calculateDelay(
    attempt: number,
    baseDelayMs: number,
    maxDelayMs: number,
    retryAfterSeconds?: string | null,
  ): number {
    // Prefer server-provided retry-after value
    if (retryAfterSeconds) {
      const parsed = parseInt(retryAfterSeconds, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        return Math.min(parsed * 1000, maxDelayMs);
      }
    }

    // Exponential backoff with full jitter
    const exponential = Math.min(
      baseDelayMs * Math.pow(2, attempt),
      maxDelayMs,
    );
    return Math.floor(Math.random() * exponential);
  }

  // -----------------------------------------------------------------------
  // Private: sleep helper
  // -----------------------------------------------------------------------

  /**
   * Promise-based sleep.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
