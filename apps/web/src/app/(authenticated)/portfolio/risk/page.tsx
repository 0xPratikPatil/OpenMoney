'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { api, type RiskMetrics } from '@/lib/api';
import { Button, Skeleton, Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from '@openmoney/ui';
import { ShieldAlert, TrendingDown, Activity, BarChart3, AlertTriangle, RefreshCw, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface RiskDisplay {
  label: string; value: string; color: 'positive' | 'negative' | 'warning' | 'neutral';
  description: string;
}

function fmtPct(v: number) { return `${(v * 100).toFixed(2)}%`; }

export default function RiskAnalyticsPage() {
  const [risk, setRisk] = React.useState<RiskMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const portfoliosRes = await api.portfolios.list();
        if (portfoliosRes.success && portfoliosRes.data.length > 0) {
          const pId = portfoliosRes.data[0].id;
          const riskRes = await api.portfolios.risk(pId);
          if (riskRes.success) setRisk(riskRes.data);
        }
      } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      <div className="grid grid-cols-2 gap-4"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
    </div>
  );

  if (error || !risk) return (
    <div className="p-6 max-w-7xl mx-auto">
      <EmptyState icon={ShieldAlert} title="Risk Analytics Unavailable" description="Create a portfolio with positions to view risk metrics." action={{ label: 'Create Portfolio', onClick: () => window.location.href = '/portfolio' }} />
    </div>
  );

  const metrics: RiskDisplay[] = [
    { label: 'VaR (95%, 1-Day)', value: fmtPct(risk.portfolioVaR95), color: Math.abs(risk.portfolioVaR95) > 0.03 ? 'negative' : 'warning', description: 'Maximum expected loss at 95% confidence over 1 trading day' },
    { label: 'VaR (99%, 1-Day)', value: fmtPct(risk.portfolioVaR99), color: Math.abs(risk.portfolioVaR99) > 0.04 ? 'negative' : 'warning', description: 'Maximum expected loss at 99% confidence over 1 trading day' },
    { label: 'CVaR (95%)', value: fmtPct(risk.portfolioCVaR95), color: 'negative', description: 'Expected loss beyond VaR threshold (tail risk)' },
    { label: 'Sharpe Ratio', value: risk.sharpeRatio.toFixed(2), color: risk.sharpeRatio > 1 ? 'positive' : risk.sharpeRatio > 0.5 ? 'warning' : 'negative', description: 'Risk-adjusted return (risk-free rate: 5%)' },
    { label: 'Sortino Ratio', value: risk.sortinoRatio.toFixed(2), color: risk.sortinoRatio > 1.5 ? 'positive' : risk.sortinoRatio > 0.75 ? 'warning' : 'negative', description: 'Downside risk-adjusted return' },
    { label: 'Max Drawdown', value: fmtPct(risk.maxDrawdown), color: Math.abs(risk.maxDrawdown) > 0.15 ? 'negative' : Math.abs(risk.maxDrawdown) > 0.08 ? 'warning' : 'neutral', description: 'Peak-to-trough decline' },
    { label: 'Beta', value: risk.beta?.toFixed(2) ?? '—', color: (risk.beta ?? 0) > 1.3 ? 'warning' : 'neutral', description: 'Market sensitivity vs S&P 500' },
    { label: 'As Of', value: new Date(risk.asOfDate).toLocaleDateString(), color: 'neutral', description: 'Last computation date' },
  ];

  const colorToClass = (c: string) => c === 'positive' ? 'text-[var(--positive)] bg-[var(--positive-bg)]' : c === 'negative' ? 'text-[var(--negative)] bg-[var(--negative-bg)]' : c === 'warning' ? 'text-[var(--warning)] bg-[var(--warning-bg)]' : 'text-[var(--text-primary)] bg-[var(--surface-2)]';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><ShieldAlert size={18} /> Risk Analytics</h1>
          <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">Portfolio-level risk decomposition · Last updated {new Date(risk.asOfDate).toLocaleString()}</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw size={13} /> Refresh</Button>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {metrics.map(m => (
          <div key={m.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-strong)] transition-colors">
            <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">{m.label}</p>
            <p className={`text-2xl font-bold font-mono tabular-nums ${colorToClass(m.color).split(' ')[0]}`}>{m.value}</p>
            <p className="mt-2 text-[11px] text-[var(--text-tertiary)] leading-tight">{m.description}</p>
          </div>
        ))}
      </div>

      {/* Risk Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Position Risk Contribution</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {risk.positionRiskContributions.length > 0 ? (
              risk.positionRiskContributions.map(c => (
                <div key={c.ticker} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)]">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[var(--surface-2)]">
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{c.ticker}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[var(--text-primary)]">Component VaR: {fmtPct(c.componentVaR)}</span>
                      <span className="font-mono text-[10px] text-[var(--text-tertiary)]">Marginal: {fmtPct(c.marginalVaR)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--negative)]" style={{ width: `${Math.min(Math.abs(c.componentVaR * 800), 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No position risk data available. Add positions to view contribution.</p>
            )}
          </CardContent>
        </Card>

        {/* Correlation Matrix */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Correlation Matrix</CardTitle></CardHeader>
          <CardContent>
            {risk.correlationMatrix.length > 1 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="font-mono text-[9px] text-[var(--text-tertiary)] text-left p-2"></th>
                      {risk.correlationMatrix.map(c => <th key={c.ticker} className="font-mono text-[9px] text-[var(--text-tertiary)] p-2 text-center">{c.ticker}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {risk.correlationMatrix.map((row, i) => (
                      <tr key={row.ticker}>
                        <td className="font-mono text-[11px] font-semibold text-[var(--text-primary)] p-2">{row.ticker}</td>
                        {risk.correlationMatrix.map((col, j) => {
                          const val = row.correlations[col.ticker] ?? 0;
                          const absVal = Math.abs(val);
                          return (
                            <td key={`${i}-${j}`} className="p-2 text-center">
                              <div className={`inline-flex items-center justify-center w-9 h-9 rounded text-[10px] font-mono font-medium tabular-nums ${absVal > 0.7 ? 'bg-[var(--warning-bg)] text-[var(--warning)]' : absVal > 0.3 ? 'bg-[var(--surface-2)] text-[var(--text-primary)]' : 'bg-transparent text-[var(--text-tertiary)]'}`}>
                                {i === j ? '1.0' : val.toFixed(2)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-8">Add 2+ positions to view correlation matrix.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Gauge */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Risk Gauge</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative w-40 h-20 overflow-hidden">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                <path d="M20,90 A80,80 0 0,1 180,90" fill="none" stroke="var(--border)" strokeWidth="12" strokeLinecap="round" />
                <path d="M20,90 A80,80 0 0,1 100,10" fill="none" stroke="var(--positive)" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
                <path d="M100,10 A80,80 0 0,1 140,50" fill="none" stroke="var(--warning)" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
                <path d="M140,50 A80,80 0 0,1 180,90" fill="none" stroke="var(--negative)" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
                <circle cx={100 + 60 * Math.cos(Math.PI - Math.PI * 0.3)} cy={90 - 60 * Math.sin(Math.PI * 0.3)} r="5" fill="var(--foreground)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center"><p className="font-mono text-2xl font-bold text-[var(--warning)]">R3</p><p className="font-mono text-[8px] text-[var(--text-tertiary)]">MODERATE</p></div>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {['Low Risk (R1)', 'Moderate (R2)', 'Elevated (R3)', 'High (R4)', 'Critical (R5)'].map((level, i) => (
                <div key={level} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[var(--positive)]' : i === 1 ? 'bg-[var(--positive)]' : i === 2 ? 'bg-[var(--warning)]' : i === 3 ? 'bg-[var(--negative)]' : 'bg-[var(--negative)]'}`} />
                  <span className={`font-mono text-[11px] ${i === 2 ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-tertiary)]'}`}>{level}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
