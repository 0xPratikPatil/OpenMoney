import { EmptyDataError, RateLimitError } from "@openmoney/provider-core";

const TMX_MONEY_API = "https://app-money.tmx.com/api";
const TSX_DIRECTORY = "https://www.tsx.com/json/company-directory";
const MX_DATA = "https://www.m-x.ca/en/trading/data";
const ETF_CLOUDFRONT = "https://dgr53wu9i7rmp.cloudfront.net/etfs";

/**
 * Generic TMX API fetch with error handling.
 * TMX endpoints are public — no credentials required.
 */
export async function tmxFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; OpenMoney/1.0)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new RateLimitError("TMX API rate limit exceeded");
    }
    throw new Error(`TMX API error: ${response.status} ${response.statusText} for ${url}`);
  }

  const text = await response.text();
  if (!text || text.trim().length === 0) {
    throw new EmptyDataError("TMX API returned empty response");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`TMX API returned invalid JSON for ${url}`);
  }
}

/**
 * Fetch equity quote data from TMX Money API.
 * GET /api/quote/{symbol}
 */
export async function fetchQuote(symbol: string): Promise<Record<string, unknown>> {
  return tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/quote/${encodeURIComponent(symbol)}`,
  );
}

/**
 * Fetch historical data from TMX Money API.
 * GET /api/quote/{symbol}/history?interval=1d&range=1y
 */
export async function fetchHistorical(
  symbol: string,
  interval = "1d",
  range = "1y",
): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/quote/${encodeURIComponent(symbol)}/history?interval=${interval}&range=${range}`,
  );
  // TMX returns { history: [...] } or an array directly
  const rows = (data.history ?? data) as unknown[];
  return Array.isArray(rows) ? rows : [];
}

/**
 * Fetch company profile from TMX Money API.
 * GET /api/company/{symbol}
 */
export async function fetchCompanyProfile(symbol: string): Promise<Record<string, unknown>> {
  return tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/company/${encodeURIComponent(symbol)}`,
  );
}

/**
 * Search companies on TSX or TSXV exchange.
 * GET /json/company-directory/search/{exchange}/{query}
 */
export async function searchCompanies(
  exchange: "tsx" | "tsxv",
  query: string,
): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TSX_DIRECTORY}/search/${exchange}/${encodeURIComponent(query)}`,
  );
  // TSX directory returns { results: [...] }
  const results = data.results as unknown[];
  return Array.isArray(results) ? results : [];
}

/**
 * Fetch company filings from TMX Money API.
 * GET /api/company/{symbol}/filings
 */
export async function fetchFilings(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/company/${encodeURIComponent(symbol)}/filings`,
  );
  const filings = data.filings as unknown[];
  return Array.isArray(filings) ? filings : [];
}

/**
 * Fetch company news from TMX Money API.
 * GET /api/company/{symbol}/news
 */
export async function fetchCompanyNews(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/company/${encodeURIComponent(symbol)}/news`,
  );
  const news = data.news as unknown[];
  return Array.isArray(news) ? news : [];
}

/**
 * Fetch insider transactions from TMX Money API.
 * GET /api/company/{symbol}/insider-transactions
 */
export async function fetchInsiderTrading(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/company/${encodeURIComponent(symbol)}/insider-transactions`,
  );
  const transactions = data.transactions as unknown[];
  return Array.isArray(transactions) ? transactions : [];
}

/**
 * Fetch historical dividends from TMX Money API.
 * GET /api/company/{symbol}/dividends
 */
export async function fetchDividends(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/company/${encodeURIComponent(symbol)}/dividends`,
  );
  const dividends = data.dividends as unknown[];
  return Array.isArray(dividends) ? dividends : [];
}

/**
 * Fetch price target consensus from TMX Money API.
 * GET /api/company/{symbol}/price-targets
 */
