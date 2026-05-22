'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { api, type Portfolio, type Signal } from '@/lib/api';
import { MetricCard, DeltaBadge, SparklineBar, StatusBadge, LiveIndicator, Button, Badge } from '@openmoney/ui';
import { Briefcase, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, Activity } from 'lucide-react';
import { toast } from 'sonner';

const INDICES = [
  { name: 'S&P 500', ticker: 'SPY' },
  { name: 'NASDAQ', ticker: 'QQQ' },
  { name: 'DOW', ticker: 'DIA' },
];

interface Quote { symbol: string; price: number; changePercent: number; }

function fmtCurr(v: number) { return new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(v); }
function fmtPct(v: number) { return `${v>=0?'+':''}${v.toFixed(2)}%`; }

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

  // Generate mock sparkline data
  const sparkData = React.useMemo(() => Array.from({length: 30}, () => Math.random()), []);

  if (loading) return <DashSkeleton />;
  if (error && !portfolios.length) return <DashError error={error} retry={fetch} />;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="font-mono text-[11px] text-[var(--text-tertiary)] mt-0.5">
            {session?.user?.name ?? 'Investor'} · {new Date().toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'})}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetch}><RefreshCw size={13} /></Button>
          <Link href="/portfolio"><Button variant="terminal" size="sm"><Plus size={13} /> Position</Button></Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <MetricCard label="PORTFOLIO VALUE" value={fmtCurr(totalValue)} status="neutral" sparkline={sparkData} accent />
        <MetricCard label="DAY P&L" value={fmtCurr(dayPnl)} delta={fmtPct(0.86)} status="positive" sparkline={sparkData.map(v => v * 1.2)} />
        <MetricCard label="POSITIONS" value={String(positionCount)} status="neutral" />
        <MetricCard label="PORTFOLIOS" value={String(portfolios.length)} status="neutral" />
      </div>

      {/* Market Indices + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Indices */}
        <div className="lg:col-span-2 bg-[var(--background-panel)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <span className="font-mono uppercase text-[10px] tracking-widest text-[var(--text-tertiary)]">MARKET SNAPSHOT</span>
            <LiveIndicator label="LIVE" />
          </div>
          <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
            {INDICES.map((idx, i) => {
              const q = quotes[i];
              const pct = q?.changePercent ?? 0;
              const isPos = pct >= 0;
              return (
                <div key={idx.ticker} className="px-4 py-3 hover:bg-[var(--background-elevated)] transition-colors cursor-pointer">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-2">{idx.name}</p>
                  <p className="font-mono text-lg font-semibold tabular-nums">{q?.price ? q.price.toLocaleString('en-US',{minimumFractionDigits:2}) : '—'}</p>
                  <div className="mt-1">
                    {q?.changePercent != null ? <DeltaBadge value={fmtPct(pct)} status={isPos ? 'positive' : 'negative'} /> : <span className="text-[var(--text-tertiary)]">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[var(--background-panel)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border)]">
            <span className="font-mono uppercase text-[10px] tracking-widest text-[var(--text-tertiary)]">RISK METRICS</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {[
              { label: 'VaR (95%)', value: '-2.34%', color: 'text-[var(--negative)]' },
              { label: 'Sharpe', value: '1.42', color: 'text-[var(--positive)]' },
              { label: 'Max DD', value: '-8.7%', color: 'text-[var(--negative)]' },
              { label: 'Beta', value: '1.08', color: 'text-[var(--text-secondary)]' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">{s.label}</span>
                <span className={`font-mono text-sm font-semibold tabular-nums ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signals */}
      <div className="bg-[var(--background-panel)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
          <span className="font-mono uppercase text-[10px] tracking-widest text-[var(--text-tertiary)]">RECENT SIGNALS</span>
          {signals.length > 0 && <Badge variant="default">{signals.length}</Badge>}
        </div>
        {signals.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {signals.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--background-elevated)] transition-colors">
                <div className={`flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] shrink-0 ${s.action === 'add' || s.action === 'hold' ? 'bg-[var(--positive-bg)] text-[var(--positive)]' : 'bg-[var(--negative-bg)] text-[var(--negative)]'}`}>
                  {s.action === 'add' || s.action === 'hold' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{s.title}</p>
                  <p className="font-mono text-[10px] text-[var(--text-tertiary)] truncate">{s.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.confidence != null && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1 rounded-full bg-[var(--background-elevated)] overflow-hidden">
                        <div className={`h-full rounded-full ${(s.confidence ?? 0) >= 70 ? 'bg-[var(--positive)]' : (s.confidence ?? 0) >= 40 ? 'bg-[var(--warning)]' : 'bg-[var(--negative)]'}`} style={{ width: `${s.confidence}%` }} />
                      </div>
                      <span className="font-mono text-[9px] text-[var(--text-tertiary)]">{s.confidence}%</span>
                    </div>
                  )}
                  <StatusBadge status={s.action === 'hold' ? 'ACTIVE' : 'REVIEWING'} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-6 text-center font-mono text-xs text-[var(--text-tertiary)]">
            No signals yet. Create a portfolio to get AI-powered recommendations.
          </p>
        )}
      </div>
    </div>
  );
}

function DashSkeleton() {
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-5">
      <div className="flex items-center justify-between"><div className="h-6 w-32 rounded bg-[var(--background-elevated)]" /><div className="h-8 w-24 rounded bg-[var(--background-elevated)]" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-[var(--radius-md)] bg-[var(--background-panel)] border border-[var(--border)]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 h-28 rounded-[var(--radius-md)] bg-[var(--background-panel)] border border-[var(--border)]" />
        <div className="h-28 rounded-[var(--radius-md)] bg-[var(--background-panel)] border border-[var(--border)]" />
      </div>
    </div>
  );
}

function DashError({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="p-6 max-w-md mx-auto mt-20">
      <div className="flex flex-col items-center text-center bg-[var(--background-panel)] border border-[var(--border)] rounded-[var(--radius-md)] p-8">
        <AlertTriangle size={24} className="text-[var(--negative)] mb-3" />
        <h2 className="font-sans text-sm font-semibold">Failed to load</h2>
        <p className="font-mono text-[11px] text-[var(--text-tertiary)] mt-1">{error}</p>
        <Button variant="terminal" size="sm" className="mt-4" onClick={retry}><RefreshCw size={13} /> Retry</Button>
      </div>
    </div>
  );
}
