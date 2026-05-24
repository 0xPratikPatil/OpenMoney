'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { api } from '@/lib/api';
import { DeltaBadge, SparklineBar, LiveIndicator, Button } from '@openmoney/ui';
import { Globe, RefreshCw, AlertTriangle, BarChart3, Activity } from 'lucide-react';
import { toast } from 'sonner';

const INDICES = [{ name: 'S&P 500', ticker: 'SPY' }, { name: 'NASDAQ', ticker: 'QQQ' }, { name: 'DOW', ticker: 'DIA' }, { name: 'RUSSELL 2K', ticker: 'IWM' }];
const SECTORS = [{ name: 'Tech', ticker: 'XLK' }, { name: 'Healthcare', ticker: 'XLV' }, { name: 'Financials', ticker: 'XLF' }, { name: 'Energy', ticker: 'XLE' }, { name: 'Consumer', ticker: 'XLY' }, { name: 'Industrials', ticker: 'XLI' }, { name: 'Utilities', ticker: 'XLU' }, { name: 'Real Estate', ticker: 'XLRE' }, { name: 'Materials', ticker: 'XLB' }, { name: 'Comm', ticker: 'XLC' }];
interface Quote { symbol: string; price: number; changePercent: number; }
function fmtPct(v: number) { return `${v>=0?'+':''}${v.toFixed(2)}%`; }
const sparkData = Array.from({length: 20}, () => Math.random());

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
      const qs: Quote[] = all.map((s, i) => { const r = res[i]; if (r?.status === 'fulfilled' && r.value.success) { const d = r.value.data as any; return { symbol: s.ticker, price: d?.price ?? 0, changePercent: d?.changePercent ?? 0 }; } return { symbol: s.ticker, price: 0, changePercent: 0 }; });
      setIndices(qs.slice(0, INDICES.length)); setSectors(qs.slice(INDICES.length));
    } catch (err: any) { setError(err.message); toast.error(err.message); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <div className="p-6 max-w-[1440px] mx-auto space-y-6"><div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-md bg-muted" />)}</div></div>;
  if (error) return (
    <div className="p-6 max-w-md mx-auto mt-20">
      <div className="flex flex-col items-center text-center border border-border rounded-md p-8">
        <AlertTriangle size={24} className="text-destructive mb-3" />
        <h2 className="text-sm font-semibold">Failed to load</h2>
        <p className="font-mono text-[11px] text-muted-foreground mt-1">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetch}><RefreshCw size={13} /> Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="@container/main p-6 max-w-[1440px] mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold tracking-tight flex items-center gap-2"><Globe size={18} /> Markets</h1><p className="font-mono text-[11px] text-muted-foreground mt-0.5">Multi-asset real-time overview</p></div>
        <div className="flex items-center gap-2"><LiveIndicator label="LIVE" /><Button variant="ghost" size="sm" onClick={fetch}><RefreshCw size={13} /></Button></div>
      </div>

      <div className="border border-foreground/10 rounded-md overflow-hidden">
        <div className="px-4 py-2.5 border-b border-foreground/10"><span className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground flex items-center gap-1.5"><BarChart3 size={11} /> MAJOR INDICES</span></div>
        <div className="grid grid-cols-2 @[800px]/main:grid-cols-4 divide-x divide-foreground/5">
          {INDICES.map((idx, i) => { const q = indices[i]; const pct = q?.changePercent ?? 0; const isPos = pct >= 0; return (
            <div key={idx.ticker} className="px-4 py-3 hover:bg-foreground/[0.03] transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{idx.name}</p><p className="font-mono text-[9px] text-muted-foreground">{idx.ticker}</p></div>
              <p className="font-mono text-xl font-semibold tabular-nums">{q?.price ? q.price.toLocaleString('en-US',{minimumFractionDigits:2}) : '—'}</p>
              <div className="mt-2">{q?.changePercent != null ? <DeltaBadge value={fmtPct(pct)} status={isPos ? 'positive' : 'negative'} /> : <span className="text-muted-foreground">—</span>}</div>
              <div className="mt-3"><SparklineBar values={sparkData} status={isPos ? 'positive' : 'negative'} height={20} /></div>
            </div>
          ); })}
        </div>
      </div>

      <div className="border border-foreground/10 rounded-md overflow-hidden">
        <div className="px-4 py-2.5 border-b border-foreground/10"><span className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground flex items-center gap-1.5"><Activity size={11} /> SECTOR PERFORMANCE</span></div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 @[800px]/main:grid-cols-5 gap-2">
            {SECTORS.map((sec, i) => { const q = sectors[i]; const pct = q?.changePercent ?? 0; const isPos = pct >= 0; return (
              <div key={sec.ticker} className="rounded-sm p-3 text-center border border-foreground/5 transition-colors hover:bg-foreground/[0.03]">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{sec.name}</p>
                <p className={`mt-1 font-mono text-sm font-semibold tabular-nums ${isPos ? 'text-foreground' : 'text-destructive'}`}>{fmtPct(pct)}</p>
              </div>
            ); })}
          </div>
        </div>
      </div>

      <p className="text-center font-mono text-[9px] text-muted-foreground">Data delayed 15–20 min · Powered by Yahoo Finance</p>
    </div>
  );
}
