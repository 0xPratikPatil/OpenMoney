/**
 * Common Route Helpers
 *
 * Every domain router should use these helpers to avoid repeating
 * validation, error handling, and response formatting logic.
 *
 * Uses the global provider router for automatic fallback across providers.
 */

import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "hono";
import { QueryExecutor, globalRegistry } from "@openmoney/provider-core";
import { executeProviderQuery } from "../lib/response";
import { requestContext } from "../middleware/request-context";
import { errorCodeToHttpStatus } from "@openmoney/shared";

/** Default provider to use when none is specified. */
export const DEFAULT_PROVIDER = "yfinance";

/**
 * Common query schema that most domain endpoints share.
 * Individual routes extend this with their own symbol/params.
 */
export const BaseQuerySchema = z.object({
  provider: z.string().default(DEFAULT_PROVIDER),
});

/**
 * Create a domain router with the request context middleware pre-applied.
 *
 * Every route inside this router will have access to `c.get('requestId')`
 * and `c.get('startTime')`.
 *
 * @param basePath - The base path for the router (e.g., "/api/equity")
 * @returns A configured Hono router
 */
export function createDomainRouter(basePath?: string): Hono {
  const router = new Hono();
  router.use("*", requestContext);
  if (basePath) {
    return new Hono().basePath(basePath).route("/", router);
  }
  return router;
}

/**
 * Extract credentials from request headers + environment for a given provider.
 *
 * Priority:
 *   1. X-Provider-Key-<PROVIDER> header (user-supplied per-request)
 *   2. Environment variable: <PROVIDER>_API_KEY
 *
 * Returns a credential map keyed by the provider's declared credential names,
 * or undefined if no credentials are available.
 */
export function extractProviderCredentials(
  c: Context,
  providerName: string,
): Record<string, string> | undefined {
  const provider = globalRegistry.get(providerName);
  if (!provider || provider.credentials.length === 0) {
    return undefined;
  }

  const creds: Record<string, string> = {};
  let hasAny = false;

  for (const credName of provider.credentials) {
    const headerKey = `x-provider-key-${providerName}_${credName}`;
    const envKey = `${providerName.toUpperCase()}_${credName.toUpperCase()}`;

    // Priority 1: Request header
    const headerVal = c.req.header(headerKey);
    if (headerVal) {
      creds[credName] = headerVal;
      hasAny = true;
      continue;
    }

    // Priority 2: Environment variable
    const envVal = process.env[envKey];
    if (envVal) {
      creds[credName] = envVal;
      hasAny = true;
    }
  }

  return hasAny ? creds : undefined;
}

/**
 * Create a route that wraps a single provider query with standardized error handling.
 *
 * Credentials are automatically extracted from:
 *   1. X-Provider-Key-<PROVIDER>_<KEY> request headers
 *   2. <PROVIDER>_<KEY> environment variables
 *
 * ```ts
 * equityRouter.get("/quote", zValidator("query", QuoteQuerySchema), (c) => {
 *   const { symbol, provider } = c.req.valid("query");
 *   return createProviderQueryHandler(c, executor, provider, "equity/quote", { symbol });
 * });
 * ```
 *
 * @param c - Hono context
 * @param executor - QueryExecutor instance
 * @param provider - Provider name
 * @param model - Model name (e.g., "equity/quote")
 * @param params - Query parameters
 * @returns JSON response
 */
export async function createProviderQueryHandler<T>(
  c: Context,
  executor: QueryExecutor,
  provider: string,
  model: string,
  params: Record<string, unknown>,
): Promise<Response> {
  const credentials = extractProviderCredentials(c, provider);
  const result = await executeProviderQuery<T>(
    executor,
    provider,
    model,
    params,
    credentials,
  );
  if (!result.success) {
    return c.json(result, mapErrorCodeToStatus(result.error.code));
  }
  return c.json(result);
}

/**
 * Map provider error codes to HTTP status codes.
 * Delegates to the shared error code mapper for consistency.
 */
function mapErrorCodeToStatus(code: string): 200 | 400 | 401 | 404 | 422 | 429 | 500 | 502 | 503 | 504 {
  const status = errorCodeToHttpStatus(code as any);
  return status as 200 | 400 | 401 | 404 | 422 | 429 | 500 | 502 | 503 | 504;
}
