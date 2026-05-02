import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { QueryExecutor, ProviderError, EmptyDataError, globalRegistry } from "@openmoney/provider-core";

const executor = new QueryExecutor(globalRegistry);

const marketData = new Hono();

/**
 * GET /api/equity/quote
 * Get real-time equity quotes. Uses provider system.
 *
 * Query params:
 *   symbol - ticker symbol (required)
 *   provider - data provider (optional, defaults to "yfinance")
 */
marketData.get(
  "/api/equity/quote",
  zValidator(
    "query",
    z.object({
      symbol: z.string().min(1).transform((s) => s.toUpperCase()),
      provider: z.string().default("yfinance"),
    }),
  ),
  async (c) => {
    const { symbol, provider } = c.req.valid("query");
    try {
      const data = await executor.execute(
        provider,
        "equity/quote",
        { symbol },
      );
      return c.json({ data, provider });
    } catch (error) {
      if (error instanceof EmptyDataError) {
        return c.json({ error: error.message, data: [] }, 404);
      }
      if (error instanceof ProviderError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  },
);

/**
 * GET /api/equity/historical
 * Get historical equity data.
 *
 * Query params:
 *   symbol - ticker symbol (required)
 *   interval - data interval (optional, default "1d")
 *   period - time period (optional, default "1y")
 *   provider - data provider (optional, defaults to "yfinance")
 */
marketData.get(
  "/api/equity/historical",
  zValidator(
    "query",
    z.object({
      symbol: z.string().min(1).transform((s) => s.toUpperCase()),
      interval: z.enum(["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]).default("1d"),
      period: z.enum(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]).default("1y"),
      provider: z.string().default("yfinance"),
    }),
  ),
  async (c) => {
    const { symbol, interval, period, provider } = c.req.valid("query");
    try {
      const data = await executor.execute(
        provider,
        "equity/historical",
        { symbol, interval, period },
      );
      return c.json({ data, provider });
    } catch (error) {
      if (error instanceof EmptyDataError) {
        return c.json({ error: error.message, data: [] }, 404);
      }
      if (error instanceof ProviderError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  },
);

/**
 * GET /api/equity/profile
 * Get company profile / info.
 */
marketData.get(
  "/api/equity/profile",
  zValidator(
    "query",
    z.object({
      symbol: z.string().min(1).transform((s) => s.toUpperCase()),
      provider: z.string().default("yfinance"),
    }),
  ),
  async (c) => {
    const { symbol, provider } = c.req.valid("query");
    try {
      const data = await executor.execute(
        provider,
        "equity/profile",
        { symbol },
      );
      return c.json({ data, provider });
    } catch (error) {
      if (error instanceof EmptyDataError) {
        return c.json({ error: error.message, data: [] }, 404);
      }
      if (error instanceof ProviderError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  },
);

/**
 * GET /api/equity/key-metrics
 * Get key financial metrics for a symbol.
 */
marketData.get(
  "/api/equity/key-metrics",
  zValidator(
    "query",
    z.object({
      symbol: z.string().min(1).transform((s) => s.toUpperCase()),
      provider: z.string().default("yfinance"),
    }),
  ),
  async (c) => {
    const { symbol, provider } = c.req.valid("query");
    try {
      const data = await executor.execute(
        provider,
        "equity/key-metrics",
        { symbol },
      );
      return c.json({ data, provider });
    } catch (error) {
      if (error instanceof EmptyDataError) {
        return c.json({ error: error.message, data: [] }, 404);
      }
      if (error instanceof ProviderError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  },
);

/**
 * Provider info routes (separate router for clean exports).
 */
const providerRoutes = new Hono();

/**
 * GET /api/provider
 * List available providers and their supported models.
 */
providerRoutes.get("/api/provider", (c) => {
  const providers = globalRegistry.getAll();
  const result: Record<string, { description: string; models: string[]; requiresCredentials: boolean }> = {};

  for (const [name, provider] of providers) {
    result[name] = {
      description: provider.description,
      models: Array.from(provider.fetcherMap.keys()),
      requiresCredentials: provider.credentials.length > 0,
    };
  }

  return c.json({ providers: result });
});

/**
 * GET /api/provider/:name
 * Get details about a specific provider.
 */
providerRoutes.get("/api/provider/:name", (c) => {
  const name = c.req.param("name");
  const provider = globalRegistry.get(name);
  if (!provider) {
    return c.json({ error: `Provider '${name}' not found` }, 404);
  }
  return c.json({
    name: provider.name,
    description: provider.description,
    website: provider.website,
    credentials: provider.credentials,
    models: Array.from(provider.fetcherMap.keys()),
  });
});

export { marketData, providerRoutes };
