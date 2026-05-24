'use client';

import Link from 'next/link';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@openmoney/ui';
import { Palette, Component, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'UI Components', value: '51', desc: 'shadcn/ui primitives' },
  { label: 'Domain Components', value: '10+', desc: 'Finance-specific' },
  { label: 'Design Tokens', value: '40+', desc: 'Colors, type, radius' },
  { label: 'Categories', value: '7', desc: 'Organized for discovery' },
];

export default function HomePage() {
  return (
    <div className="min-h-full">
      <section className="border-b border-foreground/10 bg-grid text-foreground/10">
        <div className="max-w-4xl mx-auto px-8 py-20">
          <Badge variant="secondary" className="mb-4 font-mono">v0.0.1 · Design System</Badge>
          <h1 className="text-4xl font-semibold tracking-tight mb-3" style={{lineHeight:'1.1'}}>
            Terminal-grade
            <span className="block text-muted-foreground mt-1">finance platform</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed mt-4">
            Built for users who think in data — investors, founders, analysts, and power users who want financial intelligence that feels like infrastructure, not a banking app.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/components"><Button><Component size={15} /> Browse Components</Button></Link>
            <Link href="/tokens"><Button variant="outline"><Palette size={15} /> Design Tokens</Button></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-semibold tabular-nums">{stat.value}</p>
                <p className="text-sm font-medium mt-1">{stat.label}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h2 className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-6">EXPLORE</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/components', title: 'Browse Components', desc: 'All 73 components with live previews and code samples.' },
              { href: '/tokens', title: 'Design Tokens', desc: 'Color palette, typography scale, spacing, border radii, shadows.' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="no-underline group">
                <Card className="h-full group-hover:border-foreground/20 transition-colors">
                  <CardHeader>
                    <CardTitle>{link.title}</CardTitle>
                    <CardDescription>{link.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-foreground uppercase tracking-wider group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={11} />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-6">DESIGN PRINCIPLES</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: 'Precision', desc: 'Tight radii, mono for numbers, flat data containers. Every pixel earns its place.' },
            { title: 'Density', desc: "Information is the design. We respect the user's intelligence with dense, data-rich layouts." },
            { title: 'Sharp, not loud', desc: 'Minimal radii, dashed dividers, mono for metadata. The design should feel precise, never decorative.' },
          ].map((p) => (
            <div key={p.title} className="border border-foreground/10 rounded-md p-5 hover:border-foreground/20 transition-colors">
              <p className="font-mono text-[11px] text-foreground mb-2 uppercase tracking-wider">{p.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
