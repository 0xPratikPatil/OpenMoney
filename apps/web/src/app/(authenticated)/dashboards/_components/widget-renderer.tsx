'use client';

import * as React from 'react';
import type { WidgetConfig, WidgetType } from '../_lib/dashboard-store';
import {
  Card,
  CardContent,
  MetricBlock,
  RiskGauge,
  Sparkline,
  Badge,
} from '@openmoney/ui';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Briefcase,
  Eye,
  Bell,
  Calendar,
  BookOpen,
  Newspaper,
  ArrowUpDown,
  DollarSign,
  ExternalLink,
  GripVertical,
  Settings,
  X,
  Grid3x3,
  ShieldAlert,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Mock data helpers                                                          */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 10_000 ? 1 : 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

const MOCK_INDICES = [
  { name: 'S&P 500', ticker: 'SPY', value: 5_234.18, change: 0.72 },
  { name: 'NASDAQ', ticker: 'QQQ', value: 18_345.62, change: 1.14 },
  { name: 'DOW JONES', ticker: 'DIA', value: 39_876.34, change: -0.23 },
  { name: 'RUSSELL', ticker: 'IWM', value: 2_145.80, change: 0.45 },
  { name: 'VIX', ticker: 'VIX', value: 14.32, change: -3.21 },
];

const MOCK_MOVERS = [
  { ticker: 'NVDA', price: 892.34, change: 4.21 },
  { ticker: 'AMD', price: 178.56, change: 3.78 },
  { ticker: 'TSLA', price: 245.67, change: -2.45 },
  { ticker: 'AAPL', price: 178.90, change: 1.23 },
  { ticker: 'MSFT', price: 425.34, change: 0.89 },
  { ticker: 'GOOGL', price: 167.89, change: -1.12 },
];

const MOCK_SIGNALS = [
  { id: '1', type: 'buy' as const, ticker: 'NVDA', message: 'Golden cross detected on daily chart', time: '2m ago' },
  { id: '2', type: 'sell' as const, ticker: 'TSLA', message: 'RSI overbought above 70', time: '15m ago' },
  { id: '3', type: 'info' as const, ticker: 'SPY', message: 'Volume spike above 2x average', time: '1h ago' },
  { id: '4', type: 'buy' as const, ticker: 'AAPL', message: 'Support level hold at $170', time: '2h ago' },
  { id: '5', type: 'warning' as const, ticker: 'BTC', message: 'Volatility alert: +/- 5% intraday range', time: '3h ago' },
];

const MOCK_EVENTS = [
  { date: 'May 5', event: 'FOMC Rate Decision', impact: 'high' as const, forecast: '5.50%', previous: '5.50%' },
  { date: 'May 7', event: 'Non-Farm Payrolls', impact: 'high' as const, forecast: '240K', previous: '275K' },
  { date: 'May 8', event: 'CPI YoY', impact: 'high' as const, forecast: '3.4%', previous: '3.5%' },
  { date: 'May 10', event: 'PPI MoM', impact: 'medium' as const, forecast: '0.3%', previous: '0.2%' },
  { date: 'May 14', event: 'Retail Sales MoM', impact: 'medium' as const, forecast: '0.4%', previous: '0.6%' },
];

const MOCK_NEWS = [
  { source: 'Reuters', headline: 'Fed Holds Rates Steady, Signals Two Cuts This Year', time: '1h ago' },
  { source: 'Bloomberg', headline: 'Tech Stocks Rally as AI Demand Outlook Improves', time: '2h ago' },
  { source: 'CNBC', headline: 'Oil Prices Slide on OPEC+ Supply Increase Reports', time: '3h ago' },
  { source: 'FT', headline: 'European Markets Hit New Highs on ECB Dovish Signals', time: '4h ago' },
];

const sparklineData = [45, 52, 48, 55, 62, 58, 64, 71, 67, 73, 78, 82];

/* -------------------------------------------------------------------------- */
/*  Individual widget renderers                                                */
/* -------------------------------------------------------------------------- */