export async function fetchPriceTargets(symbol: string): Promise<Record<string, unknown>> {
  return tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/company/${encodeURIComponent(symbol)}/price-targets`,
  );
}

/**
 * Fetch index data from TMX Money API.
 * GET /api/index/{symbol}
 */
export async function fetchIndex(symbol: string): Promise<Record<string, unknown>> {
  return tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/index/${encodeURIComponent(symbol)}`,
  );
}

/**
 * Fetch index constituents from TMX Money API.
 * GET /api/index/{symbol}/constituents
 */
export async function fetchIndexConstituents(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/index/${encodeURIComponent(symbol)}/constituents`,
  );
  const constituents = data.constituents as unknown[];
  return Array.isArray(constituents) ? constituents : [];
}

/**
 * Fetch index sectors from TMX Money API.
 * GET /api/index/{symbol}/sectors
 */
export async function fetchIndexSectors(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/index/${encodeURIComponent(symbol)}/sectors`,
  );
  const sectors = data.sectors as unknown[];
  return Array.isArray(sectors) ? sectors : [];
}

/**
 * Fetch full ETF list from TMX cloudfront.
 * GET /etfs/etfs.json
 */
export async function fetchEtfList(): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${ETF_CLOUDFRONT}/etfs/etfs.json`,
  );
  const etfs = data.etfs as unknown[];
  return Array.isArray(etfs) ? etfs : [];
}

/**
 * Fetch ETF holdings from TMX Money API.
 * GET /api/etf/{symbol}/holdings
 */
export async function fetchEtfHoldings(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/etf/${encodeURIComponent(symbol)}/holdings`,
  );
  const holdings = data.holdings as unknown[];
  return Array.isArray(holdings) ? holdings : [];
}

/**
 * Fetch ETF countries from TMX Money API.
 * GET /api/etf/{symbol}/countries
 */
export async function fetchEtfCountries(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/etf/${encodeURIComponent(symbol)}/countries`,
  );
  const countries = data.countries as unknown[];
  return Array.isArray(countries) ? countries : [];
}

/**
 * Fetch ETF sectors from TMX Money API.
 * GET /api/etf/{symbol}/sectors
 */
export async function fetchEtfSectors(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/etf/${encodeURIComponent(symbol)}/sectors`,
  );
  const sectors = data.sectors as unknown[];
  return Array.isArray(sectors) ? sectors : [];
}

/**
 * Fetch calendar earnings from TMX Money API.
 * GET /api/calendar/earnings?date={date}
 */
export async function fetchEarnings(date: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/calendar/earnings?date=${encodeURIComponent(date)}`,
  );
  const earnings = data.earnings as unknown[];
  return Array.isArray(earnings) ? earnings : [];
}

/**
 * Fetch options chains from Montreal Exchange.
 * GET /en/trading/data/options-list?symbol={symbol}
 */
export async function fetchOptions(symbol: string): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown> | unknown[]>(
    `${MX_DATA}/options-list?symbol=${encodeURIComponent(symbol)}`,
  );
  if (Array.isArray(data)) return data;
  const options = data.options as unknown[];
  return Array.isArray(options) ? options : [];
}

/**
 * Fetch bond prices from TMX Money API.
 * GET /api/bonds/{symbol}
 */
export async function fetchBond(symbol: string): Promise<Record<string, unknown>> {
  return tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/bonds/${encodeURIComponent(symbol)}`,
  );
}

/**
 * Fetch treasury prices from TMX Money API.
 * GET /api/treasury/{symbol}
 */
export async function fetchTreasury(symbol: string): Promise<Record<string, unknown>> {
  return tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/treasury/${encodeURIComponent(symbol)}`,
  );
}

/**
 * Fetch market gainers from TMX Money API.
 * GET /api/market/gainers?exchange=tsx
 */
export async function fetchGainers(exchange = "tsx"): Promise<unknown[]> {
  const data = await tmxFetch<Record<string, unknown>>(
    `${TMX_MONEY_API}/market/gainers?exchange=${exchange}`,
  );
  const gainers = data.gainers as unknown[];
  return Array.isArray(gainers) ? gainers : [];
}
