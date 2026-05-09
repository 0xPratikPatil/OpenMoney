'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Sparkline,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Callout,
} from '@openmoney/ui';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  BarChart3,
  Activity,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  LineChart,
  PieChart,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Mock Market Data                                                           */
/* -------------------------------------------------------------------------- */
const MOCK_INDICES = [
  { name: 'S&P 500', ticker: 'SPY', value: 5_234.18, change: 0.72, sparkline: [5120, 5140, 5160, 5180, 5200, 5190, 5210, 5234] },
  { name: 'NASDAQ', ticker: 'QQQ', value: 18_345.62, change: 1.14, sparkline: [18000, 18120, 18180, 18240, 18300, 18280, 18320, 18346] },
  { name: 'DOW JONES', ticker: 'DIA', value: 39_876.34, change: -0.23, sparkline: [39900, 39880, 39850, 39820, 39800, 39850, 39870, 39876] },
  { name: 'RUSSELL 2000', ticker: 'IWM', value: 2_145.87, change: 0.89, sparkline: [2100, 2115, 2120, 2130, 2140, 2135, 2142, 2146] },
];

const SECTORS = [
  { name: 'Technology', change: 1.42 },
  { name: 'Healthcare', change: 0.35 },
  { name: 'Financials', change: -0.18 },
  { name: 'Consumer Cyclical', change: 0.67 },
  { name: 'Communication', change: -0.42 },
  { name: 'Industrials', change: 0.51 },
  { name: 'Consumer Defensive', change: 0.12 },
  { name: 'Energy', change: -1.23 },
  { name: 'Utilities', change: 0.08 },
  { name: 'Real Estate', change: -0.31 },
  { name: 'Materials', change: 0.44 },
];

const FX_PAIRS = [
  { pair: 'EUR/USD', bid: 1.0815, ask: 1.0818, change: 0.15 },
  { pair: 'GBP/USD', bid: 1.2650, ask: 1.2653, change: -0.22 },
  { pair: 'USD/JPY', bid: 151.42, ask: 151.46, change: 0.31 },
  { pair: 'USD/CAD', bid: 1.3625, ask: 1.3629, change: -0.08 },
  { pair: 'AUD/USD', bid: 0.6520, ask: 0.6523, change: 0.24 },
  { pair: 'USD/CHF', bid: 0.8875, ask: 0.8879, change: -0.11 },
];

const COMMODITIES = [
  { name: 'Gold', symbol: 'XAU', price: 2_345.60, change: 0.42, unit: 'oz' },
  { name: 'Silver', symbol: 'XAG', price: 28.15, change: -0.78, unit: 'oz' },
  { name: 'Crude Oil', symbol: 'CL', price: 82.34, change: 1.25, unit: 'bbl' },
  { name: 'Natural Gas', symbol: 'NG', price: 2.18, change: -2.34, unit: 'MMBtu' },
];

const TREASURY_RATES = [
  { term: '2Y', yield: 4.72, previous: 4.68, change: 0.04 },
  { term: '5Y', yield: 4.38, previous: 4.35, change: 0.03 },
  { term: '10Y', yield: 4.25, previous: 4.28, change: -0.03 },
  { term: '30Y', yield: 4.45, previous: 4.47, change: -0.02 },
];

const ECONOMIC_CALENDAR = [
  { date: 'May 5', event: 'ISM Services PMI', previous: 51.4, forecast: 51.8, importance: 'high' as const },
  { date: 'May 7', event: 'Fed Interest Rate Decision', previous: '5.50%', forecast: '5.50%', importance: 'high' as const },
  { date: 'May 8', event: 'Initial Jobless Claims', previous: '208K', forecast: '212K', importance: 'medium' as const },
  { date: 'May 9', event: 'Consumer Sentiment', previous: 77.2, forecast: 76.8, importance: 'medium' as const },
  { date: 'May 10', event: 'CPI MoM', previous: 0.4, forecast: 0.3, importance: 'high' as const },
  { date: 'May 14', event: 'PPI MoM', previous: 0.2, forecast: 0.2, importance: 'medium' as const },
  { date: 'May 15', event: 'Retail Sales MoM', previous: 0.7, forecast: 0.4, importance: 'medium' as const },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 10_000 ? 'compact' : 'standard',
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 10_000 ? 1 : 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function importanceColor(imp: 'high' | 'medium' | 'low'): string {
  switch (imp) {
    case 'high':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'low':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  }
}

function sparklineFromChange(base: number, change: number): number[] {
  const vals: number[] = [];
  let v = base * 0.97;
  const target = base * (1 + change / 100);
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    v += (target - v) / (steps - i) + (Math.random() - 0.5) * base * 0.005;
    vals.push(Math.round(v * 100) / 100);
  }
  return vals;
}

