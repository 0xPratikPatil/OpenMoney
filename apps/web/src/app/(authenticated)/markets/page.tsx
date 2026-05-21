'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Callout,
} from '@openmoney/ui';
import {
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
import { api } from '@/lib/api';

/* -------------------------------------------------------------------------- */
/*  Live market symbols                                                        */
/* -------------------------------------------------------------------------- */
const INDEX_SYMBOLS = [
  { name: 'S&P 500', ticker: 'SPY' },
  { name: 'NASDAQ', ticker: 'QQQ' },
  { name: 'DOW JONES', ticker: 'DIA' },
  { name: 'RUSSELL 2000', ticker: 'IWM' },
];

const ETF_SECTORS = [
  { name: 'Technology', ticker: 'XLK' },
  { name: 'Healthcare', ticker: 'XLV' },
  { name: 'Financials', ticker: 'XLF' },
  { name: 'Consumer Cyclical', ticker: 'XLY' },
  { name: 'Communication', ticker: 'XLC' },
  { name: 'Industrials', ticker: 'XLI' },
  { name: 'Consumer Defensive', ticker: 'XLP' },
  { name: 'Energy', ticker: 'XLE' },
  { name: 'Utilities', ticker: 'XLU' },
  { name: 'Real Estate', ticker: 'XLRE' },
  { name: 'Materials', ticker: 'XLB' },
];

interface Quote {
  symbol: string;
  price: number;
  changePercent: number;
}

const TREASURY_RATES = [
  { term: '2Y', symbol: '2YY=F' },
  { term: '5Y', symbol: '5YY=F' },
  { term: '10Y', symbol: '10Y=F' },
  { term: '30Y', symbol: '30Y=F' },
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

/* -------------------------------------------------------------------------- */
/*  Markets Page                                                               */
/* -------------------------------------------------------------------------- */
export default function MarketsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [indexQuotes, setIndexQuotes] = React.useState<Quote[]>([]);
  const [sectorQuotes, setSectorQuotes] = React.useState<Quote[]>([]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allQuotes = await Promise.allSettled(
        [...INDEX_SYMBOLS, ...ETF_SECTORS].map((s) =>
          api.market.quote(s.ticker).then((r) => (r.success ? r.data : null))
        )
      );
      const results: Quote[] = allQuotes.map((q, i) => {
        if (q.status === 'rejected') return { symbol: '', price: 0, changePercent: 0 };
        const data = q.value as Record<string, unknown> | null;
        return {
          symbol: [...INDEX_SYMBOLS, ...ETF_SECTORS][i]!.ticker,
          price: (data?.price as number) ?? 0,
          changePercent: (data?.changePercent as number) ?? 0,
        };
      });
      setIndexQuotes(results.slice(0, INDEX_SYMBOLS.length));
      setSectorQuotes(results.slice(INDEX_SYMBOLS.length));
    } catch (err: any) {
      setError(err.message ?? 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

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
          {indexQuotes.map((q, i) => {
            const info = INDEX_SYMBOLS[i]!;
            return (
            <div
              key={q.symbol}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--accent-brand)]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {info.name}
                </p>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">{info.ticker}</span>
              </div>
              <p className="mt-1.5 text-lg font-bold font-mono text-[var(--text-primary)] tabular-nums">
                {q.price ? q.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
              </p>
              <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${q.changePercent >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                {q.changePercent >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {formatPercent(q.changePercent)}
              </div>
            </div>
            );
          })}
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
                {sectorQuotes.map((q, i) => {
                  const sector = ETF_SECTORS[i]!;
                  return (
                  <div
                    key={sector.ticker}
                    className={`rounded-lg border px-3 py-2 text-center transition-colors ${
                      q.changePercent >= 0
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    <p className="text-[10px] font-medium text-[var(--text-secondary)] truncate">
                      {sector.name}
                    </p>
                    <p className={`text-sm font-bold font-mono mt-0.5 ${q.changePercent >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                      {formatPercent(q.changePercent)}
                    </p>
                    <div className="mt-1 h-1 w-full rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${q.changePercent >= 0 ? 'bg-[var(--positive)]' : 'bg-[var(--negative)]'}`}
                        style={{ width: `${Math.min(Math.abs(q.changePercent) * 40, 100)}%` }}
                      />
                    </div>
                  </div>
                  );
                })}
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
              <CardContent className="p-6 text-center text-sm text-[var(--text-secondary)]">
                <p>Forex rates available via provider query.</p>
                <p className="mt-1 text-xs">
                  Use <code className="text-[var(--accent-brand)]">api.market.providers.query()</code>
                </p>
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
              <CardContent className="p-6 text-center text-sm text-[var(--text-secondary)]">
                <p>Commodity prices via futures provider.</p>
                <p className="mt-1 text-xs">Provider: futures/historical model</p>
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
              <CardContent className="p-6 text-center text-sm text-[var(--text-secondary)]">
                <p>Treasury rates via government_us provider.</p>
                <p className="mt-1 text-xs">Model: treasury-rates</p>
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
                {sectorQuotes.map((q, i) => {
                  const sector = ETF_SECTORS[i]!;
                  const maxAbs = Math.max(...sectorQuotes.map((s) => Math.abs(s.changePercent)), 1);
                  const barWidth = (Math.abs(q.changePercent) / maxAbs) * 100;
                  return (
                    <div key={sector.ticker} className="flex items-center gap-3 py-1.5">
                      <span className="w-36 text-xs text-[var(--text-primary)] font-medium truncate">
                        {sector.name}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-5 rounded bg-[var(--border)] overflow-hidden relative">
                          {q.changePercent >= 0 ? (
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
                          <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--text-secondary)]/30" />
                        </div>
                        <span className={`w-16 text-right text-xs font-mono font-bold ${q.changePercent >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                          {formatPercent(q.changePercent)}
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
            <CardContent className="p-6 text-center text-sm text-[var(--text-secondary)]">
              <p>Economic calendar data will be available soon.</p>
              <p className="mt-1 text-xs">Powered by provider: economic/calendar or tradingeconomics/calendar</p>
            </CardContent>
          </Card>

          <Callout variant="info" title="Economic Calendar">
            <p className="text-xs">
              Live economic calendar powered by provider data. Connect a provider API key to unlock real-time economic data.
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

