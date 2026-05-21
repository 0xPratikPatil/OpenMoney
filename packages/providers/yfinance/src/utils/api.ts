/**
 * Yahoo Finance API utilities.
 *
 * Provides a clean, typed interface for all Yahoo Finance REST endpoints.
 * All HTTP calls go through the shared {@link ProviderHttpClient} which
 * handles retries, rate-limit detection, caching, and error mapping.
 *
 * @module api
 */

import { ProviderHttpClient } from "@openmoney/shared";
import { EmptyDataError, UnauthorizedError } from "@openmoney/provider-core";
import {
  getCookieAndCrumb,
  invalidateCookieCache,
} from "./cookie-crumb";

// ---------------------------------------------------------------------------
// Client instances
// ---------------------------------------------------------------------------
// We use separate clients for different cache profiles:
//   - yfClient:        30s TTL — real-time quotes, search, options, news
//   - yfHistoricalClient:  5min TTL — historical OHLCV, chart data
//   - yfQuery2Client:  30s TTL — screener endpoint (query2 host)

const YF_CLIENT_CONFIG = {
  baseUrl: "https://query1.finance.yahoo.com",
  userAgent: "Mozilla/5.0",
  retry: { maxRetries: 3, baseDelayMs: 1000 },
} as const;

const yfClient = new ProviderHttpClient({
  ...YF_CLIENT_CONFIG,
  cache: { enabled: true, ttlMs: 30_000 },
});

const yfHistoricalClient = new ProviderHttpClient({
  ...YF_CLIENT_CONFIG,
  cache: { enabled: true, ttlMs: 300_000 }, // 5 minutes
});

const yfQuery2Client = new ProviderHttpClient({
  baseUrl: "https://query2.finance.yahoo.com",
  userAgent: "Mozilla/5.0",
  retry: { maxRetries: 3, baseDelayMs: 1000 },
  cache: { enabled: true, ttlMs: 30_000 },
});

// ---------------------------------------------------------------------------
// Cookie/Crumb auth helper
// ---------------------------------------------------------------------------
// Yahoo v7/v10/v1(Query2) endpoints require:
//   1. A valid Cookie header with session cookies (A1, A3, GUC)
//   2. The crumb value sent as a query parameter (?crumb=xxx)
// The yfinance Python library sends crumb as a query param (not in headers),
// and toggles between "basic" and "csrf" cookie strategies on failure.
//
// v8 chart endpoints do NOT require auth.

async function withAuth(): Promise<{ cookie: string; crumb: string }> {
  return getCookieAndCrumb();
}

/**
 * Execute a request with cookie+crumble auth, retrying once on 401.
 * Both the Cookie header and crumb query param are injected.
 */
async function authRequest<T>(
  client: ProviderHttpClient,
  options: Omit<Parameters<typeof client.request>[0], "headersOverride" | "queryParams"> & {
    queryParams?: Record<string, string | number | undefined>;
  },
): Promise<T> {
  const exec = async () => {
    const { cookie, crumb } = await withAuth();
    return client.request<T>({
      ...options,
      headersOverride: { Cookie: cookie },
      queryParams: {
        ...(options.queryParams ?? {}),
        crumb,
      },
    });
  };

  try {
    return await exec();
  } catch (err) {
    if (err instanceof UnauthorizedError || (err as any)?.status === 401) {
      invalidateCookieCache();
      return exec();
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Shared TypeScript interfaces (consumed by fetcher models)
// ---------------------------------------------------------------------------

/**
 * Raw quote object returned by Yahoo Finance `/v7/finance/quote`.
 * Each element in `quoteResponse.result` has this shape.
 */
export interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  bid?: number;
  ask?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  trailingPE?: number;
  dividendYield?: number;
  earningsTimestamp?: number;
  shortName?: string;
  longName?: string;
  targetHighPrice?: number;
  targetLowPrice?: number;
  targetMeanPrice?: number;
  targetMedianPrice?: number;
  recommendationKey?: string;
  recommendationMean?: number;
  numberOfAnalystOpinions?: number;
  currentPrice?: number;
  currency?: string;
  sharesOutstanding?: number;
  floatShares?: number;
  impliedSharesOutstanding?: number;
  sharesShort?: number;
  sharesShortPriorMonth?: number;
  sharesShortPreviousMonthDate?: number;
  shortRatio?: number;
  shortPercentOfFloat?: number;
  dateShortInterest?: number;
  heldPercentInsiders?: number;
  heldPercentInstitutions?: number;
  institutionsFloatPercentHeld?: number;
  institutionsCount?: number;
}

/**
 * A single historical OHLCV row from Yahoo Finance chart endpoints.
 */
export interface YahooFinanceHistoricalRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

// ---------------------------------------------------------------------------
// Internal response shapes (not exported)
// ---------------------------------------------------------------------------

interface QuoteResponse {
  quoteResponse: {
    result: YahooFinanceQuote[];
  };
}

interface ChartResponse {
  chart: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: number[];
          high?: number[];
          low?: number[];
          close?: number[];
          volume?: number[];
        }>;
        adjclose?: Array<{
          adjclose?: number[];
        }>;
      };
      events?: {
        dividends?: Record<string, { amount: number; date: number }>;
      };
    }>;
  };
}

