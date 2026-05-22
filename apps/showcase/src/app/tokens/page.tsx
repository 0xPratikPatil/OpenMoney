'use client';

import { Badge } from '@openmoney/ui';

const colorGroups = [
  {
    label: 'BACKGROUNDS',
    colors: [
      { name: 'Background', token: '--background', value: '#080808' },
      { name: 'Panel', token: '--background-panel', value: '#0f0f0f' },
      { name: 'Elevated', token: '--background-elevated', value: '#141414' },
      { name: 'Input', token: '--background-input', value: '#111111' },
      { name: 'Subtle', token: '--background-subtle', value: '#1a1a1a' },
    ],
  },
  {
    label: 'TEXT',
    colors: [
      { name: 'Primary', token: '--text-primary', value: '#f0f0f0' },
      { name: 'Secondary', token: '--text-secondary', value: '#888888' },
      { name: 'Tertiary', token: '--text-tertiary', value: '#555555' },
      { name: 'Inverse', token: '--text-inverse', value: '#080808' },
    ],
  },
  {
    label: 'ACCENT — LIME',
    colors: [
      { name: 'Brand', token: '--brand', value: '#b8f73a' },
      { name: 'Brand Dim', token: '--brand-dim', value: '#1e2a0a' },
      { name: 'Brand Border', token: '--brand-border', value: '#3d5a10' },
      { name: 'Brand Hover', token: '--brand-hover', value: '#ceff5a' },
    ],
  },
  {
    label: 'SEMANTIC',
    colors: [
      { name: 'Positive', token: '--positive', value: '#4caf7d' },
      { name: 'Negative', token: '--negative', value: '#e05c5c' },
      { name: 'Warning', token: '--warning', value: '#e8a13a' },
      { name: 'Info', token: '--info', value: '#5b8def' },
    ],
  },
  {
    label: 'BORDERS',
    colors: [
      { name: 'Default', token: '--border', value: '#242424' },
      { name: 'Strong', token: '--border-strong', value: '#333333' },
      { name: 'Subtle', token: '--border-subtle', value: '#1c1c1c' },
    ],
  },
];

const typeScale = [
  { token: '2xs', size: '10px', weight: '500', tracking: '0.08em', usage: 'Column headers, ultra-compact labels' },
  { token: 'xs', size: '11px', weight: '500', tracking: '0.04em', usage: 'Labels, metadata, timestamps' },
  { token: 'sm', size: '12px', weight: '400', tracking: 'normal', usage: 'Body text, table cells' },
  { token: 'base', size: '13px', weight: '400', tracking: 'normal', usage: 'Default body, inputs' },
  { token: 'lg', size: '16px', weight: '500', tracking: 'normal', usage: 'Section headings' },
  { token: 'xl', size: '20px', weight: '600', tracking: 'normal', usage: 'Page titles' },
  { token: '4xl', size: '48px', weight: '600', tracking: '-0.02em', usage: 'Hero metrics' },
  { token: 'hero', size: '72px', weight: '700', tracking: '-0.03em', usage: 'Display, landing page' },
];

const radii = [
  { token: 'sm', value: '3px', usage: 'Inputs, small buttons, badges' },
  { token: 'md', value: '6px', usage: 'Cards, panels, default' },
  { token: 'lg', value: '10px', usage: 'Modals, large containers' },
  { token: 'pill', value: '999px', usage: 'Pills, status indicators' },
];

function ColorSwatch({ color }: { color: { name: string; token: string; value: string } }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-[var(--radius-sm)] hover:bg-secondary transition-colors">
      <div className="w-10 h-10 rounded-[var(--radius-sm)] border border-border shrink-0" style={{ backgroundColor: color.value }} />
      <div className="min-w-0">
        <p className="font-sans text-sm font-medium">{color.name}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{color.token}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{color.value}</p>
      </div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-10">
        <Badge variant="brand" className="mb-3 font-mono">ARKON · Design Reference</Badge>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Design Tokens</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Terminal-grade color system, type scale, and spacing for ARKON.</p>
      </div>

      {/* Colors */}
      <section className="mb-14">
        <h2 className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-5">COLOR PALETTE</h2>
        <div className="space-y-8">
          {colorGroups.map((group) => (
            <div key={group.label}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-3">{group.label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {group.colors.map((color) => <ColorSwatch key={color.name} color={color} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-border my-12" />

      {/* Typography */}
      <section className="mb-14">
        <h2 className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-5">TYPOGRAPHY</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-[var(--radius-md)] p-5">
            <p className="font-mono text-[10px] text-muted-foreground mb-1">UI FONT</p>
            <p className="font-sans text-lg font-semibold">Geist</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">Body, headings, navigation</p>
          </div>
          <div className="bg-card border border-border rounded-[var(--radius-md)] p-5">
            <p className="font-mono text-[10px] text-muted-foreground mb-1">DATA FONT</p>
            <p className="font-mono text-lg font-semibold">Geist Mono</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">Numbers, IDs, timestamps, prices</p>
          </div>
        </div>

        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-4">TYPE SCALE</p>
        <div className="bg-card border border-border rounded-[var(--radius-md)] overflow-hidden">
          {typeScale.map((t, i) => (
            <div key={t.token} className={`flex items-center gap-6 px-4 py-3 ${i < typeScale.length - 1 ? 'border-b border-border' : ''} hover:bg-elevated transition-colors`}>
              <div className="w-10"><p className="font-mono text-[10px] text-muted-foreground">{t.token}</p></div>
              <div className="w-20"><p className="font-mono text-[10px] text-muted-foreground">{t.size}/{t.weight}</p></div>
              <div className="w-16"><p className="font-mono text-[10px] text-muted-foreground">{t.tracking}</p></div>
              <div className="flex-1"><p style={{ fontSize: t.size, fontWeight: t.weight as any, letterSpacing: t.tracking }}>The quick brown fox.</p></div>
              <div className="w-40 text-right"><p className="font-mono text-[10px] text-muted-foreground">{t.usage}</p></div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-border my-12" />

      {/* Radius + Typography Rules */}
      <div className="grid grid-cols-2 gap-8">
        <section>
          <h2 className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-5">BORDER RADIUS</h2>
          <div className="flex flex-wrap gap-4">
            {radii.map((r) => (
              <div key={r.token} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 border border-border bg-card flex items-center justify-center" style={{ borderRadius: r.value }}>
                  <span className="font-mono text-[9px] text-muted-foreground">{r.token}</span>
                </div>
                <p className="font-mono text-[9px] text-muted-foreground">{r.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground mb-5">TYPOGRAPHY RULES</h2>
          <div className="space-y-3">
            {[
              'Numbers are always mono — every price, %, timestamp',
              'Meta labels are always uppercase tracking-widest',
              'Size hierarchy is dramatic: hero 72px, labels 10px',
              'Delta values use sign + color (green/red)',
              'Never use font-weight below 400 in dark mode',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-accent-foreground mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <p className="font-sans text-xs text-muted-foreground">{rule}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
