'use client';

import Link from 'next/link';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription, SparklineBar, DeltaBadge, MetricCard, StatusBadge, LiveIndicator, SignalGauge, PriorityBadge, TagChip } from '@openmoney/ui';
import { Palette, Component, ArrowRight, Layers, Activity } from 'lucide-react';

const stats = [
  { label: 'UI Components', value: '51', desc: 'shadcn/ui primitives' },
  { label: 'ARKON Components', value: '10+', desc: 'Finance-specific' },
  { label: 'Design Tokens', value: '40+', desc: 'Colors, type, radius' },
  { label: 'Categories', value: '7', desc: 'Organized for discovery' },
];

export default function HomePage() {
  const sparkData = Array.from({length: 20}, () => Math.random());

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-20">
          <Badge variant="brand" className="mb-4 font-mono">ARKON · Design System v1.0</Badge>
          <h1 className="font-sans text-hero font-semibold tracking-tight mb-3" style={{fontSize:'48px',lineHeight:'52px',letterSpacing:'-0.03em'}}>
            Terminal-grade
            <span className="block text-accent-foreground mt-1">finance platform</span>
          </h1>
          <p className="font-sans text-sm text-muted-foreground max-w-lg leading-relaxed mt-4">
            Built for users who think in data — investors, founders, analysts, and power users who want financial intelligence that feels like infrastructure, not a banking app.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/components"><Button variant="default"><Component size={15} /> Browse Components</Button></Link>
            <Link href="/tokens"><Button variant="outline"><Palette size={15} /> Design Tokens</Button></Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-semibold tabular-nums">{stat.value}</p>
                <p className="font-sans text-sm font-medium mt-1">{stat.label}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Component Preview */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h2 className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-6">LIVE COMPONENT PREVIEW</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MetricCard label="PORTFOLIO VALUE" value="$2.4M" delta="+3.2%" status="positive" sparkline={sparkData} accent />
            <MetricCard label="DAY P&L" value="+$12.8K" delta="+0.53%" status="positive" sparkline={sparkData.map(v => v * 1.3)} />
            <MetricCard label="VAR (95%)" value="-2.34%" delta="-0.8%" status="negative" />
            <MetricCard label="POSITIONS" value="24" status="neutral" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div><p className="font-mono text-[10px] text-muted-foreground mb-2">DELTA BADGES</p><div className="flex gap-2"><DeltaBadge value="+2.4%" status="positive" /><DeltaBadge value="-1.8%" status="negative" /><DeltaBadge value="0.0%" status="neutral" /></div></div>
            <div><p className="font-mono text-[10px] text-muted-foreground mb-2">STATUS BADGES</p><div className="flex gap-2 flex-wrap"><StatusBadge status="ACTIVE" /><StatusBadge status="REVIEWING" /><StatusBadge status="FAILED" /></div></div>
            <div><p className="font-mono text-[10px] text-muted-foreground mb-2">PRIORITY</p><div className="flex gap-2"><PriorityBadge priority="HIGH" /><PriorityBadge priority="MEDIUM" /><PriorityBadge priority="LOW" /></div></div>
            <div><p className="font-mono text-[10px] text-muted-foreground mb-2">TAGS</p><div className="flex gap-1.5 flex-wrap"><TagChip label="EQUITY" active /><TagChip label="CRYPTO" /><TagChip label="ETF" /></div></div>
          </div>

          <div className="bg-[var(--background-panel)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 mb-4">
            <p className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-3">SIGNAL GAUGE</p>
            <SignalGauge value={72} segments={40} />
          </div>

          <div className="flex items-center gap-4">
            <LiveIndicator label="LIVE" />
            <LiveIndicator label="CONNECTED" />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h2 className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-6">EXPLORE</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/components', title: 'Browse Components', desc: 'All 73 components with live previews and code samples.' },
              { href: '/tokens', title: 'Design Tokens', desc: 'Color palette, typography scale, spacing, border radii, shadows.' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="no-underline group">
                <Card className="h-full group-hover:border-[var(--border-strong)] transition-colors">
                  <CardHeader>
                    <CardTitle>{link.title}</CardTitle>
                    <CardDescription>{link.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-accent-foreground uppercase tracking-wider group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={11} />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-6">DESIGN PRINCIPLES</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: 'Precision', desc: 'Tight radii, mono for numbers, flat data containers. Every pixel earns its place.' },
            { title: 'Density', desc: 'Information is the design. We respect the user\'s intelligence with dense, data-rich layouts.' },
            { title: 'Monochromatic', desc: 'Color means something here. The lime accent is reserved for primary actions and positive signals.' },
          ].map((p) => (
            <div key={p.title} className="bg-[var(--background-panel)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 hover:border-[var(--border-strong)] transition-colors">
              <p className="font-mono text-[11px] text-accent-foreground mb-2 uppercase tracking-wider">{p.title}</p>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