interface SearchResponse {
  quotes?: any[];
  news?: any[];
}

interface QuoteSummaryResponse {
  quoteSummary: {
    result?: Array<Record<string, any>>;
  };
}

interface ScreenerResponse {
  finance: {
    result?: Array<{
      quotes?: any[];
      total?: number;
    }>;
  };
}

interface OptionChainResponse {
  optionChain: {
    result?: any[];
  };
}

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------

/**
 * Fetch real-time quotes from Yahoo Finance for one or more symbols.
 *
 * Endpoint: `GET /v7/finance/quote?symbols=...`
 */
export async function fetchQuotes(symbols: string[]): Promise<Record<string, YahooFinanceQuote>> {
  const symbolStr = symbols.join(",");
  const data = await authRequest<QuoteResponse>(yfClient, {
    method: "GET",
    path: "/v7/finance/quote",
    queryParams: { symbols: symbolStr },
  });

  const result: Record<string, YahooFinanceQuote> = {};
  if (data?.quoteResponse?.result) {
    for (const quote of data.quoteResponse.result) {
      result[quote.symbol] = quote;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Historical / Chart data
// ---------------------------------------------------------------------------

/**
 * Parse chart result timestamps + indicators into structured rows.
 */
function parseChartResult(result: NonNullable<ChartResponse["chart"]["result"]>[number]): YahooFinanceHistoricalRow[] {
  const timestamps: number[] = result.timestamp ?? [];
  const quotes = result.indicators?.quote?.[0] ?? {};
  const adjclose = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const opens: number[] = quotes.open ?? [];
  const highs: number[] = quotes.high ?? [];
  const lows: number[] = quotes.low ?? [];
  const closes: number[] = quotes.close ?? [];
  const volumes: number[] = quotes.volume ?? [];

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString(),
      open: opens[i] ?? 0,
      high: highs[i] ?? 0,
      low: lows[i] ?? 0,
      close: closes[i] ?? 0,
      volume: volumes[i] ?? 0,
      adjClose: adjclose[i],
    }))
    .filter((row) => row.open > 0);
}

/**
 * Fetch historical OHLCV data from Yahoo Finance.
 *
 * Endpoint: `GET /v8/finance/chart/{symbol}?interval=...&range=...`
 *
 * @param symbol   - Yahoo Finance ticker (e.g. `"AAPL"`, `"^GSPC"`)
 * @param interval - Bar size: `"1d"`, `"1wk"`, or `"1mo"`
 * @param range    - Look-back window
 */
export async function fetchHistorical(
  symbol: string,
  interval: "1d" | "1wk" | "1mo" = "1d",
  range: "1mo" | "3mo" | "6mo" | "1y" | "5y" | "max" = "1y",
): Promise<YahooFinanceHistoricalRow[]> {
  const data = await yfHistoricalClient.get<ChartResponse>(
    `/v8/finance/chart/${encodeURIComponent(symbol)}`,
    { interval, range },
  );
  const result = data?.chart?.result?.[0];
  if (!result) return [];
  return parseChartResult(result);
}

/**
 * Fetch chart data with custom Unix-timestamp period bounds.
 *
 * Endpoint: `GET /v8/finance/chart/{symbol}?interval=...&period1=...&period2=...`
 *
 * Unlike {@link fetchHistorical} which uses a named range, this function
 * accepts arbitrary start / end timestamps.
 */