function PortfolioSummaryWidget() {
  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-3">
        <MetricBlock label="Total Value" value={formatCurrency(1_245_678)} trend="up" size="sm" />
        <MetricBlock label="Day P&L" value={formatCurrency(12_345)} trend="up" size="sm" />
        <MetricBlock label="Total Return" value={formatPercent(18.4)} trend="up" size="sm" />
        <MetricBlock label="Positions" value="24" size="sm" />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2">
        <span className="text-xs text-[var(--text-secondary)]">Cash</span>
        <span className="text-xs font-mono font-medium text-[var(--text-primary)]">{formatCurrency(89_450)}</span>
        <span className="text-xs font-mono text-[var(--text-secondary)]">7.2%</span>
      </div>
    </div>
  );
}

function RiskMetricsWidget() {
  return (
    <div className="space-y-3 p-1">
      <div className="flex justify-center">
        <RiskGauge value={34} label="Portfolio VaR (95%)" size="sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Sharpe</p>
          <p className="text-sm font-mono font-bold text-[var(--text-primary)]">1.42</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Sortino</p>
          <p className="text-sm font-mono font-bold text-[var(--text-primary)]">1.89</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Max DD</p>
          <p className="text-sm font-mono font-bold text-[var(--negative)]">-12.4%</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Beta</p>
          <p className="text-sm font-mono font-bold text-[var(--text-primary)]">1.08</p>
        </div>
      </div>
    </div>
  );
}

