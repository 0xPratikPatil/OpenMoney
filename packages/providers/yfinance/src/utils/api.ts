import { UnauthorizedError, RateLimitError } from "@openmoney/provider-core";

const YAHOO_FINANCE_BASE = "https://query1.finance.yahoo.com";

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
