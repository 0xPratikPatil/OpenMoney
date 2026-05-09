/**
 * API client for OpenMoney backend.
 * Provides typed fetch helpers for all authenticated API calls.
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

// ---------------------------------------------------------------------------
// Portfolios
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------
export const api = {
  // Portfolios
  portfolios: {
    list: () => request<Portfolio[]>('/api/v1/portfolios'),
    get: (id: string) => request<PortfolioDetail>(`/api/v1/portfolios/${id}`),
    create: (data: { name: string; description?: string; currency?: string; isDefault?: boolean }) =>
      request<Portfolio>('/api/v1/portfolios', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Portfolio>) =>
      request<Portfolio>(`/api/v1/portfolios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/v1/portfolios/${id}`, { method: 'DELETE' }),
    risk: (id: string) => request<RiskMetrics>(`/api/v1/portfolios/${id}/risk`),
    recommendations: (id: string) => request<ActionRecommendation[]>(`/api/v1/portfolios/${id}/recommendations`),
    history: (id: string) => request<{ date: string; value: number }[]>(`/api/v1/portfolios/${id}/history`),
  },

  // Positions
  positions: {
    create: (portfolioId: string, data: { ticker: string; quantity: number; avgEntryPrice: number; name?: string; notes?: string }) =>
      request<Position>(`/api/v1/portfolios/${portfolioId}/positions`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Position>) =>
      request<Position>(`/api/v1/positions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    close: (id: string) =>
      request<Position>(`/api/v1/positions/${id}`, { method: 'PUT', body: JSON.stringify({ isOpen: false }) }),
    delete: (id: string) =>
      request<void>(`/api/v1/positions/${id}`, { method: 'DELETE' }),
  },

  // Watchlists
  watchlists: {
    list: () => request<Watchlist[]>('/api/v1/watchlists'),
    get: (id: string) => request<Watchlist>(`/api/v1/watchlists/${id}`),
    create: (data: { name: string; isDefault?: boolean }) =>
      request<Watchlist>('/api/v1/watchlists', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/v1/watchlists/${id}`, { method: 'DELETE' }),
    addItem: (watchlistId: string, ticker: string) =>
      request<WatchlistItem>(`/api/v1/watchlists/${watchlistId}/items`, { method: 'POST', body: JSON.stringify({ ticker }) }),
    removeItem: (watchlistId: string, itemId: string) =>
      request<void>(`/api/v1/watchlists/${watchlistId}/items/${itemId}`, { method: 'DELETE' }),
  },

  // Journal
  journal: {
    list: () => request<JournalEntry[]>('/api/v1/journal'),
    get: (id: string) => request<JournalEntry>(`/api/v1/journal/${id}`),
    create: (data: Partial<JournalEntry>) =>
      request<JournalEntry>('/api/v1/journal', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<JournalEntry>) =>
      request<JournalEntry>(`/api/v1/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/v1/journal/${id}`, { method: 'DELETE' }),
    stats: () => request<JournalStats>('/api/v1/journal/stats'),
  },

  // Market data
  marketData: {
    quote: (symbol: string, provider?: string) =>
      request<unknown>(`/api/v1/market-data/quote?symbol=${symbol}${provider ? `&provider=${provider}` : ''}`),
    historical: (symbol: string, startDate?: string, endDate?: string, interval?: string) =>
      request<unknown>(`/api/v1/market-data/historical?symbol=${symbol}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${interval ? `&interval=${interval}` : ''}`),
  },

  // Signals
  signals: {
    list: () => request<Signal[]>('/api/v1/signals'),
  },

  // Search
  search: {
    ticker: (query: string) => request<{ symbol: string; name: string; exchange: string; type: string }[]>(
      `/api/v1/search?q=${encodeURIComponent(query)}`,
    ),
  },

  // Provider management
  providers: {
    list: () => request<{ name: string; description: string; status: string }[]>('/api/v1/providers'),
    setCredential: (provider: string, apiKey: string) =>
      request<void>(`/api/v1/providers/${provider}/credentials`, { method: 'PUT', body: JSON.stringify({ apiKey }) }),
  },
};
