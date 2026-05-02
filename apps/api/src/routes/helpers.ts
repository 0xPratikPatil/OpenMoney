/**
 * Common Route Helpers
 *
 * Every domain router should use these helpers to avoid repeating
 * validation, error handling, and response formatting logic.
 */

import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "hono";
import { QueryExecutor } from "@openmoney/provider-core";
import { executeProviderQuery } from "../lib/response";
import { requestContext } from "../middleware/request-context";

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
 * Create a route that wraps a single provider query with standardized error handling.
 *
 * This is the simplest way to create a domain route:
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
 * @param credentials - Optional API credentials
 * @returns JSON response
 */
export async function createProviderQueryHandler<T>(
  c: Context,
  executor: QueryExecutor,
  provider: string,
  model: string,
  params: Record<string, unknown>,
  credentials?: Record<string, string>,
): Promise<Response> {
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
 */
function mapErrorCodeToStatus(code: string): 400 | 401 | 404 | 429 {
  switch (code) {
    case "PROVIDER_NOT_FOUND":
    case "FETCHER_NOT_FOUND":
    case "EMPTY_DATA":
      return 404;
    case "UNAUTHORIZED":
      return 401;
    case "RATE_LIMIT":
      return 429;
    default:
      return 400;
  }
}
