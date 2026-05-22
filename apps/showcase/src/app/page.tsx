'use client';

import Link from 'next/link';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@openmoney/ui';
import { Sparkles, Palette, Component, ArrowRight, Layers } from 'lucide-react';

const stats = [
  { label: 'UI Components', value: '51', desc: 'shadcn/ui-based primitives', icon: Component },
  { label: 'Domain Components', value: '22', desc: 'Finance-specific widgets', icon: Layers },
  { label: 'Design Tokens', value: '40+', desc: 'Colors, type, spacing, shadows', icon: Palette },
  { label: 'Categories', value: '7', desc: 'Organized for discovery', icon: Layers },
];

const principles = [
  { title: 'Precision', desc: 'Tight radii, monospaced numbers, flat data containers. Every pixel serves the data.' },
  { title: 'Dark-first', desc: 'Built for low-light trading environments. Dark mode is the default, not an afterthought.' },
  { title: 'Data-driven', desc: 'Metrics lead. Labels follow. Numbers are the hero — everything else is supporting cast.' },
];

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-24">
          <Badge variant="brand" className="mb-4 text-xs font-mono">v0.0.1 · Design System</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            OpenMoney
            <span className="block text-brand mt-1">Component Library</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            A precision-crafted design system for quantitative investment platforms.
            Modern AI-product aesthetic. Glass surfaces. Emerald brand. Dark native.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/components">
              <Button variant="brand" size="lg">
                <Component size={16} /> Browse Components
              </Button>
            </Link>
            <Link href="/tokens">
              <Button variant="outline" size="lg">
                <Palette size={16} /> Design Tokens
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent mb-3 group-hover:scale-105 transition-transform">
                    <Icon size={18} className="text-accent-foreground" />
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums">{stat.value}</p>
                  <p className="text-sm font-medium mt-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-14">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <Sparkles size={18} className="text-brand" /> Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { href: '/components', title: 'Browse Components', desc: 'Explore all 73 components with live previews and code samples.' },
              { href: '/tokens', title: 'Design Tokens', desc: 'Color palette, typography scale, spacing system, border radii.' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="no-underline group">
                <Card className="h-full group-hover:border-brand/30 transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="text-sm">{link.title}</CardTitle>
                    <CardDescription>{link.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={12} />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-4xl mx-auto px-8 py-14">
        <h2 className="text-lg font-semibold mb-5">Design Principles</h2>
        <div className="grid grid-cols-3 gap-4">
          {principles.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 hover:border-border-hover transition-colors">
              <p className="text-sm font-semibold text-brand mb-2">{p.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
