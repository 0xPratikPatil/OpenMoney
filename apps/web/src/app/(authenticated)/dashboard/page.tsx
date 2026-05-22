'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { api, type Portfolio, type Signal } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@openmoney/ui';
import {
  Briefcase, Plus, TrendingUp, TrendingDown, ArrowUpRight,
  ArrowDownRight, RefreshCw, AlertTriangle, Sparkles,
  Activity, DollarSign, Shield, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

const INDICES = [
  { name: 'S&P 500', ticker: 'SPY' },
  { name: 'NASDAQ', ticker: 'QQQ' },
  { name: 'DOW', ticker: 'DIA' },
];

interface Quote { symbol: string; price: number; changePercent: number; }

function fmtCurr(v: number) { return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', notation:'compact', maximumFractionDigits:1 }).format(v); }
function fmtPct(v: number) { return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`; }

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [portfolios, setPortfolios] = React.useState<Portfolio[]>([]);
  const [signals, setSignals] = React.useState<Signal[]>([]);
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const totalValue = portfolios.reduce((s, p) => s + (((p as any).summary?.totalValue as number) ?? 0), 0);
  const dayPnl = portfolios.reduce((s, p) => s + (((p as any).summary?.totalReturn as number) ?? 0), 0);
  const positionCount = portfolios.reduce((s, p) => s + (p._count?.positions ?? 0), 0);

  const fetch = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [pr, sr, ...qr] = await Promise.all([
        api.portfolios.list(), api.signals.list(),
        ...INDICES.map(i => api.market.quote(i.ticker)),
      ]);
      if (!pr.success) throw new Error(pr.error?.message ?? 'Failed');
      setPortfolios(pr.data);
      if (sr.success) setSignals(sr.data);
      setQuotes(INDICES.map((idx, i) => {
        const d = qr[i]?.success ? qr[i]!.data as any : null;
        return { symbol: idx.ticker, price: d?.price ?? 0, changePercent: d?.changePercent ?? 0 };
      }));
    } catch (err: any) { setError(err.message); toast.error(err.message); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <DashboardSkeleton />;
  if (error && !portfolios.length) return <DashboardError error={error} retry={fetch} />;

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-[var(--brand)]" />
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Welcome back, {session?.user?.name ?? 'Investor'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-150">
            <Briefcase size={15} /> Portfolios
          </Link>
          <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-foreground)] hover:opacity-90 transition-opacity">
            <Plus size={15} /> Add Position
          </Link>
        </div>
      </div>

      {/* KPI Row — glass cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Total Value', value: fmtCurr(totalValue), icon: DollarSign, trend: null },
          { label: 'Day P&L', value: fmtCurr(dayPnl), icon: TrendingUp, trend: dayPnl >= 0 ? 'up' : 'down' as const },
          { label: 'Positions', value: String(positionCount), icon: Activity, trend: null },
          { label: 'Portfolios', value: String(portfolios.length), icon: Briefcase, trend: null },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const isUp = kpi.trend === 'up';
          const isDown = kpi.trend === 'down';
          return (
            <div key={kpi.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{kpi.label}</span>
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isUp ? 'bg-[var(--success-muted)]' : isDown ? 'bg-[var(--destructive-muted)]' : 'bg-[var(--surface)]'}`}>
                  <Icon size={15} className={isUp ? 'text-[var(--success)]' : isDown ? 'text-[var(--destructive)]' : 'text-[var(--text-secondary)]'} />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight tabular-nums">{kpi.value}</p>
              {kpi.label === 'Day P&L' && <p className={`mt-1 text-xs font-medium ${dayPnl >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>{fmtPct(0.86)} today</p>}
            </div>
          );
        })}
      </div>

      {/* Market Indices + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">Market Snapshot</h3>
            <div className="grid grid-cols-3 gap-4">
              {INDICES.map((idx, i) => {
                const q = quotes[i];
                const isPos = (q?.changePercent ?? 0) >= 0;
                return (
                  <div key={idx.ticker} className="rounded-xl bg-[var(--surface)] p-4 hover:bg-[var(--surface-elevated)] transition-colors group">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">{idx.name}</p>
                    <p className="text-lg font-bold font-mono tabular-nums">{q?.price ? q.price.toLocaleString('en-US', {minimumFractionDigits:2}) : '—'}</p>
                    <div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${isPos ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                      {q?.changePercent != null ? <>{isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{fmtPct(q.changePercent)}</> : <span className="text-[var(--text-tertiary)]">—</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: 'VaR (95%)', value: '-2.34%', color: 'text-[var(--destructive)]' },
              { label: 'Sharpe Ratio', value: '1.42', color: 'text-[var(--success)]' },
              { label: 'Max Drawdown', value: '-8.7%', color: 'text-[var(--destructive)]' },
              { label: 'Beta', value: '1.08', color: 'text-[var(--text-secondary)]' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">{s.label}</span>
                <span className={`text-sm font-mono font-semibold tabular-nums ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signals */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">Recent Signals</h3>
        {signals.length > 0 ? (
          <div className="space-y-1">
            {signals.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface)] transition-colors group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${s.action === 'add' || s.action === 'hold' ? 'bg-[var(--success-muted)] text-[var(--success)]' : 'bg-[var(--destructive-muted)] text-[var(--destructive)]'}`}>
                  {s.action === 'add' || s.action === 'hold' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{s.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.confidence != null && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                        <div className={`h-full rounded-full ${(s.confidence ?? 0) >= 70 ? 'bg-[var(--success)]' : (s.confidence ?? 0) >= 40 ? 'bg-[var(--warning)]' : 'bg-[var(--destructive)]'}`} style={{ width: `${s.confidence}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">{s.confidence}%</span>
                    </div>
                  )}
                  <Badge variant="outline" className="text-[10px] capitalize">{s.action}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">No signals yet. Create a portfolio to get AI-powered recommendations.</p>
        )}
      </div>
    </div>
  );
}

/* Loading skeleton */
function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div><Skeleton className="h-8 w-48 rounded-lg" /><Skeleton className="h-4 w-64 mt-2 rounded-md" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-5 space-y-3"><Skeleton className="h-3 w-20 rounded" /><Skeleton className="h-7 w-28 rounded" /></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-5 space-y-4"><Skeleton className="h-3 w-32 rounded" /><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div></div>
        <div className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-5 space-y-4"><Skeleton className="h-3 w-24 rounded" />{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full rounded" />)}</div>
      </div>
    </div>
  );
}

function DashboardError({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="p-6 max-w-xl mx-auto mt-20">
      <div className="flex flex-col items-center text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-12">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--destructive-muted)] mb-4"><AlertTriangle size={24} className="text-[var(--destructive)]" /></div>
        <h2 className="text-lg font-semibold">Failed to load</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
        <button onClick={retry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-foreground)] hover:opacity-90"><RefreshCw size={15} /> Retry</button>
      </div>
    </div>
  );
}
