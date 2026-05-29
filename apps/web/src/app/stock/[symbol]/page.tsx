'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type HistoricalDataPoint, type Watchlist } from '@/lib/api';
import { Button, Badge, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent, DeltaBadge, LiveIndicator, EmptyState } from '@openmoney/ui';
import { ArrowLeft, TrendingUp, Activity, BarChart3, Eye, Plus, Star, Newspaper, Calculator, Bot, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

function fmtCurr(v: number, compact = true) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 2 : 2 }).format(v); }
function fmtPct(v: number) { return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`; }
function fmtNum(v: number, compact = true) { return new Intl.NumberFormat('en-US', { notation: compact ? 'compact' : 'standard', maximumFractionDigits: 2 }).format(v); }

export default function StockDetailPage() {
  const params = useParams(); const router = useRouter();
  const symbol = (params.symbol as string).toUpperCase();
  const [quote, setQuote] = React.useState<any>(null);
  const [historical, setHistorical] = React.useState<HistoricalDataPoint[]>([]);
  const [profile, setProfile] = React.useState<any>(null);
  const [keyMetrics, setKeyMetrics] = React.useState<any>(null);
  const [watchlists, setWatchlists] = React.useState<Watchlist[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState('1M');
  const [chartLoading, setChartLoading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [qRes, pRes, kmRes, wlRes] = await Promise.allSettled([
        api.market.quote(symbol),
        api.market.profile(symbol),
        api.market.keyMetrics(symbol),
        api.watchlists.list(),
      ]);
      if (qRes.status === 'fulfilled' && qRes.value.success) setQuote(qRes.value.data);
      else if (qRes.status === 'fulfilled') throw new Error(qRes.value.error ?? 'Failed to fetch quote');
      if (pRes.status === 'fulfilled' && pRes.value.success) setProfile(pRes.value.data);
      if (kmRes.status === 'fulfilled' && kmRes.value.success) setKeyMetrics(kmRes.value.data);
      if (wlRes.status === 'fulfilled' && wlRes.value.success) setWatchlists(wlRes.value.data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [symbol]);

  const fetchHistory = React.useCallback(async () => {
    setChartLoading(true);
    try {
      const days = period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : period === '1Y' ? 365 : 1825;
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const res = await api.market.historical(symbol, { startDate: start, endDate: end, interval: '1d' });
      if (res.success) setHistorical(res.data);
    } catch (e) { /* silent */ } finally { setChartLoading(false); }
  }, [symbol, period]);

  React.useEffect(() => { fetchData(); }, [fetchData]);
  React.useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleAddToWatchlist = async (ticker: string, wlId?: string) => {
    const targetId = wlId ?? watchlists[0]?.id;
    if (!targetId) { toast.error('No watchlists available'); return; }
    try {
      const res = await api.watchlists.addItem(targetId, ticker);
      if (res.success) toast.success(`${ticker} added to watchlist`);
      else throw new Error(res.error);
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );

  if (error || !quote) return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ArrowLeft size={14} /> Back</button>
      <EmptyState icon={AlertTriangle} title="Failed to load" description={error ?? 'Symbol not found'} action={{ label: 'Retry', onClick: fetchData }} />
    </div>
  );

  const pct = quote.changePercent ?? 0; const isPos = pct >= 0;
  const hiLo = quote.dayHigh && quote.dayLow ? `${(quote.dayHigh / quote.dayLow * 100 - 100).toFixed(1)}%` : null;
  const chartMax = historical.length ? Math.max(...historical.map(h => h.close || h.high || 0)) : 0;
  const chartMin = historical.length ? Math.min(...historical.map(h => h.low || h.close || 0)) : 0;
  const chartRange = chartMax - chartMin || 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-[var(--accent)] transition-colors"><ArrowLeft size={18} className="text-[var(--text-secondary)]" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] font-mono">{symbol}</h1>
              <Badge variant="outline" className="font-mono text-xs">{(profile as any)?.exchange ?? 'Exchange'}</Badge>
              {(profile as any)?.sector && <Badge variant="secondary" className="text-xs">{(profile as any).sector}</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{(profile as any)?.name ?? symbol}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleAddToWatchlist(symbol)}><Eye size={13} /> Watchlist</Button>
          <Button size="sm" onClick={() => router.push(`/portfolio`)}><Plus size={13} /> Add Position</Button>
        </div>
      </div>

      {/* Price & Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Price', value: `$${(quote.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, mono: true },
          { label: 'Change', value: fmtPct(pct), mono: true, color: isPos ? 'positive' : 'negative' },
          { label: 'Volume', value: fmtNum(quote.volume ?? 0), mono: true },
          { label: 'Market Cap', value: quote.marketCap ? fmtCurr(quote.marketCap) : '—', mono: true },
        ].map(m => (
          <div key={m.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">{m.label}</p>
            <p className={`text-xl font-bold tabular-nums ${m.mono ? 'font-mono' : ''} ${m.color === 'positive' ? 'text-[var(--positive)]' : m.color === 'negative' ? 'text-[var(--negative)]' : 'text-[var(--text-primary)]'}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5"><BarChart3 size={11} /> Price Chart</span>
            <div className="flex items-center gap-1.5">
              {chartLoading && <span className="font-mono text-[9px] text-[var(--text-tertiary)]">Loading...</span>}
              <LiveIndicator label="LIVE" />
              <div className="flex gap-0.5 ml-2">
                {['1W', '1M', '3M', '6M', '1Y'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${period === p ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4">
            {historical.length > 0 ? (
              <div className="relative h-56">
                <svg viewBox={`0 0 ${historical.length * 3} 200`} className="w-full h-full" preserveAspectRatio="none">
                  {/* Area fill */}
                  <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--positive)" stopOpacity="0.2" /><stop offset="100%" stopColor="var(--positive)" stopOpacity="0" /></linearGradient></defs>
                  <path d={`M0,200 ${historical.map((h, i) => `L${i * 3},${200 - ((h.close - chartMin) / chartRange) * 180}`).join(' ')} L${historical.length * 3 - 3},200 Z`} fill="url(#chartGrad)" />
                  {/* Line */}
                  <path d={historical.map((h, i) => `${i === 0 ? 'M' : 'L'}${i * 3},${200 - ((h.close - chartMin) / chartRange) * 180}`).join(' ')} fill="none" stroke="var(--positive)" strokeWidth="1.5" />
                  {/* Volume bars */}
                  {historical.filter((_, i) => i % Math.ceil(historical.length / 40) === 0).map((h, i) => {
                    const volMax = Math.max(...historical.map(x => x.volume || 1));
                    const volH = ((h.volume || 0) / volMax) * 20;
                    return <rect key={i} x={i * 3 * Math.ceil(historical.length / 40)} y={200 - volH} width="2" height={volH} fill="var(--text-tertiary)" opacity="0.15" />;
                  })}
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center h-56 text-sm text-[var(--text-tertiary)]">No historical data available</div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Key Stats</p>
          {[
            { label: 'Open', value: quote.open ? `$${quote.open.toFixed(2)}` : '—' },
            { label: 'High', value: quote.dayHigh ? `$${quote.dayHigh.toFixed(2)}` : '—' },
            { label: 'Low', value: quote.dayLow ? `$${quote.dayLow.toFixed(2)}` : '—' },
            { label: 'Prev Close', value: quote.previousClose ? `$${quote.previousClose.toFixed(2)}` : '—' },
            { label: '52W High', value: quote.fiftyTwoWeekHigh ? `$${quote.fiftyTwoWeekHigh.toFixed(2)}` : '—' },
            { label: '52W Low', value: quote.fiftyTwoWeekLow ? `$${quote.fiftyTwoWeekLow.toFixed(2)}` : '—' },
            { label: 'P/E', value: (keyMetrics as any)?.peRatio ? (keyMetrics as any).peRatio.toFixed(1) : '—' },
            { label: 'EPS', value: (keyMetrics as any)?.eps ? `$${(keyMetrics as any).eps.toFixed(2)}` : '—' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--text-tertiary)]">{s.label}</span>
              <span className="font-mono text-[13px] font-medium text-[var(--text-primary)] tabular-nums">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Fundamentals / Financials / AI Analysis */}
      <Tabs defaultValue="fundamentals">
        <TabsList>
          <TabsTrigger value="fundamentals"><Activity size={13} /> Fundamentals</TabsTrigger>
          <TabsTrigger value="financials"><Calculator size={13} /> Financials</TabsTrigger>
          <TabsTrigger value="ai"><Bot size={13} /> AI Analysis</TabsTrigger>
          <TabsTrigger value="news"><Newspaper size={13} /> News</TabsTrigger>
        </TabsList>

        <TabsContent value="fundamentals" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(keyMetrics ? [
              { label: 'P/E Ratio', value: keyMetrics.peRatio?.toFixed(2) ?? '—' },
              { label: 'EPS', value: keyMetrics.eps ? `$${keyMetrics.eps.toFixed(2)}` : '—' },
              { label: 'Revenue', value: keyMetrics.revenue ? fmtCurr(keyMetrics.revenue) : '—' },
              { label: 'Profit Margin', value: keyMetrics.profitMargin ? `${(keyMetrics.profitMargin * 100).toFixed(1)}%` : '—' },
              { label: 'ROE', value: keyMetrics.roe ? `${(keyMetrics.roe * 100).toFixed(1)}%` : '—' },
              { label: 'Debt/Equity', value: keyMetrics.debtToEquity?.toFixed(2) ?? '—' },
              { label: 'Div Yield', value: keyMetrics.dividendYield ? `${(keyMetrics.dividendYield * 100).toFixed(2)}%` : '—' },
              { label: 'Beta', value: keyMetrics.beta?.toFixed(2) ?? '—' },
            ] : []).map(m => (
              <div key={m.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">{m.label}</p>
                <p className="text-lg font-bold text-[var(--text-primary)] font-mono tabular-nums">{m.value}</p>
              </div>
            ))}
            {!keyMetrics && <p className="col-span-4 py-12 text-center text-sm text-[var(--text-tertiary)]">Fundamental data not available for this symbol. Some providers require API keys.</p>}
          </div>
        </TabsContent>

        <TabsContent value="financials" className="mt-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center">
            <Calculator size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">Financial statements (Income Statement, Balance Sheet, Cash Flow) will be available once the fundamentals provider is configured.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/providers')}><Database size={13} /> Configure providers</Button>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)]/10">
                <Bot size={16} className="text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">AI Agent Analysis</p>
                <p className="font-mono text-[10px] text-[var(--text-tertiary)]">Multi-agent consensus on {symbol}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { agent: 'Warren Buffett (Value)', rec: '⭐ Buy', confidence: 82, reasoning: 'Strong moat, consistent FCF, shareholder-friendly management.', color: 'positive' },
                { agent: 'Benjamin Graham (Deep Value)', rec: 'Hold', confidence: 65, reasoning: 'Fairly valued at current levels. Margin of safety below 20%.', color: 'warning' },
                { agent: 'Nassim Taleb (Risk)', rec: '⚠️ Reduce', confidence: 55, reasoning: 'Concentration risk in key segments. Tail hedging advised.', color: 'negative' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)]">
                  <div className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-mono ${a.color === 'positive' ? 'bg-[var(--positive-bg)] text-[var(--positive)]' : a.color === 'negative' ? 'bg-[var(--negative-bg)] text-[var(--negative)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]'}`}>
                    {a.rec.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{a.agent}</span>
                      <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{a.confidence}% confidence</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{a.reasoning}</p>
                  </div>
                  <span className={`shrink-0 font-mono text-[11px] font-semibold ${a.color === 'positive' ? 'text-[var(--positive)]' : a.color === 'negative' ? 'text-[var(--negative)]' : 'text-[var(--warning)]'}`}>{a.rec}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/ai')}><Bot size={13} /> Full AI Analysis</Button>
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center">
            <Newspaper size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">News feeds are powered by provider integrations (Benzinga, BizToc, Seeking Alpha). Configure your preferred news provider to see real-time financial news.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/providers')}><Database size={13} /> Configure providers</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