/* -------------------------------------------------------------------------- */
/*  Markets Page                                                               */
/* -------------------------------------------------------------------------- */
export default function MarketsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('overview');

  /* Simulate loading */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 600);
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>

        {/* Indices row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Sectors row */}
        <Skeleton className="h-36 w-full rounded-xl" />

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle size={24} className="text-[var(--negative)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Failed to load market data</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* Yield curve data for visualization */
  const yieldCurveMax = Math.max(...TREASURY_RATES.map((t) => t.yield)) * 1.1;
  const yieldCurveMin = Math.min(...TREASURY_RATES.map((t) => t.yield)) * 0.9;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Global Markets</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Multi-asset market overview &mdash; information-dense, Bloomberg-style
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ========================================================
          Major Indices Row
          ======================================================== */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
          <BarChart3 size={12} />
          Major Indices
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MOCK_INDICES.map((idx) => (
            <div
              key={idx.ticker}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--accent-brand)]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {idx.name}
                </p>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">{idx.ticker}</span>
              </div>
              <p className="mt-1.5 text-lg font-bold font-mono text-[var(--text-primary)] tabular-nums">
                {idx.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <div className={`flex items-center gap-1 text-sm font-medium ${idx.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                  {idx.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {formatPercent(idx.change)}
                </div>
                <Sparkline
                  data={idx.sparkline}
                  width={56}
                  height={16}
                  showFill
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          Tabs: Overview / Sectors / Economic Calendar
          ======================================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <Globe size={14} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center gap-1.5">
            <PieChart size={14} />
            Sector Performance
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1.5">
            <Activity size={14} />
            Economic Calendar
          </TabsTrigger>
        </TabsList>

        {/* ---- Overview Tab ---- */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Sector Performance Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Sector Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {SECTORS.map((sector) => (
                  <div
                    key={sector.name}
                    className={`rounded-lg border px-3 py-2 text-center transition-colors ${
                      sector.change >= 0
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    <p className="text-[10px] font-medium text-[var(--text-secondary)] truncate">
                      {sector.name}
                    </p>
                    <p className={`text-sm font-bold font-mono mt-0.5 ${sector.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                      {formatPercent(sector.change)}
                    </p>
                    {/* Mini bar visualization */}
                    <div className="mt-1 h-1 w-full rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sector.change >= 0 ? 'bg-[var(--positive)]' : 'bg-[var(--negative)]'}`}
                        style={{ width: `${Math.min(Math.abs(sector.change) * 40, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Forex + Commodities + Treasuries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forex Watch */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <DollarSign size={12} />
                  Forex
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Pair</TableHead>
                      <TableHead className="text-[10px] text-right">Bid</TableHead>
                      <TableHead className="text-[10px] text-right">Ask</TableHead>
                      <TableHead className="text-[10px] text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FX_PAIRS.map((fx) => (
                      <TableRow key={fx.pair}>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                            {fx.pair}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-[var(--text-primary)]">
                          {fx.bid.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-[var(--text-primary)]">
                          {fx.ask.toFixed(4)}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs font-medium ${fx.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                          {formatPercent(fx.change)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Commodities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <BarChart3 size={12} />
                  Commodities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Name</TableHead>
                      <TableHead className="text-[10px] text-right">Price</TableHead>
                      <TableHead className="text-[10px] text-right">Change</TableHead>
                      <TableHead className="text-[10px] text-right w-[60px]">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {COMMODITIES.map((c) => {
                      const spark = sparklineFromChange(c.price, c.change);
                      return (
                        <TableRow key={c.symbol}>
                          <TableCell>
                            <div>
                              <span className="text-xs font-semibold text-[var(--text-primary)]">{c.name}</span>
                              <span className="text-[10px] text-[var(--text-secondary)] ml-1">{c.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-[var(--text-primary)]">
                            {formatCurrency(c.price)}
                          </TableCell>
                          <TableCell className={`text-right font-mono text-xs font-medium ${c.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                            {formatPercent(c.change)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Sparkline data={spark} width={48} height={16} showFill />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Treasury Rates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <LineChart size={12} />
                  Treasuries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Yield curve visualization */}
                <div className="mb-4 h-24 relative">
                  <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((y) => (
                      <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="var(--border)" strokeWidth="0.5" />
                    ))}
                    {/* Yield curve path */}
                    <path
                      d={(() => {
                        const points = TREASURY_RATES.map((t, i) => {
                          const x = (i / (TREASURY_RATES.length - 1)) * 300;
                          const y = 100 - ((t.yield - yieldCurveMin) / (yieldCurveMax - yieldCurveMin)) * 100;
                          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(' ');
                        return points;
                      })()}
                      fill="none"
                      stroke="var(--accent-brand)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Dots */}
                    {TREASURY_RATES.map((t, i) => {
                      const x = (i / (TREASURY_RATES.length - 1)) * 300;
                      const y = 100 - ((t.yield - yieldCurveMin) / (yieldCurveMax - yieldCurveMin)) * 100;
                      return (
                        <circle key={t.term} cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="var(--accent-brand)" stroke="var(--bg-primary)" strokeWidth="2" />
                      );
                    })}
                  </svg>
                </div>

                {/* Rate table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Term</TableHead>
                      <TableHead className="text-[10px] text-right">Yield</TableHead>
                      <TableHead className="text-[10px] text-right">Prev</TableHead>
                      <TableHead className="text-[10px] text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TREASURY_RATES.map((t) => (
                      <TableRow key={t.term}>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                            {t.term}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-[var(--text-primary)]">
                          {t.yield.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-[var(--text-secondary)]">
                          {t.previous.toFixed(2)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs font-medium ${t.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                          {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- Sectors Tab ---- */}
        <TabsContent value="sectors" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                S&amp;P 500 Sector Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {SECTORS.map((sector) => {
                  const maxAbs = Math.max(...SECTORS.map((s) => Math.abs(s.change)));
                  const barWidth = maxAbs > 0 ? (Math.abs(sector.change) / maxAbs) * 100 : 0;
                  return (
                    <div key={sector.name} className="flex items-center gap-3 py-1.5">
                      <span className="w-36 text-xs text-[var(--text-primary)] font-medium truncate">
                        {sector.name}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-5 rounded bg-[var(--border)] overflow-hidden relative">
                          {sector.change >= 0 ? (
                            <div
                              className="h-full rounded-r-sm bg-[var(--positive)]/70"
                              style={{ width: `${barWidth}%`, marginLeft: '50%' }}
                            />
                          ) : (
                            <div
                              className="h-full rounded-l-sm bg-[var(--negative)]/70"
                              style={{ width: `${barWidth}%`, marginLeft: `${50 - barWidth}%` }}
                            />
                          )}
                          {/* Center line */}
                          <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--text-secondary)]/30" />
                        </div>
                        <span className={`w-16 text-right text-xs font-mono font-bold ${sector.change >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                          {formatPercent(sector.change)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Economic Calendar Tab ---- */}
        <TabsContent value="calendar" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Activity size={12} />
                Upcoming Economic Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Date</TableHead>
                    <TableHead className="text-[10px]">Event</TableHead>
                    <TableHead className="text-[10px] text-right">Previous</TableHead>
                    <TableHead className="text-[10px] text-right">Forecast</TableHead>
                    <TableHead className="text-[10px] text-center">Importance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ECONOMIC_CALENDAR.map((evt, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <span className="text-xs text-[var(--text-primary)] font-medium">{evt.date}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--text-primary)]">{evt.event}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-[var(--text-secondary)]">
                        {evt.previous}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-[var(--text-primary)] font-medium">
                        {evt.forecast}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${importanceColor(evt.importance)}`}>
                          {evt.importance}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Callout variant="info" title="Economic Calendar">
            <p className="text-xs">
              All times in ET. Data sourced from major economic indicators. Forecasts are consensus estimates.
            </p>
          </Callout>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 pt-2 pb-4 text-[10px] text-[var(--text-secondary)]">
        <Info size={10} />
        Data delayed 15&ndash;20 minutes. Not for trading purposes. Market data provided for informational use only.
      </div>
    </div>
  );
}

