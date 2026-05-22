import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { globalRegistry, QueryExecutor } from "@openmoney/provider-core";
import { executeWithFallback, errorCodeToHttpStatus } from "@openmoney/shared";
import { executeProviderQuery, ok, fail } from "../lib/response";

const executor = new QueryExecutor(globalRegistry);

const queryRouter = new Hono();

/**
 * POST /api/query
 * Unified data query endpoint for ALL providers and models.
 *
 * This single endpoint replaces the need for separate domain-specific routes.
 * Clients specify which provider + model they want, along with params.
 *
 * Request body:
 *   { provider: "yfinance", model: "equity/quote", params: { symbol: "AAPL" } }
 *
 * Response (success):
 *   { success: true, data: [...], meta: { provider, model, timestamp, requestId, duration } }
 *
 * Response (error):
 *   { success: false, error: { code, message }, meta: { ... } }
 */
queryRouter.post(
  "/query",
  zValidator(
    "json",
    z.object({
      provider: z.string().min(1, { message: "Provider name is required" }),
      model: z.string().min(1, { message: "Model name is required" }),
      params: z.record(z.unknown()).default({}),
      credentials: z.record(z.string()).optional(),
      fallback: z.boolean().default(false).describe("Enable automatic provider fallback on failure"),
    }),
  ),
  async (c) => {
    const { provider, model, params, credentials, fallback } = c.req.valid("json");

    // With fallback enabled, try other providers if the requested one fails
    if (fallback) {
      try {
        const routeResult = await executeWithFallback(
          executor, globalRegistry, model,
          params as Record<string, unknown>,
          { requestedProvider: provider, credentials },
        );
        return c.json(ok(routeResult.data, {
          provider: routeResult.provider,
          model: routeResult.model,
          total: Array.isArray(routeResult.data) ? routeResult.data.length : undefined,
        }));
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const code = (error as Record<string, unknown>)?.code as string ?? "ALL_PROVIDERS_FAILED";
        const status = errorCodeToHttpStatus(code as any);
        return c.json(fail(code, err.message), status as 400 | 404 | 500 | 502);
      }
    }

    // Standard single-provider query
    const result = await executeProviderQuery(
      executor,
      provider,
      model,
      params as Record<string, unknown>,
      credentials,
    );

    if (!result.success) {
      const status = mapErrorCodeToStatus(result.error.code);
      return c.json(result, status as 400 | 401 | 404 | 429);
    }

    return c.json(result);
  },
);

/**
 * GET /api/providers
 * List available providers and their supported models.
 */
queryRouter.get("/providers", (c) => {
  const providers = globalRegistry.getAll();
  const data: Record<string, {
    description: string;
    models: string[];
    requiresCredentials: boolean;
  }> = {};

  for (const [name, p] of providers) {
    data[name] = {
      description: p.description,
      models: Array.from(p.fetcherMap.keys()),
      requiresCredentials: p.credentials.length > 0,
    };
  }

  return c.json(ok(data));
});

/**
 * GET /api/providers/:name
 * Get details about a specific provider.
 */
queryRouter.get("/providers/:name", (c) => {
  const name = c.req.param("name");
  const provider = globalRegistry.get(name);

  if (!provider) {
    return c.json(
      fail("PROVIDER_NOT_FOUND", `Provider '${name}' not found`),
      404 as const,
    );
  }

  return c.json(ok({
    name: provider.name,
    description: provider.description,
    website: provider.website,
    credentials: provider.credentials,
    models: Array.from(provider.fetcherMap.keys()),
  }));
});

/** Map provider error codes to HTTP status codes. */
function mapErrorCodeToStatus(code: string): number {
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

export { queryRouter };
