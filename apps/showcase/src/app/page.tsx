'use client';

import Link from 'next/link';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@openmoney/ui';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity, BarChart3, Globe, Search, Plus } from 'lucide-react';

/* ── Section Header ── */
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted-foreground max-w-prose">{description}</p>}
    </div>
  );
}

/* ── Live Preview Card ── */
function LivePreview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="border border-foreground/10 rounded-md p-6">{children}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative border-b border-foreground/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid text-foreground/[0.04] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-8 py-24">
          <Badge variant="secondary" className="mb-4 font-mono">v0.0.1 · Design System</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Building blocks for
            <span className="block text-muted-foreground">financial intelligence</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed mt-4">
            Clean, modern building blocks for quantitative investment platforms. Copy and paste into your apps. Works with all React frameworks. Open Source.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/tokens"><Button>Browse Components</Button></Link>
            <Link href="/tokens"><Button variant="outline">Design Tokens</Button></Link>
          </div>
        </div>
      </section>

      {/* Featured Blocks */}
      <section className="border-b border-foreground/10">
        <div className="max-w-5xl mx-auto px-8 py-16 space-y-12">
          <SectionHeader title="Featured Blocks" description="Production-ready dashboard layouts and data displays." />

          {/* Dashboard Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dashboard with KPI cards and market data</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">npx openmoney add dashboard-01</p>
              </div>
              <Badge variant="outline" className="font-mono">dashboard-01</Badge>
            </div>
            <div className="border border-foreground/10 rounded-md overflow-hidden">
              <div className="bg-foreground/[0.02] p-6">
                {/* Dashboard Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'PORTFOLIO VALUE', value: '$2.4M', delta: '+3.2%', status: 'positive' as const },
                    { label: 'DAY P&L', value: '+$12.8K', delta: '+0.53%', status: 'positive' as const },
                    { label: 'VAR (95%)', value: '-2.34%', delta: '-0.8%', status: 'negative' as const },
                    { label: 'POSITIONS', value: '24', status: 'neutral' as const },
                  ].map((kpi) => (
                    <div key={kpi.label} className="border border-foreground/10 rounded-md p-3">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">{kpi.label}</p>
                      <p className="font-mono text-2xl font-semibold tabular-nums">{kpi.value}</p>
                      {kpi.delta && (
                        <span className={`inline-flex items-center gap-0.5 mt-1 font-mono text-[10px] ${kpi.status === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {kpi.status === 'positive' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {kpi.delta}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {/* Market Indices */}
                <div className="grid grid-cols-3 gap-3">
                  {['S&P 500', 'NASDAQ', 'DOW'].map((name) => (
                    <div key={name} className="border border-foreground/10 rounded-md p-3">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{name}</p>
                      <p className="font-mono text-base font-semibold tabular-nums mt-1">5,432.10</p>
                      <span className="inline-flex items-center gap-0.5 mt-1 font-mono text-[10px] text-emerald-500"><ArrowUpRight size={10} /> +1.2%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-foreground/10 px-4 py-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Dashboard with KPI cards, market indices, and risk metrics</span>
                <span className="text-[10px] font-mono text-muted-foreground">4 files</span>
              </div>
            </div>
          </div>

          {/* Screener Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Stock screener with data table</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">npx openmoney add screener-01</p>
              </div>
              <Badge variant="outline" className="font-mono">screener-01</Badge>
            </div>
            <div className="border border-foreground/10 rounded-md overflow-hidden">
              <div className="bg-foreground/[0.02] p-6">
                <div className="border border-foreground/10 rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/10">
                    <span className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground">MOST ACTIVE</span>
                    <span className="font-mono text-[10px] text-muted-foreground">25 results</span>
                  </div>
                  <div className="divide-y divide-foreground/5">
                    {[
                      { symbol: 'NVDA', name: 'NVIDIA Corp', price: '$219.51', change: '+2.4%', positive: true },
                      { symbol: 'AAPL', name: 'Apple Inc', price: '$304.99', change: '+1.1%', positive: true },
                      { symbol: 'TSLA', name: 'Tesla Inc', price: '$270.01', change: '-0.8%', positive: false },
                      { symbol: 'MSFT', name: 'Microsoft Corp', price: '$419.09', change: '+0.5%', positive: true },
                    ].map((row) => (
                      <div key={row.symbol} className="flex items-center gap-4 px-4 py-2.5 hover:bg-foreground/[0.03] transition-colors">
                        <span className="font-mono text-xs font-semibold w-12">{row.symbol}</span>
                        <span className="text-xs text-muted-foreground flex-1 truncate">{row.name}</span>
                        <span className="font-mono text-xs tabular-nums">{row.price}</span>
                        <span className={`font-mono text-[10px] tabular-nums ${row.positive ? 'text-emerald-500' : 'text-red-500'}`}>{row.change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-foreground/10 px-4 py-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Stock screener with sortable data table and status badges</span>
                <span className="text-[10px] font-mono text-muted-foreground">3 files</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Components Preview */}
      <section className="border-b border-foreground/10">
        <div className="max-w-5xl mx-auto px-8 py-16 space-y-8">
          <SectionHeader title="Components" description="Individual UI primitives and finance-specific components." />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'MetricCard', desc: 'KPI display with delta badge and sparkline', href: '/tokens#finance' },
              { name: 'DeltaBadge', desc: 'Signed percentage change with directional icon', href: '/tokens#finance' },
              { name: 'SparklineBar', desc: 'Tick-mark bar chart for time series', href: '/tokens#finance' },
              { name: 'StatusBadge', desc: 'ACTIVE/COMPLETED/REVIEWING/FAILED pill', href: '/tokens#finance' },
              { name: 'SignalGauge', desc: 'Horizontal segmented gauge bar', href: '/tokens#finance' },
              { name: 'Callout', desc: 'Dashed left stripe by accent type', href: '/tokens#components' },
            ].map((comp) => (
              <Link key={comp.name} href={comp.href} className="no-underline group">
                <div className="border border-foreground/10 rounded-md p-4 hover:border-foreground/20 transition-colors">
                  <p className="text-sm font-medium font-mono">{comp.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{comp.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Design Tokens Preview */}
      <section className="border-b border-foreground/10">
        <div className="max-w-5xl mx-auto px-8 py-16 space-y-8">
          <SectionHeader title="Design Tokens" description="Color, typography, radius, and shadow foundations." />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-foreground/10 border border-foreground/10">
            {[
              { name: 'Background', css: 'var(--background)' },
              { name: 'Foreground', css: 'var(--foreground)' },
              { name: 'Primary', css: 'var(--primary)' },
              { name: 'Secondary', css: 'var(--secondary)' },
              { name: 'Muted', css: 'var(--muted)' },
              { name: 'Accent', css: 'var(--accent)' },
              { name: 'Destructive', css: 'var(--destructive)' },
              { name: 'Border', css: 'var(--border)' },
            ].map((t) => (
              <div key={t.name} className="bg-background p-2 space-y-1">
                <div className="h-10 w-full border border-foreground/10" style={{ backgroundColor: t.css }} />
                <p className="text-[10px] font-medium truncate">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>OpenMoney Design System · v0.0.1</span>
          <span className="font-mono">Built with shadcn/ui + better-auth theme</span>
        </div>
      </section>
    </div>
  );
}
