/**
 * Forex Domain Router
 *
 * Routes for forex (currency) data:
 *   historical
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

const HistoricalQuerySchema = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  interval: z
    .enum(["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"])
    .default("1d"),
  period: z
    .enum(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"])
    .default("1y"),
  provider: z.string().default(DEFAULT_PROVIDER),
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/forex/historical
 * Get historical forex (currency pair) data.
 *
 * Query params:
 *   symbol   - Currency pair (e.g., "EURUSD", "GBPUSD") (required)
 *   interval - Data interval (default: "1d")
 *   period   - Time period (default: "1y")
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/historical",
  zValidator("query", HistoricalQuerySchema),
  async (c) => {
    const { symbol, interval, period, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "forex/historical", {
      symbol, interval, period,
    });
  },
);

export { router as forexRouter };
