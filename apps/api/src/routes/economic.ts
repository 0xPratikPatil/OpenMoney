/**
 * Economic Data Domain Router
 *
 * Routes for economic data:
 *   calendar, indicators
 *
 * Uses the standardized createProviderQueryHandler helper.
 * Note: yfinance does not currently provide economic models, but this
 * router is ready for providers like FRED or TradingEconomics.
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

const CalendarQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  country: z.string().optional(),
  provider: z.string().default(DEFAULT_PROVIDER),
});

const IndicatorsQuerySchema = z.object({
  symbol: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  provider: z.string().default(DEFAULT_PROVIDER),
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/economic/calendar
 * Get the economic calendar for upcoming events.
 *
 * Query params:
 *   startDate - Start date filter (ISO 8601)
 *   endDate   - End date filter (ISO 8601)
 *   country   - Country filter (e.g., "US")
 *   provider  - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/calendar",
  zValidator("query", CalendarQuerySchema),
  async (c) => {
    const { startDate, endDate, country, provider } = c.req.valid("query");
    const params: Record<string, unknown> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (country) params.country = country;
    return createProviderQueryHandler(c, executor, provider, "economic/calendar", params);
  },
);

/**
 * GET /api/economic/indicators
 * Get economic indicator data.
 *
 * Query params:
 *   symbol    - Indicator symbol (e.g., "GDP", "CPI") (required)
 *   startDate - Start date filter (ISO 8601)
 *   endDate   - End date filter (ISO 8601)
 *   provider  - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/indicators",
  zValidator("query", IndicatorsQuerySchema),
  async (c) => {
    const { symbol, startDate, endDate, provider } = c.req.valid("query");
    const params: Record<string, unknown> = { symbol };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return createProviderQueryHandler(c, executor, provider, "economic/indicators", params);
  },
);

export { router as economicRouter };
