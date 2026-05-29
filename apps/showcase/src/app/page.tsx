'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Button, Badge,
  MetricCard, DeltaBadge, StatusBadge, TagChip, SparklineBar,
  cn,
} from '@openmoney/ui';
import {
  ArrowRight, Box, Palette, Component, LayoutDashboard, Search, Github,
  Layers, Zap, Command, BarChart3,
} from 'lucide-react';

/* ───────────────────────────────────────────────────────────────
   Homepage — editorial landing for the OpenMoney design system.
   Mirrors the tokens page: flat cards, opacity borders, monospace
   metadata, no shadows, no decorative motion.
   ─────────────────────────────────────────────────────────────── */

const sparkDummy = Array.from({ length: 20 }, () => Math.random());

export default function HomePage() {
  return (
    <div className="relative min-h-dvh">
      <Hero />
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-10 py-16 space-y-16">
        <Section id="blocks" eyebrow="01" title="What's inside">
          <FeaturedBlocks />
        </Section>

        <Section id="components" eyebrow="02" title="Component families">
          <ComponentsPreview />
        </Section>

        <Section id="tokens-section" eyebrow="03" title="Design tokens">
          <TokensPreview />
        </Section>

        <Section id="finance" eyebrow="04" title="Finance primitives">
          <FinancePreview />
        </Section>
      </div>
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ HERO ═══════════════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative border-b border-foreground/[0.06] overflow-hidden">
      <div className="absolute inset-0 bg-grid text-foreground/[0.04] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-10 py-24 md:py-32 text-center space-y-6">
        <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">
          OpenMoney Design System
        </p>
        <h1 className="text-3xl md:text-5xl tracking-tight leading-tight">
          Components for the
          <br />
          <span className="underline underline-offset-4 decoration-foreground/40">modern web</span>
        </h1>
        <p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed max-w-lg mx-auto">
          A dark-first, production-grade component library for building premium financial interfaces. Crafted with precision, accessibility, and developer experience in mind.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/tokens">
            <Button className="gap-2">
              <Palette size={16} />
              Design Tokens
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/tokens#components">
            <Button variant="outline" className="gap-2">
              <Component size={16} />
              Browse Components
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-4 pt-4 text-[10px] font-mono uppercase tracking-wider text-foreground/50">
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-foreground/40" />
            70+ components
          </span>
          <span className="text-foreground/25">·</span>
          <span className="flex items-center gap-1.5">
            <Layers size={12} className="text-foreground/40" />
            Dark-first
          </span>
          <span className="text-foreground/25">·</span>
          <span className="flex items-center gap-1.5">
            <Command size={12} className="text-foreground/40" />
            TypeScript
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════ SECTION ═══════════════════════════════════════════════════ */

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-8">
      <div className="flex items-baseline justify-between border-b border-foreground/10 pb-3">
        <h2 className="text-lg md:text-xl tracking-tight">{title}</h2>
        <span className="text-[11px] font-mono text-foreground/40">{eyebrow}</span>
      </div>
      <div className="space-y-10">{children}</div>
    </section>
  );
}

/* ════════════════════════════════════════════════ FEATURED BLOCKS ════════════════════════════════════════════════ */

function FeaturedBlocks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <DashboardPreview />
      <ScreenerPreview />
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="border border-foreground/10 rounded-md overflow-hidden">
      <div className="border-b border-foreground/10 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Dashboard</span>
        <span className="text-[10px] font-mono text-foreground/40">block</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-foreground/10 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/50">Portfolio Value</p>
            <p className="font-mono text-lg font-semibold tabular-nums mt-0.5">$2,412,391.27</p>
          </div>
          <div className="border border-foreground/10 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/50">Day P&L</p>
            <p className="font-mono text-lg font-semibold tabular-nums mt-0.5 text-green-500">+$12,841.53</p>
            <p className="text-[10px] font-mono text-foreground/50 mt-0.5">+0.53%</p>
          </div>
        </div>
        <div className="border border-foreground/10 p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/50 mb-2">Sparkline (20d)</p>
          <SparklineBar values={sparkDummy} status="positive" height={28} />
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="ACTIVE" />
          <TagChip label="EQUITY" active />
          <DeltaBadge value="+3.2%" status="positive" />
        </div>
      </div>
    </div>
  );
}

