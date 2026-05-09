'use client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WidgetType =
  | 'portfolio-summary'
  | 'risk-metrics'
  | 'watchlist-mini'
  | 'price-chart'
  | 'market-overview'
  | 'signal-feed'
  | 'economic-calendar'
  | 'top-movers'
  | 'allocation-pie'
  | 'correlation-matrix'
  | 'journal-stats'
  | 'news-feed';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  gridPos: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  layout: WidgetConfig[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Widget metadata registry
// ---------------------------------------------------------------------------

export interface WidgetMeta {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultTitle: string;
  defaultSize: { w: number; h: number };
}

export const WIDGET_REGISTRY: WidgetMeta[] = [
  {
    type: 'portfolio-summary',
    name: 'Portfolio Summary',
    description: 'Total value, day P&L, and allocation overview',
    icon: 'Briefcase',
    defaultTitle: 'Portfolio Summary',
    defaultSize: { w: 4, h: 3 },
  },
  {
    type: 'risk-metrics',
    name: 'Risk Metrics',
    description: 'VaR gauge, Sharpe ratio, Sortino, and drawdown',
    icon: 'ShieldAlert',
    defaultTitle: 'Risk Metrics',
    defaultSize: { w: 4, h: 4 },
  },
  {
    type: 'watchlist-mini',
    name: 'Watchlist',
    description: 'Compact watchlist with prices and changes',
    icon: 'Eye',
    defaultTitle: 'Watchlist',
    defaultSize: { w: 3, h: 4 },
  },
  {
    type: 'price-chart',
    name: 'Price Chart',
    description: 'Mini OHLCV chart with timeframe toggles',
    icon: 'TrendingUp',
    defaultTitle: 'Price Chart',
    defaultSize: { w: 6, h: 4 },
  },
  {
    type: 'market-overview',
    name: 'Market Overview',
    description: 'Indices, sectors, and major pairs',
    icon: 'Globe',
    defaultTitle: 'Market Overview',
    defaultSize: { w: 6, h: 3 },
  },
  {
    type: 'signal-feed',
    name: 'Signal Feed',
    description: 'Recent trading signals and alerts',
    icon: 'Bell',
    defaultTitle: 'Signal Feed',
    defaultSize: { w: 4, h: 4 },
  },
  {
    type: 'economic-calendar',
    name: 'Economic Calendar',
    description: 'Upcoming economic events and data releases',
    icon: 'Calendar',
    defaultTitle: 'Economic Calendar',
    defaultSize: { w: 4, h: 4 },
  },
  {
    type: 'top-movers',
    name: 'Top Movers',
    description: 'Biggest gainers and losers',
    icon: 'ArrowUpDown',
    defaultTitle: 'Top Movers',
    defaultSize: { w: 3, h: 4 },
  },
  {
    type: 'allocation-pie',
    name: 'Allocation Pie',
    description: 'Portfolio allocation donut chart',
    icon: 'PieChart',
    defaultTitle: 'Allocation',
    defaultSize: { w: 3, h: 4 },
  },
  {
    type: 'correlation-matrix',
    name: 'Correlation Matrix',
    description: 'Pairwise correlation heatmap',
    icon: 'Grid3x3',
    defaultTitle: 'Correlations',
    defaultSize: { w: 5, h: 5 },
  },
  {
    type: 'journal-stats',
    name: 'Journal Stats',
    description: 'Trading journal win rate and stats',
    icon: 'BookOpen',
    defaultTitle: 'Journal Stats',
    defaultSize: { w: 3, h: 3 },
  },
  {
    type: 'news-feed',
    name: 'News Feed',
    description: 'Latest market news headlines',
    icon: 'Newspaper',
    defaultTitle: 'News Feed',
    defaultSize: { w: 4, h: 4 },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'openmoney-dashboards';

function generateId(): string {
  return `dash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Storage API
// ---------------------------------------------------------------------------

export function loadDashboards(): DashboardConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DashboardConfig[];
  } catch {
    return [];
  }
}

export function saveDashboard(dash: DashboardConfig): void {
  const all = loadDashboards();
  const idx = all.findIndex((d) => d.id === dash.id);
  const updated = { ...dash, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.push(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteDashboard(id: string): void {
  const all = loadDashboards().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getDefaultDashboard(): DashboardConfig | null {
  const all = loadDashboards();
  return all.find((d) => d.isDefault) ?? all[0] ?? null;
}

export function setDefaultDashboard(id: string): void {
  const all = loadDashboards().map((d) => ({
    ...d,
    isDefault: d.id === id,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function duplicateDashboard(id: string): DashboardConfig | null {
  const all = loadDashboards();
  const source = all.find((d) => d.id === id);
  if (!source) return null;
  const copy: DashboardConfig = {
    ...source,
    id: generateId(),
    name: `${source.name} (Copy)`,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layout: source.layout.map((w) => ({
      ...w,
      id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })),
  };
  all.push(copy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return copy;
}

export function createDashboard(
  name: string,
  description?: string,
  layout?: WidgetConfig[],
  isDefault?: boolean,
): DashboardConfig {
  const now = new Date().toISOString();
  const dash: DashboardConfig = {
    id: generateId(),
    name,
    description,
    isDefault,
    layout: layout ?? [],
    createdAt: now,
    updatedAt: now,
  };
  saveDashboard(dash);
  return dash;
}

// ---------------------------------------------------------------------------
// Pre-built templates
// ---------------------------------------------------------------------------

export const TEMPLATES: { id: string; name: string; description: string; layout: WidgetConfig[] }[] = [
  {
    id: 'template-command-center',
    name: 'Portfolio Command Center',
    description: 'Portfolio overview, risk metrics, and signal monitoring',
    layout: [
      { id: generateId(), type: 'portfolio-summary', title: 'Portfolio Summary', gridPos: { x: 0, y: 0, w: 4, h: 3 }, config: {} },
      { id: generateId(), type: 'risk-metrics', title: 'Risk Metrics', gridPos: { x: 4, y: 0, w: 4, h: 4 }, config: {} },
      { id: generateId(), type: 'signal-feed', title: 'Signal Feed', gridPos: { x: 8, y: 0, w: 4, h: 4 }, config: {} },
      { id: generateId(), type: 'price-chart', title: 'SPY Price Chart', gridPos: { x: 0, y: 3, w: 4, h: 4 }, config: { ticker: 'SPY' } },
      { id: generateId(), type: 'allocation-pie', title: 'Allocation', gridPos: { x: 4, y: 4, w: 3, h: 4 }, config: {} },
      { id: generateId(), type: 'top-movers', title: 'Top Movers', gridPos: { x: 7, y: 4, w: 3, h: 4 }, config: {} },
    ],
  },
  {
    id: 'template-market-monitor',
    name: 'Global Market Monitor',
    description: 'Indices, sectors, FX rates, and commodity prices',
    layout: [
      { id: generateId(), type: 'market-overview', title: 'Market Overview', gridPos: { x: 0, y: 0, w: 6, h: 3 }, config: {} },
      { id: generateId(), type: 'price-chart', title: 'S&P 500', gridPos: { x: 6, y: 0, w: 6, h: 4 }, config: { ticker: 'SPY' } },
      { id: generateId(), type: 'top-movers', title: 'Top Movers', gridPos: { x: 0, y: 3, w: 3, h: 4 }, config: {} },
      { id: generateId(), type: 'economic-calendar', title: 'Economic Calendar', gridPos: { x: 3, y: 3, w: 5, h: 4 }, config: {} },
      { id: generateId(), type: 'news-feed', title: 'Market News', gridPos: { x: 8, y: 4, w: 4, h: 4 }, config: {} },
    ],
  },
  {
    id: 'template-risk-deep-dive',
    name: 'Risk Deep Dive',
    description: 'VaR, correlation matrix, drawdown analysis, and stress tests',
    layout: [
      { id: generateId(), type: 'risk-metrics', title: 'Risk Metrics', gridPos: { x: 0, y: 0, w: 4, h: 4 }, config: {} },
      { id: generateId(), type: 'correlation-matrix', title: 'Correlation Matrix', gridPos: { x: 4, y: 0, w: 5, h: 5 }, config: {} },
      { id: generateId(), type: 'portfolio-summary', title: 'Portfolio Summary', gridPos: { x: 9, y: 0, w: 3, h: 3 }, config: {} },
      { id: generateId(), type: 'allocation-pie', title: 'Allocation', gridPos: { x: 9, y: 3, w: 3, h: 3 }, config: {} },
    ],
  },
];
