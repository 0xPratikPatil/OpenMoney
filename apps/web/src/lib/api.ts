/**
 * API client for OpenMoney backend.
 * Type-safe fetch helpers for all API calls.
 * No version prefixes in URL paths.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { positions: number };
}

export interface PortfolioSummary {
  totalValue: number;
  totalCostBasis: number;
  totalReturn: number;
  totalReturnPercent: number;
  positionCount: number;
}

export interface Position {
  id: string;
  ticker: string;
  name: string | null;
  assetClass: string;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number | null;
  costBasis: number;
  marketValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPercent: number | null;
  allocationPercent: number | null;
  isOpen: boolean;
  openedAt: string;
  closedAt: string | null;
  portfolioId: string;
}

export interface PortfolioDetail extends Portfolio {
  positions: Position[];
  summary: PortfolioSummary;
}

export interface RiskMetrics {
  portfolioVaR95: number;
  portfolioVaR99: number;
  portfolioCVaR95: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownDate: string | null;
  beta: number | null;
  correlationMatrix: { ticker: string; correlations: Record<string, number> }[];
  positionRiskContributions: { ticker: string; marginalVaR: number; componentVaR: number }[];
  asOfDate: string;
}

export interface ActionRecommendation {
  id: string;
  ticker: string | null;
  portfolioId: string;
  action: 'hold' | 'add' | 'reduce' | 'exit' | 'rebalance' | 'hedge';
  confidence: number;
  title: string;
  reasoning: string[];
  triggeredBy: string[];
  expiresAt: string | null;
  createdAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WatchlistItem[];
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  note: string | null;
  addedAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  ticker: string | null;
  direction: 'bullish' | 'bearish' | 'neutral';
  thesis: string;
  catalysts: string | null;
  timeframe: 'short_term' | 'medium_term' | 'long_term';
  confidence: number;
  expectedOutcome: string | null;
  actualOutcome: string | null;
  outcomeDate: string | null;
  outcomeNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStats {
  total: number;
  resolved: number;
  correct: number;
  incorrect: number;
  accuracy: number | null;
  calibrationCurve: { bracket: string; accuracy: number; count: number }[];
  brierScore: number | null;
}

export interface Signal {
  id: string;
  ticker: string | null;
  portfolioId: string | null;
  type: string;
  action: string | null;
  confidence: number | null;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ProviderInfo {
  name: string;
  description: string;
  website: string;
  credentials: string[];
  models: string[];
  free: boolean;
  status: string;
}

export interface ProviderHealthSnapshot {
  providers: Array<{
    name: string;
    status: string;
    free: boolean;
    modelCount: number;
    models: string[];
    lastChecked?: string;
    lastError?: string;
    cooldownRemaining?: number;
  }>;
  summary: {
    total: number;
    active: number;
    error: number;
    disabled: number;
    unknown: number;
    freeActive: number;
    paidActive: number;
    modelsWithFreeCoverage: number;
    modelsWithOnlyPaid: number;
  };
}

export interface TickerQuote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  provider: string;
  timestamp: string;
}

export interface TickerSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ═══════════════════════════════════════════════════════════
// API Methods
// ═══════════════════════════════════════════════════════════

export const api = {
  // ── Portfolios ──────────────────────────────────────────
  portfolios: {
    list: () => request<Portfolio[]>('/api/portfolios'),
    get: (id: string) => request<PortfolioDetail>(`/api/portfolios/${id}`),
    create: (data: { name: string; description?: string; currency?: string; isDefault?: boolean }) =>
      request<Portfolio>('/api/portfolios', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Portfolio>) =>
      request<Portfolio>(`/api/portfolios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/portfolios/${id}`, { method: 'DELETE' }),
    risk: (id: string) => request<RiskMetrics>(`/api/portfolios/${id}/risk`),
    recommendations: (id: string) => request<ActionRecommendation[]>(`/api/portfolios/${id}/recommendations`),
    history: (id: string) => request<{ date: string; value: number }[]>(`/api/portfolios/${id}/history`),
  },

  // ── Positions ───────────────────────────────────────────
  positions: {
    create: (portfolioId: string, data: { ticker: string; quantity: number; avgEntryPrice: number; name?: string; notes?: string }) =>
      request<Position>(`/api/portfolios/${portfolioId}/positions`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Position>) =>
      request<Position>(`/api/positions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    close: (id: string) =>
      request<Position>(`/api/positions/${id}`, { method: 'PUT', body: JSON.stringify({ isOpen: false }) }),
    delete: (id: string) =>
      request<void>(`/api/positions/${id}`, { method: 'DELETE' }),
  },

  // ── Watchlists ──────────────────────────────────────────
  watchlists: {
    list: () => request<Watchlist[]>('/api/watchlists'),
    get: (id: string) => request<Watchlist>(`/api/watchlists/${id}`),
    create: (data: { name: string; isDefault?: boolean }) =>
      request<Watchlist>('/api/watchlists', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/watchlists/${id}`, { method: 'DELETE' }),
    addItem: (watchlistId: string, ticker: string) =>
      request<WatchlistItem>(`/api/watchlists/${watchlistId}/items`, { method: 'POST', body: JSON.stringify({ ticker }) }),
    removeItem: (watchlistId: string, itemId: string) =>
      request<void>(`/api/watchlists/${watchlistId}/items/${itemId}`, { method: 'DELETE' }),
  },

  // ── Journal ─────────────────────────────────────────────
  journal: {
    list: () => request<JournalEntry[]>('/api/journal'),
    get: (id: string) => request<JournalEntry>(`/api/journal/${id}`),
    create: (data: Partial<JournalEntry>) =>
      request<JournalEntry>('/api/journal', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<JournalEntry>) =>
      request<JournalEntry>(`/api/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/journal/${id}`, { method: 'DELETE' }),
    stats: () => request<JournalStats>('/api/journal/stats'),
  },

  // ── Market Data (public, provider-backed) ───────────────
  market: {
    quote: (symbol: string, provider = 'yfinance') =>
      request<TickerQuote>(`/api/equity/quote?symbol=${encodeURIComponent(symbol.toUpperCase())}&provider=${provider}`),

    historical: (symbol: string, opts?: { startDate?: string; endDate?: string; interval?: string; provider?: string }) =>
      request<HistoricalDataPoint[]>(
        `/api/equity/historical?symbol=${encodeURIComponent(symbol.toUpperCase())}` +
        (opts?.startDate ? `&startDate=${opts.startDate}` : '') +
        (opts?.endDate ? `&endDate=${opts.endDate}` : '') +
        (opts?.interval ? `&interval=${opts.interval}` : '') +
        `&provider=${opts?.provider ?? 'yfinance'}`
      ),

    profile: (symbol: string, provider = 'yfinance') =>
      request<Record<string, unknown>>(`/api/equity/profile?symbol=${encodeURIComponent(symbol.toUpperCase())}&provider=${provider}`),

    keyMetrics: (symbol: string, provider = 'yfinance') =>
      request<Record<string, unknown>>(`/api/equity/key-metrics?symbol=${encodeURIComponent(symbol.toUpperCase())}&provider=${provider}`),

    search: (query: string, limit = 20, provider = 'yfinance') =>
      request<TickerSearchResult[]>(`/api/search?query=${encodeURIComponent(query)}&limit=${limit}&provider=${provider}`),

    providers: {
      list: () => request<ProviderInfo[]>('/api/providers'),
      get: (name: string) => request<ProviderInfo>(`/api/providers/${name}`),
      health: () => request<ProviderHealthSnapshot>('/api/providers/health'),
      query: (provider: string, model: string, params: Record<string, unknown>) =>
        request<unknown>('/api/query', {
          method: 'POST',
          body: JSON.stringify({ provider, model, params }),
        }),
    },
  },

  // ── Signals ─────────────────────────────────────────────
  signals: {
    list: () => request<Signal[]>('/api/signals'),
  },

  // ── Search ───────────────────────────────────────────────
  search: {
    ticker: (query: string, limit = 20, provider = 'yfinance') =>
      request<TickerSearchResult[]>(`/api/search?query=${encodeURIComponent(query)}&limit=${limit}&provider=${provider}`),
  },

  // ── User ────────────────────────────────────────────────
  user: {
    get: () => request<Record<string, unknown>>('/api/user'),
  },
};

(End of file - total 262 lines)