function ScreenerPreview() {
  return (
    <div className="border border-foreground/10 rounded-md overflow-hidden">
      <div className="border-b border-foreground/10 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Screener</span>
        <span className="text-[10px] font-mono text-foreground/40">block</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 border border-foreground/10 p-2">
          <Search size={14} className="text-foreground/40 shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-full bg-foreground/[0.06]" />
            <div className="h-3 w-3/4 bg-foreground/[0.03]" />
          </div>
        </div>
        <div className="border border-foreground/10 divide-y divide-foreground/10">
          {['AAPL', 'MSFT', 'GOOGL', 'NVDA'].map((sym) => (
            <div key={sym} className="flex items-center justify-between p-2.5 text-xs">
              <span className="font-mono font-medium">{sym}</span>
              <span className="font-mono text-foreground/70 tabular-nums">
                ${(Math.random() * 400 + 100).toFixed(2)}
              </span>
              <span className={cn(
                'font-mono text-[11px] tabular-nums',
                Math.random() > 0.4 ? 'text-green-500' : 'text-red-500',
              )}>
                {(Math.random() > 0.4 ? '+' : '-')}{(Math.random() * 5).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          <TagChip label="TECH" />
          <TagChip label="LARGE CAP" />
          <TagChip label="US" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ COMPONENT FAMILIES ═══════════════════════════════════════════════ */

const componentGroups = [
  {
    label: 'Foundations',
    href: '/tokens#foundations',
    desc: 'Color, typography, radius, and shadow tokens. Swatches, type scales, and spacing rules.',
    icon: Palette,
  },
  {
    label: 'Components',
    href: '/tokens#components',
    desc: 'Buttons, inputs, cards, callouts, tabs, badges, and alerts. Raw headless UI primitives.',
    icon: Component,
  },
  {
    label: 'Finance',
    href: '/tokens#finance',
    desc: 'Metric cards, delta badges, sparkline bars, signal gauges, and live indicators.',
    icon: BarChart3,
  },
  {
    label: 'Motifs',
    href: '/tokens#motifs',
    desc: 'Grid patterns, dot backgrounds, and subtle texture surfaces. Editorial texture toolkit.',
    icon: Box,
  },
  {
    label: 'Layout',
    href: '/tokens#components',
    desc: 'App shell, sidebar, top bar, and navigation. Skeleton for every screen in the app.',
    icon: LayoutDashboard,
  },
  {
    label: 'Voice',
    href: '/tokens#voice',
    desc: 'Tone principles: clear over clever, terse but warm. How OpenMoney communicates.',
    icon: Layers,
  },
];

function ComponentsPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {componentGroups.map((g) => (
        <Link key={g.label} href={g.href} className="no-underline group">
          <div className="border border-foreground/10 hover:border-foreground/20 transition-colors rounded-md p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <g.icon size={16} className="text-foreground/50 group-hover:text-foreground/80 transition-colors" />
              <span className="text-[11px] font-medium">{g.label}</span>
            </div>
            <p className="text-[13px] text-foreground/60 leading-relaxed">{g.desc}</p>
            <p className="text-[10px] font-mono text-foreground/40 mt-3 group-hover:text-foreground/60 transition-colors">
              {g.href}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════ TOKENS PREVIEW ════════════════════════════════════════════════ */

const colorTokens = [
  { name: 'background', label: 'Background' },
  { name: 'foreground', label: 'Foreground' },
  { name: 'primary', label: 'Primary' },
  { name: 'primary-foreground', label: 'Primary FG' },
  { name: 'secondary', label: 'Secondary' },
  { name: 'secondary-foreground', label: 'Secondary FG' },
  { name: 'muted', label: 'Muted' },
  { name: 'muted-foreground', label: 'Muted FG' },
  { name: 'accent', label: 'Accent' },
  { name: 'accent-foreground', label: 'Accent FG' },
  { name: 'border', label: 'Border' },
  { name: 'input', label: 'Input' },
  { name: 'ring', label: 'Ring' },
  { name: 'destructive', label: 'Destructive' },
] as const;

function TokensPreview() {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-foreground/50 leading-relaxed max-w-prose">
        The palette that makes up every surface in the product. Each token resolves from an oklch CSS variable.
      </p>

      {/* Swatch gallery — exact same pattern as tokens page */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10">
        {colorTokens.map((t) => (
          <div key={t.name} className="bg-background p-3 space-y-2">
            <div className="h-14 w-full border border-foreground/10" style={{ backgroundColor: `var(--${t.name})` }} />
            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-medium">{t.label}</p>
                <p className="text-[10px] font-mono text-foreground/60">&#x2014;</p>
              </div>
              <p className="text-[10px] font-mono text-foreground/45">--{t.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">
          14 core tokens &#x00B7; oklch color space
        </p>
        <Link href="/tokens#foundations" className="text-[11px] font-mono text-foreground/50 hover:text-foreground/80 transition-colors no-underline">
          view all <ArrowRight size={12} className="inline ml-0.5" />
        </Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════ FINANCE PREVIEW ════════════════════════════════════════════════ */

function FinancePreview() {
  return (
    <div className="space-y-6">
      <p className="text-[13px] text-foreground/50 leading-relaxed max-w-prose">
        Domain-specific components for financial data display. Semantic coloring, monospace data, and real-time indicators.
      </p>

      {/* Metric Cards */}
      <div>
        <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Metric Cards</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="PORTFOLIO VALUE" value="$2.4M" status="neutral" sparkline={sparkDummy} accent />
          <MetricCard label="DAY P&L" value="+$12.8K" delta="+0.53%" status="positive" sparkline={sparkDummy.map(v => v * 1.3)} />
          <MetricCard label="VAR (95%)" value="-2.34%" delta="-0.8%" status="negative" />
          <MetricCard label="POSITIONS" value="24" status="neutral" />
        </div>
      </div>

      {/* Badges and chips */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Delta &amp; Status</p>
          <div className="flex flex-wrap gap-2">
            <DeltaBadge value="+2.4%" status="positive" />
            <DeltaBadge value="-1.8%" status="negative" />
            <DeltaBadge value="0.0%" status="neutral" />
            <StatusBadge status="ACTIVE" />
            <StatusBadge status="PENDING" />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            <TagChip label="EQUITY" active />
            <TagChip label="CRYPTO" />
            <TagChip label="ETF" />
            <TagChip label="FOREX" />
            <TagChip label="OPTIONS" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">
          Domain components &#x00B7; built on motion/react
        </p>
        <Link href="/tokens#finance" className="text-[11px] font-mono text-foreground/50 hover:text-foreground/80 transition-colors no-underline">
          explore all <ArrowRight size={12} className="inline ml-0.5" />
        </Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════ FOOTER ════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="border-t border-foreground/[0.06]">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium">OpenMoney</span>
          <Badge variant="outline" className="font-mono text-[10px]">v0.1.0</Badge>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">
            Dark-first &#x00B7; TypeScript &#x00B7; Tailwind &#x00B7; React
          </p>
          <div className="flex items-center gap-3">
            <Link href="https://github.com/your-org/openmoney" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground/70 transition-colors">
              <Github size={14} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
