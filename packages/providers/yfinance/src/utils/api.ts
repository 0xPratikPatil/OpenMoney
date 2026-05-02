import { UnauthorizedError, RateLimitError, EmptyDataError } from "@openmoney/provider-core";

const YAHOO_FINANCE_BASE = "https://query1.finance.yahoo.com";
const YAHOO_BASE_QUERY2 = "https://query2.finance.yahoo.com";

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

export interface YahooFinanceHistoricalRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

/**
 * Fetch quotes from Yahoo Finance for one or more symbols.
 */
export async function fetchQuotes(symbols: string[]): Promise<Record<string, YahooFinanceQuote>> {
  const symbolStr = symbols.join(",");
  const url = `${YAHOO_FINANCE_BASE}/v7/finance/quote?symbols=${encodeURIComponent(symbolStr)}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Yahoo Finance rate limit exceeded");
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const result: Record<string, YahooFinanceQuote> = {};

  if (data?.quoteResponse?.result) {
    for (const quote of data.quoteResponse.result) {
      result[quote.symbol] = quote as YahooFinanceQuote;
    }
  }

  return result;
}

/**
 * Fetch historical OHLCV data from Yahoo Finance.
 */
export async function fetchHistorical(
  symbol: string,
  interval: "1d" | "1wk" | "1mo" = "1d",
  range: "1mo" | "3mo" | "6mo" | "1y" | "5y" | "max" = "1y",
): Promise<YahooFinanceHistoricalRow[]> {
  const url = `${YAHOO_FINANCE_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError("Yahoo Finance rate limit exceeded");
    throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const result = data?.chart?.result?.[0];

  if (!result) return [];

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
 * Search symbols on Yahoo Finance.
 */
export async function searchSymbols(query: string): Promise<any[]> {
  const url = `${YAHOO_FINANCE_BASE}/v1/finance/search?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance search error: ${response.status}`);
  }

  const data = (await response.json()) as any;
  return data?.quotes ?? [];
}

/**
 * Execute a Yahoo Finance screener POST request.
 * Used by: active, gainers, losers, aggressive_small_caps, growth_tech,
 * undervalued_growth, undervalued_large_caps, equity_screener
 */
export async function fetchScreener(
  body: Record<string, unknown>,
  limit = 200,
): Promise<any[]> {
  const url = `${YAHOO_BASE_QUERY2}/v1/finance/screener`;
  const params = new URLSearchParams({
    corsDomain: "finance.yahoo.com",
    formatted: "false",
    lang: "en-US",
    region: "US",
  });

  const results: any[] = [];
  let offset = 0;

  while (results.length < limit) {
    const response = await fetch(`${url}?${params}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ ...body, offset }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new RateLimitError("Yahoo Finance rate limit exceeded");
      throw new Error(`Yahoo Finance screener error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const result = data?.finance?.result?.[0];
    const quotes: any[] = result?.quotes ?? [];
    const total = result?.total ?? 0;

    if (quotes.length === 0) break;

    // Process earnings date
    for (const quote of quotes) {
      if (quote.earningsTimestamp) {
        quote.earnings_date = new Date(quote.earningsTimestamp * 1000).toISOString();
      }
    }

    results.push(...quotes);
    if (results.length >= total || quotes.length < (body.size as number ?? 250)) break;
  }

  return results.slice(0, limit);
}

/**
 * Fetch key executives for a company from assetProfile.
 */
export async function fetchKeyExecutives(symbol: string): Promise<any[]> {
  const url = `${YAHOO_FINANCE_BASE}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Yahoo Finance error: ${response.status}`);
  const data = (await response.json()) as any;
  return data?.quoteSummary?.result?.[0]?.assetProfile?.companyOfficers ?? [];
}

/**
 * Fetch quoteSummary modules from Yahoo Finance.
 */
export async function fetchQuoteSummary(symbol: string, modules: string): Promise<any> {
  const url = `${YAHOO_FINANCE_BASE}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Yahoo Finance error: ${response.status}`);
  const data = (await response.json()) as any;
  const result = data?.quoteSummary?.result?.[0];
  if (!result) throw new EmptyDataError(`No data returned for ${symbol}`);
  return result;
}

/**
 * Fetch chart data with custom period parameters.
 */
export async function fetchChartData(
  symbol: string,
  interval: string = "1d",
  period1?: number,
  period2?: number,
): Promise<YahooFinanceHistoricalRow[]> {
  const params = new URLSearchParams({ interval });
  if (period1) params.set("period1", String(period1));
  if (period2) params.set("period2", String(period2));

  const url = `${YAHOO_FINANCE_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Yahoo Finance chart error: ${response.status}`);

  const data = (await response.json()) as any;
  const result = data?.chart?.result?.[0];
  if (!result) return [];

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
