/**
 * Search Router
 *
 * Provides a unified provider-backed search endpoint.
 *
 * Uses the standardized createProviderQueryHandler helper.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { globalRegistry, QueryExecutor } from "@openmoney/provider-core";
import { requestContext } from "../middleware/request-context";
import { createProviderQueryHandler, DEFAULT_PROVIDER } from "./helpers";

const executor = new QueryExecutor(globalRegistry);

const router = new Hono();

router.use("*", requestContext);

// ---------------------------------------------------------------------------
// Schema definitions
// ---------------------------------------------------------------------------

const SearchQuerySchema = z.object({
  query: z.string().min(1, { message: "Search query is required" }),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  provider: z.string().default(DEFAULT_PROVIDER),
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/search
 * Unified search across providers for equities, ETFs, and other instruments.
 *
 * Query params:
 *   query    - Search text (required, min 1 character)
 *   limit    - Max results (default: 20, max: 100)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/",
  zValidator("query", SearchQuerySchema),
  async (c) => {
    const { query, limit, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/search", {
      query, limit,
    });
  },
);

export { router as searchRouter };
