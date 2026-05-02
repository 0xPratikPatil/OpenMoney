/**
 * Equity Domain Router
 *
 * Routes for equity-related data:
 *   quote, historical, profile, key-metrics, income-statement,
 *   balance-sheet, cash-flow, news, options, dividends, screener, search
 *
 * Uses the standardized createProviderQueryHandler helper for all responses.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { globalRegistry, QueryExecutor } from "@openmoney/provider-core";
import { requestContext } from "../middleware/request-context";
import { createProviderQueryHandler, DEFAULT_PROVIDER } from "./helpers";

const executor = new QueryExecutor(globalRegistry);

const router = new Hono();

// Apply request context to all routes
router.use("*", requestContext);

// ---------------------------------------------------------------------------
// Schema definitions
// ---------------------------------------------------------------------------

const SymbolQuerySchema = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  provider: z.string().default(DEFAULT_PROVIDER),
});

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

const NewsQuerySchema = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  provider: z.string().default(DEFAULT_PROVIDER),
});

const OptionsQuerySchema = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  expiration: z.string().optional(),
  provider: z.string().default(DEFAULT_PROVIDER),
});

const DividendsQuerySchema = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  provider: z.string().default(DEFAULT_PROVIDER),
});

const ScreenerQuerySchema = z.object({
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(250).default(50),
  provider: z.string().default(DEFAULT_PROVIDER),
});

const SearchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  provider: z.string().default(DEFAULT_PROVIDER),
});

const FinancialStatementQuerySchema = z.object({
  symbol: z.string().min(1).transform((s) => s.toUpperCase()),
  period: z.enum(["annual", "quarterly"]).default("annual"),
  limit: z.coerce.number().int().min(1).max(12).default(4),
  provider: z.string().default(DEFAULT_PROVIDER),
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/equity/quote
 * Get real-time equity quote for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/quote",
  zValidator("query", SymbolQuerySchema),
  async (c) => {
    const { symbol, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/quote", { symbol });
  },
);

/**
 * GET /api/equity/historical
 * Get historical equity prices for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   interval - Data interval: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
 *   period   - Time period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/historical",
  zValidator("query", HistoricalQuerySchema),
  async (c) => {
    const { symbol, interval, period, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/historical", {
      symbol, interval, period,
    });
  },
);

/**
 * GET /api/equity/profile
 * Get company profile for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/profile",
  zValidator("query", SymbolQuerySchema),
  async (c) => {
    const { symbol, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/profile", { symbol });
  },
);

/**
 * GET /api/equity/key-metrics
 * Get key financial metrics for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/key-metrics",
  zValidator("query", SymbolQuerySchema),
  async (c) => {
    const { symbol, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/key-metrics", { symbol });
  },
);

/**
 * GET /api/equity/income-statement
 * Get income statement for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   period   - annual or quarterly (default: annual)
 *   limit    - Number of periods (default: 4)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/income-statement",
  zValidator("query", FinancialStatementQuerySchema),
  async (c) => {
    const { symbol, period, limit, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/income-statement", {
      symbol, period, limit,
    });
  },
);

/**
 * GET /api/equity/balance-sheet
 * Get balance sheet for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   period   - annual or quarterly (default: annual)
 *   limit    - Number of periods (default: 4)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/balance-sheet",
  zValidator("query", FinancialStatementQuerySchema),
  async (c) => {
    const { symbol, period, limit, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/balance-sheet", {
      symbol, period, limit,
    });
  },
);

/**
 * GET /api/equity/cash-flow
 * Get cash flow statement for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   period   - annual or quarterly (default: annual)
 *   limit    - Number of periods (default: 4)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/cash-flow",
  zValidator("query", FinancialStatementQuerySchema),
  async (c) => {
    const { symbol, period, limit, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/cash-flow", {
      symbol, period, limit,
    });
  },
);

/**
 * GET /api/equity/news
 * Get company news for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   limit    - Number of news items (default: 10, max: 100)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/news",
  zValidator("query", NewsQuerySchema),
  async (c) => {
    const { symbol, limit, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/news", {
      symbol, limit,
    });
  },
);

/**
 * GET /api/equity/options
 * Get options chains for a symbol.
 *
 * Query params:
 *   symbol     - Ticker symbol (required)
 *   expiration - Optional expiration date
 *   provider   - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/options",
  zValidator("query", OptionsQuerySchema),
  async (c) => {
    const { symbol, expiration, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/options", {
      symbol, ...(expiration ? { expiration } : {}),
    });
  },
);

/**
 * GET /api/equity/dividends
 * Get historical dividends for a symbol.
 *
 * Query params:
 *   symbol   - Ticker symbol (required)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/dividends",
  zValidator("query", DividendsQuerySchema),
  async (c) => {
    const { symbol, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/dividends", { symbol });
  },
);

/**
 * GET /api/equity/screener
 * Screen equities based on a query or criteria.
 *
 * Query params:
 *   query    - Optional screener text/query
 *   limit    - Max results (default: 50, max: 250)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/screener",
  zValidator("query", ScreenerQuerySchema),
  async (c) => {
    const { query, limit, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/screener", {
      ...(query ? { query } : {}), limit,
    });
  },
);

/**
 * GET /api/equity/search
 * Search equities by name or ticker.
 *
 * Query params:
 *   query    - Search text (required)
 *   limit    - Max results (default: 20, max: 50)
 *   provider - Data provider (optional, defaults to "yfinance")
 */
router.get(
  "/search",
  zValidator("query", SearchQuerySchema),
  async (c) => {
    const { query, limit, provider } = c.req.valid("query");
    return createProviderQueryHandler(c, executor, provider, "equity/search", {
      query, limit,
    });
  },
);

export { router as equityRouter };
