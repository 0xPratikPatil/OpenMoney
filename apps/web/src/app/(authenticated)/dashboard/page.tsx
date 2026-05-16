'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { api, type Portfolio, type Signal } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  AllocationPie,
  SignalTimeline,
  EmptyState,
  MetricBlock,
  MetricsGrid,
  Sparkline,
} from '@openmoney/ui';
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Mock market indices for MVP                                                */
/* -------------------------------------------------------------------------- */
const MOCK_INDICES = [
  { name: 'S&P 500', ticker: 'SPY', value: 5_234.18, change: 0.72 },
  { name: 'NASDAQ', ticker: 'QQQ', value: 18_345.62, change: 1.14 },
  { name: 'DOW JONES', ticker: 'DIA', value: 39_876.34, change: -0.23 },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
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

/* -------------------------------------------------------------------------- */
/*  Dashboard Page                                                             */
/* -------------------------------------------------------------------------- */
export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [portfolios, setPortfolios] = React.useState<Portfolio[]>([]);
  const [signals, setSignals] = React.useState<Signal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  /* Aggregate portfolio metrics */
  const totalValue = React.useMemo(
    () => portfolios.reduce((s, p) => s + ((p as any).summary?.totalValue ?? 0), 0),
    [portfolios],
  );
  const dayPnl = React.useMemo(
    () => portfolios.reduce((s, p) => s + (((p as any).summary?.totalReturn ?? 0)), 0),
    [portfolios],
  );
  const allocData = React.useMemo(() => {
    if (!portfolios.length) return [];
    return portfolios.slice(0, 6).map((p) => ({
      name: p.name,
      value: ((p as any).summary?.totalValue ?? 0) || 1,
      color: `hsl(${Math.random() * 360}, 60%, 60%)`,
    }));
  }, [portfolios]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [portfolioRes, signalsRes] = await Promise.all([
        api.portfolios.list(),
        api.signals.list(),
      ]);
      if (!portfolioRes.success) throw new Error(portfolioRes.error ?? 'Failed to load portfolios');
      if (!signalsRes.success) throw new Error(signalsRes.error ?? 'Failed to load signals');
      setPortfolios(portfolioRes.data);
      setSignals(signalsRes.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      toast.error(err.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Loading State ---- */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Skeleton metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-muted p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-muted p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 flex-1" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
        {/* Skeleton signals */}
        <div className="rounded-xl border border-border bg-muted p-6 space-y-3">
          <Skeleton className="h-5 w-28" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Error State ---- */
  if (error && !portfolios.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Failed to load dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---- Empty State (no portfolios) ---- */
  if (!portfolios.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Still show market snapshot */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session?.user?.name ?? 'Investor'}
          </p>
        </div>

        {/* Market indices */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Market Snapshot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_INDICES.map((idx) => (
              <div
                key={idx.ticker}
                className="rounded-xl border border-border bg-muted p-4"
              >
                <p className="text-xs text-muted-foreground">{idx.name}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {idx.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${idx.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {idx.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {formatPercent(idx.change)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signals section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recent Signals
          </h2>
          {signals.length > 0 ? (
            <div className="rounded-xl border border-border bg-muted p-4">
              <SignalTimeline signals={signals.slice(0, 5).map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                action: (s.action ?? 'hold') as 'hold' | 'add' | 'reduce' | 'exit' | 'rebalance',
                confidence: s.confidence ?? 0,
                createdAt: s.createdAt,
              }))} />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
              No signals yet. Create a portfolio to start receiving recommendations.
            </div>
          )}
        </div>

        <EmptyState
          title="No portfolios yet"
          description="Create your first portfolio to start tracking positions, risk metrics, and recommendations."
          action={{
            label: 'Create Portfolio',
            onClick: () => router.push('/portfolio'),
          }}
        />
      </div>
    );
  }

  /* ---- Main Dashboard (with data) ---- */
  const hasPositions = portfolios.some((p) => (p._count?.positions ?? 0) > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Welcome back, {session?.user?.name ?? 'Investor'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Briefcase size={14} />
            View All Portfolios
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            Add Position
          </Link>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio Value', value: formatCurrency(totalValue), color: 'text-foreground' },
          { label: 'Day P&L', value: formatCurrency(dayPnl), color: dayPnl >= 0 ? 'text-success' : 'text-destructive' },
          { label: 'VaR (95%)', value: formatPercent(-2.34), color: 'text-destructive' },
          { label: 'Sharpe Ratio', value: '1.42', color: 'text-success' },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <p className="text-xs font-mono text-muted-foreground">{metric.label}</p>
              <p className={`text-lg font-bold font-mono mt-1 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Allocation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Market Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MOCK_INDICES.map((idx) => (
                <div
                  key={idx.ticker}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <p className="text-xs text-muted-foreground">{idx.name}</p>
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {idx.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${idx.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {idx.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {formatPercent(idx.change)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allocation pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocData.length > 0 ? (
              <AllocationPie segments={allocData.map(a => ({ label: a.name, value: a.value, color: a.color }))} />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No allocation data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {signals.length > 0 ? (
            <SignalTimeline signals={signals.slice(0, 8).map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              action: (s.action ?? 'hold') as 'hold' | 'add' | 'reduce' | 'exit' | 'rebalance',
              confidence: s.confidence ?? 0,
              createdAt: s.createdAt,
            }))} />
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No signals yet. As your portfolio data grows, signals will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
