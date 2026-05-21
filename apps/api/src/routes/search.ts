/**
 * Search Router
 *
 * Provider-backed ticker search. Tries the provider's native search model
 * first, then falls back to screener or other discovery models.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { globalRegistry, QueryExecutor } from "@openmoney/provider-core";
import { requestContext } from "../middleware/request-context";
import { executeProviderQuery } from "../lib/response";
import { DEFAULT_PROVIDER } from "./helpers";

const executor = new QueryExecutor(globalRegistry);

const router = new Hono();

router.use("*", requestContext);

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SearchQuerySchema = z.object({
  query: z.string().min(1, { message: "Search query is required" }),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  provider: z.string().default(DEFAULT_PROVIDER),
});

// ---------------------------------------------------------------------------
// Search model priority list per provider
// ---------------------------------------------------------------------------
const SEARCH_FALLBACK_MODELS = [
  "equity/search",
  "equity/screener",
  "equity/active",
  "equity/gainers",
  "equity/losers",
];

/**
 * GET /api/search?query=AAPL&provider=yfinance&limit=20
 *
 * Tries the provider's native search model, then falls back through
 * screener/discovery models until one works.
 */
router.get(
  "/",
  zValidator("query", SearchQuerySchema),
  async (c) => {
    const { query, limit, provider } = c.req.valid("query");
    const prov = globalRegistry.get(provider);

    if (!prov) {
      return c.json({
        success: false,
        error: { code: "PROVIDER_NOT_FOUND", message: `Provider '${provider}' not found` },
      }, 404);
    }

    const availableModels = Array.from(prov.fetcherMap.keys());
    const searchModel = SEARCH_FALLBACK_MODELS.find((m) => availableModels.includes(m))
      ?? availableModels[0];

    if (!searchModel) {
      return c.json({
        success: false,
        error: { code: "FETCHER_NOT_FOUND", message: `No search-capable model for provider '${provider}'` },
      }, 404);
    }

    const result = await executeProviderQuery(
      executor, provider, searchModel, { query, limit },
    );

    if (!result.success) {
      return c.json(result, result.error.code === "FETCHER_NOT_FOUND" ? 404 : 400);
    }
    return c.json(result);
  },
);

export { router as searchRouter };