export async function fetchChartData(
  symbol: string,
  interval: string = "1d",
  period1?: number,
  period2?: number,
): Promise<YahooFinanceHistoricalRow[]> {
  const params: Record<string, string | number | undefined> = { interval };
  if (period1 !== undefined) params.period1 = period1;
  if (period2 !== undefined) params.period2 = period2;

  const data = await yfHistoricalClient.get<ChartResponse>(
    `/v8/finance/chart/${encodeURIComponent(symbol)}`,
    params,
  );
  const result = data?.chart?.result?.[0];
  if (!result) return [];
  return parseChartResult(result);
}

// ---------------------------------------------------------------------------
// Dividends (from chart events)
// ---------------------------------------------------------------------------

/**
 * Fetch historical dividends for a symbol via the chart endpoint.
 *
 * Endpoint: `GET /v8/finance/chart/{symbol}?interval=1d&range=max`
 *
 * Yahoo returns dividend events inside `chart.result[0].events.dividends`.
 */
export async function fetchDividends(
  symbol: string,
): Promise<Array<{ date: Date; dividend: number }>> {
  const data = await yfHistoricalClient.get<ChartResponse>(
    `/v8/finance/chart/${encodeURIComponent(symbol)}`,
    { interval: "1d", range: "max" },
  );
  const events = data?.chart?.result?.[0]?.events?.dividends;
  if (!events) return [];

  const dividends: Array<{ date: Date; dividend: number }> = [];
  for (const key of Object.keys(events)) {
    const ev = events[key]!;
    if (ev.amount && ev.date) {
      dividends.push({
        date: new Date(ev.date * 1000),
        dividend: ev.amount,
      });
    }
  }
  return dividends;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Search symbols on Yahoo Finance.
 *
 * Endpoint: `GET /v1/finance/search?q=...`
 */
export async function searchSymbols(query: string): Promise<any[]> {
  const data = await yfClient.get<SearchResponse>("/v1/finance/search", {
    q: query,
  });
  return data?.quotes ?? [];
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

/**
 * Fetch news articles for a symbol via the search endpoint.
 *
 * Endpoint: `GET /v1/finance/search?q=...` (same endpoint, but reads `news`)
 */
export async function fetchNews(symbol: string): Promise<any[]> {
  const data = await yfClient.get<SearchResponse>("/v1/finance/search", {
    q: symbol,
  });
  return data?.news ?? [];
}

// ---------------------------------------------------------------------------
// Screener
// ---------------------------------------------------------------------------

/**
 * Execute a Yahoo Finance screener POST request.
 *
 * Endpoint: `POST https://query2.finance.yahoo.com/v1/finance/screener`
 *
 * Used by most predefined screener fetchers (active, gainers, losers, etc.)
 * and the custom equity-screener.  Handles pagination internally.
 */
export async function fetchScreener(
  body: Record<string, unknown>,
  limit = 200,
): Promise<any[]> {
  const results: any[] = [];
  let offset = 0;

  while (results.length < limit) {
    const data = await authRequest<ScreenerResponse>(yfQuery2Client, {
      method: "POST",
      path: "/v1/finance/screener",
      queryParams: {
        corsDomain: "finance.yahoo.com",
        formatted: "false",
        lang: "en-US",
        region: "US",
      },
      body: { ...body, offset },
    });

    const result = data?.finance?.result?.[0];
    const quotes: any[] = result?.quotes ?? [];
    const total = result?.total ?? 0;

    if (quotes.length === 0) break;

    // Normalise earnings date
    for (const quote of quotes) {
      if (quote.earningsTimestamp) {
        quote.earnings_date = new Date(quote.earningsTimestamp * 1000).toISOString();
      }
    }

    results.push(...quotes);
    if (results.length >= total || quotes.length < ((body.size as number) ?? 250)) break;
    offset += quotes.length;
  }

  return results.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Key Executives
// ---------------------------------------------------------------------------

/**
 * Fetch key executives for a company.
 *
 * Endpoint: `GET /v10/finance/quoteSummary/{symbol}?modules=assetProfile`
 */
export async function fetchKeyExecutives(symbol: string): Promise<any[]> {
  const data = await authRequest<QuoteSummaryResponse>(yfClient, {
    method: "GET",
    path: `/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`,
    queryParams: { modules: "assetProfile" },
  });
  return data?.quoteSummary?.result?.[0]?.assetProfile?.companyOfficers ?? [];
}

// ---------------------------------------------------------------------------
// Quote Summary (generic)
// ---------------------------------------------------------------------------

/**
 * Fetch one or more quoteSummary modules from Yahoo Finance.
 *
 * Endpoint: `GET /v10/finance/quoteSummary/{symbol}?modules=...`
 *
 * @param symbol  - Ticker symbol
 * @param modules - Comma-separated module names (e.g. `"assetProfile"`,
 *                  `"defaultKeyStatistics,financialData"`)
 * @returns The `result[0]` object containing all requested modules.
 * @throws {@link EmptyDataError} when no data is returned.
 */
export async function fetchQuoteSummary(symbol: string, modules: string): Promise<any> {
  const data = await authRequest<QuoteSummaryResponse>(yfClient, {
    method: "GET",
    path: `/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`,
    queryParams: { modules },
  });
  const result = data?.quoteSummary?.result?.[0];
  if (!result) throw new EmptyDataError(`No data returned for ${symbol}`);
  return result;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/**
 * Fetch options chain for a symbol.
 *
 * Endpoint: `GET /v7/finance/options/{symbol}?date={expiration}`
 */
export async function fetchOptions(symbol: string, expiration?: string): Promise<any[]> {
  const path = `/v7/finance/options/${encodeURIComponent(symbol)}`;

  const data = await authRequest<OptionChainResponse>(yfClient, {
    method: "GET",
    path,
    queryParams: expiration ? { date: expiration } : undefined,
  });
  return data?.optionChain?.result ?? [];
}

// ---------------------------------------------------------------------------
// Income Statement
// ---------------------------------------------------------------------------

/**
 * Fetch income statement history for a symbol.
 *
 * Endpoint: `GET /v10/finance/quoteSummary/{symbol}?modules=incomeStatementHistory`
 */
export async function fetchIncomeStatements(symbol: string): Promise<any[]> {
  const data = await authRequest<QuoteSummaryResponse>(yfClient, {
    method: "GET",
    path: `/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`,
    queryParams: { modules: "incomeStatementHistory" },
  });
  return data?.quoteSummary?.result?.[0]?.incomeStatementHistory?.incomeStatementHistory ?? [];
}

// ---------------------------------------------------------------------------
// Balance Sheet
// ---------------------------------------------------------------------------

/**
 * Fetch balance sheet history for a symbol.
 *
 * Endpoint: `GET /v10/finance/quoteSummary/{symbol}?modules=balanceSheetHistory`
 */
export async function fetchBalanceSheets(symbol: string): Promise<any[]> {
  const data = await authRequest<QuoteSummaryResponse>(yfClient, {
    method: "GET",
    path: `/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`,
    queryParams: { modules: "balanceSheetHistory" },
  });
  return data?.quoteSummary?.result?.[0]?.balanceSheetHistory?.balanceSheetStatements ?? [];
}

// ---------------------------------------------------------------------------
// Cash Flow
// ---------------------------------------------------------------------------

/**
 * Fetch cash flow statement history for a symbol.
 *
 * Endpoint: `GET /v10/finance/quoteSummary/{symbol}?modules=cashflowStatementHistory`
 */
export async function fetchCashFlowStatements(symbol: string): Promise<any[]> {
  const data = await authRequest<QuoteSummaryResponse>(yfClient, {
    method: "GET",
    path: `/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`,
    queryParams: { modules: "cashflowStatementHistory" },
  });
  return data?.quoteSummary?.result?.[0]?.cashflowStatementHistory?.cashflowStatements ?? [];
}

// ---------------------------------------------------------------------------
// Futures Chain
// ---------------------------------------------------------------------------

/**
 * Fetch futures chain for a symbol.
 *
 * Endpoint: `GET /v10/finance/quoteSummary/{symbol}=F?modules=futuresChain`
 *
 * Returns an array of futures contract ticker symbols.
 */
export async function fetchFuturesChain(symbol: string): Promise<string[]> {
  const data = await authRequest<QuoteSummaryResponse>(yfClient, {
    method: "GET",
    path: `/v10/finance/quoteSummary/${encodeURIComponent(symbol + "=F")}`,
    queryParams: { modules: "futuresChain" },
  });
  return data?.quoteSummary?.result?.[0]?.futuresChain?.futures ?? [];
}
