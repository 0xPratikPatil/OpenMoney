'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { api } from '@/lib/api';
import { Skeleton, Card, CardContent } from '@openmoney/ui';
import {
  Globe, TrendingUp, TrendingDown, RefreshCw, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Activity, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

const INDICES = [
  { name: 'S&P 500', ticker: 'SPY' }, { name: 'NASDAQ', ticker: 'QQQ' },
  { name: 'DOW', ticker: 'DIA' }, { name: 'RUSSELL 2K', ticker: 'IWM' },
];
const SECTORS = [
  { name: 'Tech', ticker: 'XLK' }, { name: 'Healthcare', ticker: 'XLV' },
  { name: 'Financials', ticker: 'XLF' }, { name: 'Energy', ticker: 'XLE' },
  { name: 'Consumer', ticker: 'XLY' }, { name: 'Industrials', ticker: 'XLI' },
  { name: 'Utilities', ticker: 'XLU' }, { name: 'Real Estate', ticker: 'XLRE' },
  { name: 'Materials', ticker: 'XLB' }, { name: 'Comm', ticker: 'XLC' },
];

interface Quote { symbol: string; price: number; changePercent: number; }

function fmtCurr(v: number) { return new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(v); }
function fmtPct(v: number) { return `${v>=0?'+':''}${v.toFixed(2)}%`; }

export default function MarketsPage() {
  const [indices, setIndices] = React.useState<Quote[]>([]);
  const [sectors, setSectors] = React.useState<Quote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const all = [...INDICES, ...SECTORS];
      const res = await Promise.allSettled(all.map(s => api.market.quote(s.ticker)));
      const qs: Quote[] = all.map((s, i) => {
        const r = res[i];
        if (r?.status === 'fulfilled' && r.value.success) {
          const d = r.value.data as any;
          return { symbol: s.ticker, price: d?.price ?? 0, changePercent: d?.changePercent ?? 0 };
        }
        return { symbol: s.ticker, price: 0, changePercent: 0 };
      });
      setIndices(qs.slice(0, INDICES.length));
      setSectors(qs.slice(INDICES.length));
    } catch (err: any) { setError(err.message); toast.error(err.message); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <MarketsSkeleton />;
  if (error) return <MarketsError error={error} retry={fetch} />;

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe size={20} className="text-[var(--brand)]" /> Markets
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Real-time multi-asset market overview</p>
        </div>
        <button onClick={fetch} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Major Indices */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-3 flex items-center gap-2"><BarChart3 size={12} /> Major Indices</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {INDICES.map((idx, i) => {
            const q = indices[i];
            const pct = q?.changePercent ?? 0;
            const isPos = pct >= 0;
            return (
              <div key={idx.ticker} className="glass-card p-4 group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{idx.name}</span>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{idx.ticker}</span>
                </div>
                <p className="text-xl font-bold font-mono tabular-nums">{q?.price ? q.price.toLocaleString('en-US',{minimumFractionDigits:2}) : '—'}</p>
                <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${isPos?'text-[var(--success)]':'text-[var(--destructive)]'}`}>
                  {q?.changePercent != null ? <>{isPos?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>}{fmtPct(pct)}</> : <span className="text-[var(--text-tertiary)]">—</span>}
                </div>
                <div className="mt-3 h-1 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isPos?'bg-[var(--success)]/70':'bg-[var(--destructive)]/70'}`} style={{width:`${Math.min(Math.abs(pct)*8,100)}%`}} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sector Heatmap */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-3 flex items-center gap-2"><Activity size={12} /> Sector Performance</h2>
        <div className="glass-card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {SECTORS.map((sec, i) => {
              const q = sectors[i];
              const pct = q?.changePercent ?? 0;
              const isPos = pct >= 0;
              return (
                <div key={sec.ticker} className={`rounded-xl p-3.5 text-center transition-all hover:scale-[1.02] ${isPos?'bg-[var(--success-muted)] border border-[var(--success)]/10':'bg-[var(--destructive-muted)] border border-[var(--destructive)]/10'}`}>
                  <p className="text-[10px] font-medium text-[var(--text-secondary)]">{sec.name}</p>
                  <p className={`mt-1 text-sm font-bold font-mono ${isPos?'text-[var(--success)]':'text-[var(--destructive)]'}`}>
                    {fmtPct(pct)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] text-[var(--text-tertiary)]">Data delayed 15–20 min. Powered by Yahoo Finance.</p>
    </div>
  );
}

function MarketsSkeleton() {
  return <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-8"><Skeleton className="h-8 w-40 rounded-lg" /><div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_,i)=><Skeleton key={i} className="h-28 rounded-xl" />)}</div><Skeleton className="h-48 rounded-xl" /></div>;
}
function MarketsError({error,retry}:{error:string;retry:()=>void}) {
  return <div className="p-6 max-w-xl mx-auto mt-20"><div className="flex flex-col items-center text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-12"><div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--destructive-muted)] mb-4"><AlertTriangle size={24} className="text-[var(--destructive)]" /></div><h2 className="text-lg font-semibold">Failed</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p><button onClick={retry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-foreground)]"><RefreshCw size={15} /> Retry</button></div></div>;
}