function WatchlistMiniWidget() {
  return (
    <div className="space-y-1 p-1">
      {MOCK_MOVERS.slice(0, 5).map((item) => (
        <div
          key={item.ticker}
          className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-[var(--bg-primary)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-primary)]">{item.ticker}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">
              ${item.price.toFixed(2)}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-mono tabular-nums ${
                item.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
              }`}
            >
              {item.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {formatPercent(item.change)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PriceChartWidget() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-mono font-bold text-[var(--text-primary)]">$5,234.18</span>
        <Badge variant="outline" className="text-[var(--positive)] border-[var(--positive)]">
          <TrendingUp size={12} className="mr-1" />+0.72%
        </Badge>
      </div>
      <Sparkline data={sparklineData} width={280} height={60} showFill color="var(--positive)" />
      <div className="flex items-center gap-2">
        {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
          <button
            key={tf}
            className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)] transition-colors data-[active=true]:bg-[var(--accent-brand)] data-[active=true]:text-white"
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}

function MarketOverviewWidget() {
  return (
    <div className="space-y-2 p-1">
      {MOCK_INDICES.map((idx) => (
        <div
          key={idx.ticker}
          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2"
        >
          <div>
            <p className="text-xs font-medium text-[var(--text-primary)]">{idx.name}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">{idx.ticker}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-semibold text-[var(--text-primary)]">
              {idx.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p
              className={`flex items-center gap-0.5 text-[10px] font-mono ${
                idx.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
              }`}
            >
              {idx.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {formatPercent(idx.change)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SignalFeedWidget() {
  return (
    <div className="space-y-2 p-1">
      {MOCK_SIGNALS.map((sig) => (
        <div
          key={sig.id}
          className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3"
        >
          <div
            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              sig.type === 'buy'
                ? 'bg-[var(--positive)]/10 text-[var(--positive)]'
                : sig.type === 'sell'
                  ? 'bg-[var(--negative)]/10 text-[var(--negative)]'
                  : sig.type === 'warning'
                    ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                    : 'bg-[var(--info)]/10 text-[var(--info)]'
            }`}
          >
            {sig.type === 'buy' ? 'B' : sig.type === 'sell' ? 'S' : sig.type === 'warning' ? '!' : 'i'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
              {sig.ticker}
              <span className="text-[10px] text-[var(--text-secondary)] font-normal">{sig.time}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {sig.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EconomicCalendarWidget() {
  return (
    <div className="space-y-1 p-1">
      {MOCK_EVENTS.map((evt, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-[var(--bg-primary)] transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
              {evt.event}
              <span
                className={`rounded px-1 py-0.5 text-[9px] font-medium uppercase ${
                  evt.impact === 'high'
                    ? 'bg-[var(--negative)]/10 text-[var(--negative)]'
                    : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                }`}
              >
                {evt.impact}
              </span>
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{evt.date}</p>
          </div>
          <div className="text-right text-[10px]">
            <p className="text-[var(--text-secondary)]">F: {evt.forecast}</p>
            <p className="text-[var(--text-secondary)]">P: {evt.previous}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopMoversWidget() {
  const gainers = MOCK_MOVERS.filter((m) => m.change > 0);
  const losers = MOCK_MOVERS.filter((m) => m.change < 0);
  return (
    <div className="space-y-3 p-1">
      <div>
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--positive)]">
          <TrendingUp size={10} /> Gainers
        </p>
        {gainers.slice(0, 3).map((m) => (
          <div key={m.ticker} className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-[var(--text-primary)]">{m.ticker}</span>
            <span className="text-xs font-mono tabular-nums text-[var(--positive)]">+{formatPercent(m.change)}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--negative)]">
          <TrendingDown size={10} /> Losers
        </p>
        {losers.slice(0, 3).map((m) => (
          <div key={m.ticker} className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-[var(--text-primary)]">{m.ticker}</span>
            <span className="text-xs font-mono tabular-nums text-[var(--negative)]">{formatPercent(m.change)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllocationPieWidget() {
  const segments = [
    { label: 'Tech', value: 35, color: '#6366f1' },
    { label: 'Healthcare', value: 20, color: '#22c55e' },
    { label: 'Finance', value: 15, color: '#f59e0b' },
    { label: 'Energy', value: 10, color: '#ef4444' },
    { label: 'Consumer', value: 12, color: '#3b82f6' },
    { label: 'Cash', value: 8, color: '#94a3b8' },
  ];
  return (
    <div className="flex flex-col items-center gap-3 p-1">
      {/* CSS-based pie chart */}
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="size-full">
          {segments.reduce(
            (acc, seg) => {
              const sweep = (seg.value / 100) * 360;
              const x = 50 + 40 * Math.cos((((acc.cumulative - 90) * Math.PI) / 180));
              const y = 50 + 40 * Math.sin((((acc.cumulative - 90) * Math.PI) / 180));
              const x2 = 50 + 40 * Math.cos((((acc.cumulative + sweep - 90) * Math.PI) / 180));
              const y2 = 50 + 40 * Math.sin((((acc.cumulative + sweep - 90) * Math.PI) / 180));
              const largeArc = sweep > 180 ? 1 : 0;
              const path = `M50,50 L${x},${y} A40,40 0 ${largeArc},1 ${x2},${y2} Z`;
              acc.cumulative += sweep;
              acc.elements.push(<path key={seg.label} d={path} fill={seg.color} stroke="var(--bg-primary)" strokeWidth={1} />);
              return acc;
            },
            { cumulative: 0, elements: [] as React.ReactNode[] },
          ).elements}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-[var(--text-secondary)]">{seg.label}</span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CorrelationMatrixWidget() {
  const tickers = ['SPY', 'QQQ', 'IWM', 'TLT', 'GLD'];
  const matrix = [
    [1.0, 0.82, 0.74, -0.32, -0.12],
    [0.82, 1.0, 0.68, -0.28, -0.08],
    [0.74, 0.68, 1.0, -0.18, 0.05],
    [-0.32, -0.28, -0.18, 1.0, 0.45],
    [-0.12, -0.08, 0.05, 0.45, 1.0],
  ];

  function cellColor(val: number): string {
    if (val === 1) return 'var(--muted)';
    if (val > 0) {
      const t = val;
      const r = Math.round(240 + (22 - 240) * t);
      const g = Math.round(240 + (163 - 240) * t);
      const b = Math.round(240 + (74 - 240) * t);
      return `rgb(${r},${g},${b})`;
    }
    const t = Math.abs(val);
    const r = Math.round(220 + (240 - 220) * (1 - t));
    const g = Math.round(38 + (240 - 38) * (1 - t));
    const b = Math.round(38 + (240 - 38) * (1 - t));
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="overflow-auto p-1">
      <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `auto ${tickers.map(() => '48px').join(' ')}` }}>
        {/* Header */}
        <div />
        {tickers.map((t) => (
          <div key={t} className="text-[9px] font-mono text-[var(--text-secondary)] text-center">
            {t}
          </div>
        ))}
        {/* Rows */}
        {matrix.map((row, i) => (
          <React.Fragment key={tickers[i]}>
            <div className="text-[9px] font-mono text-[var(--text-secondary)] pr-2 self-center">{tickers[i]}</div>
            {row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className="flex size-12 items-center justify-center rounded text-[9px] font-mono font-bold"
                style={{
                  backgroundColor: cellColor(val),
                  color: Math.abs(val) > 0.6 ? '#fff' : 'var(--text-primary)',
                }}
              >
                {val.toFixed(2)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function JournalStatsWidget() {
  return (
    <div className="space-y-3 p-1">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Win Rate</p>
          <p className="text-lg font-mono font-bold text-[var(--positive)]">68%</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Trades</p>
          <p className="text-lg font-mono font-bold text-[var(--text-primary)]">142</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Avg R</p>
          <p className="text-sm font-mono font-bold text-[var(--text-primary)]">1.8</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Profit Factor</p>
          <p className="text-sm font-mono font-bold text-[var(--text-primary)]">2.34</p>
        </div>
      </div>
    </div>
  );
}

function NewsFeedWidget() {
  return (
    <div className="space-y-2 p-1">
      {MOCK_NEWS.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3"
        >
          <ExternalLink size={12} className="mt-0.5 shrink-0 text-[var(--text-secondary)]" />
          <div>
            <p className="flex items-center gap-2 text-[11px] text-[var(--text-primary)] leading-relaxed">
              {item.headline}
            </p>
            <p className="mt-0.5 text-[9px] text-[var(--text-secondary)]">
              {item.source} · {item.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Widget renderer map                                                        */
/* -------------------------------------------------------------------------- */

const WIDGET_RENDERERS: Record<WidgetType, React.ComponentType> = {
  'portfolio-summary': PortfolioSummaryWidget,
  'risk-metrics': RiskMetricsWidget,
  'watchlist-mini': WatchlistMiniWidget,
  'price-chart': PriceChartWidget,
  'market-overview': MarketOverviewWidget,
  'signal-feed': SignalFeedWidget,
  'economic-calendar': EconomicCalendarWidget,
  'top-movers': TopMoversWidget,
  'allocation-pie': AllocationPieWidget,
  'correlation-matrix': CorrelationMatrixWidget,
  'journal-stats': JournalStatsWidget,
  'news-feed': NewsFeedWidget,
};

const WIDGET_ICONS: Record<WidgetType, React.ReactNode> = {
  'portfolio-summary': <Briefcase size={14} />,
  'risk-metrics': <ShieldAlert size={14} />,
  'watchlist-mini': <Eye size={14} />,
  'price-chart': <TrendingUp size={14} />,
  'market-overview': <Globe size={14} />,
  'signal-feed': <Bell size={14} />,
  'economic-calendar': <Calendar size={14} />,
  'top-movers': <ArrowUpDown size={14} />,
  'allocation-pie': <DollarSign size={14} />,
  'correlation-matrix': <Grid3x3 size={14} />,
  'journal-stats': <BookOpen size={14} />,
  'news-feed': <Newspaper size={14} />,
};

/* -------------------------------------------------------------------------- */
/*  WidgetRenderer component                                                   */
/* -------------------------------------------------------------------------- */

interface WidgetRendererProps {
  widget: WidgetConfig;
  isEditing?: boolean;
  onRemove?: (id: string) => void;
  onSettings?: (id: string) => void;
}

export function WidgetRenderer({ widget, isEditing, onRemove, onSettings }: WidgetRendererProps) {
  const WidgetComponent = WIDGET_RENDERERS[widget.type];

  if (!WidgetComponent) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-[var(--text-secondary)]">
        Unknown widget type: {widget.type}
      </div>
    );
  }

  return (
    <Card className="h-full w-full overflow-hidden border-[var(--border)] bg-[var(--bg-secondary)]">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <div className="flex items-center gap-2">
          {isEditing && (
            <span className="cursor-grab text-[var(--text-secondary)]" title="Drag to reorder">
              <GripVertical size={14} />
            </span>
          )}
          <span className="text-[var(--text-secondary)]">{WIDGET_ICONS[widget.type]}</span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{widget.title}</span>
        </div>
        {isEditing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSettings?.(widget.id)}
              className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)] transition-colors"
              title="Widget settings"
            >
              <Settings size={12} />
            </button>
            <button
              type="button"
              onClick={() => onRemove?.(widget.id)}
              className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--negative)] hover:bg-[var(--negative)]/10 transition-colors"
              title="Remove widget"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 h-[calc(100%-36px)] overflow-auto">
        <WidgetComponent />
      </CardContent>
    </Card>
  );
}

// Re-export for convenience
export { WIDGET_ICONS };


