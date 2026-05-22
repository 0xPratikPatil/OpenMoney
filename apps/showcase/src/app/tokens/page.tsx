'use client';

import { Badge } from '@openmoney/ui';

const colorGroups = [
  {
    label: 'BACKGROUNDS',
    colors: [
      { name: 'Background', token: '--background', value: 'oklch(0.145 0 0)' },
      { name: 'Card', token: '--card', value: 'oklch(0.145 0 0)' },
      { name: 'Muted', token: '--muted', value: 'oklch(0.205 0 0)' },
      { name: 'Accent', token: '--accent', value: 'oklch(0.269 0 0)' },
    ],
  },
  {
    label: 'TEXT',
    colors: [
      { name: 'Primary', token: '--foreground', value: 'oklch(0.93 0 0)' },
      { name: 'Muted', token: '--muted-foreground', value: 'oklch(0.708 0 0)' },
      { name: 'Tertiary', token: '--text-tertiary', value: 'oklch(0.556 0 0)' },
    ],
  },
  {
    label: 'BORDERS',
    colors: [
      { name: 'Default', token: '--border', value: 'oklch(0.205 0 0)' },
      { name: 'Input', token: '--input', value: 'oklch(0.205 0 0)' },
      { name: 'Ring', token: '--ring', value: 'oklch(0.708 0 0)' },
    ],
  },
  {
    label: 'SEMANTIC',
    colors: [
      { name: 'Primary', token: '--primary', value: 'oklch(0.93 0 0)' },
      { name: 'Secondary', token: '--secondary', value: 'oklch(0.269 0 0)' },
      { name: 'Destructive', token: '--destructive', value: 'oklch(0.577 0.245 27.325)' },
    ],
  },
  {
    label: 'CHART',
    colors: [
      { name: 'Chart 1', token: '--chart-1', value: 'oklch(0.488 0.243 264.376)' },
      { name: 'Chart 2', token: '--chart-2', value: 'oklch(0.696 0.17 162.48)' },
      { name: 'Chart 3', token: '--chart-3', value: 'oklch(0.769 0.188 70.08)' },
      { name: 'Chart 4', token: '--chart-4', value: 'oklch(0.627 0.265 303.9)' },
      { name: 'Chart 5', token: '--chart-5', value: 'oklch(0.645 0.246 16.439)' },
    ],
  },
];

const typeScale = [
  { token: 'H1', size: '2rem', weight: '600', tracking: '-0.02em', usage: 'Page titles' },
  { token: 'H2', size: '1.25rem', weight: '600', tracking: '-0.02em', usage: 'Section headings' },
  { token: 'Body', size: '0.875rem', weight: '400', tracking: 'normal', usage: 'Default text' },
  { token: 'Label', size: '11px', weight: '500', tracking: '0.04em', usage: 'Mono labels, uppercase' },
  { token: 'Code', size: '0.875rem', weight: '400', tracking: 'normal', usage: 'Mono, code blocks' },
  { token: 'Small', size: '0.75rem', weight: '400', tracking: 'normal', usage: 'Meta text, captions' },
];

const radii = [
  { token: 'sharp', value: '0', usage: 'Code blocks, inline callouts' },
  { token: 'sm', value: 'calc(var(--radius) - 2px)', usage: 'Inputs, small buttons' },
  { token: 'md', value: 'calc(var(--radius) - 1px)', usage: 'Buttons, badges' },
  { token: 'lg', value: 'var(--radius)', usage: 'Cards, default' },
  { token: 'xl', value: 'calc(var(--radius) + 4px)', usage: 'Modals, panels' },
];

function ColorSwatch({ color }: { color: { name: string; token: string; value: string } }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
      <div className="w-10 h-10 rounded-md border border-border shrink-0" style={{ backgroundColor: color.value }} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{color.name}</p>
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
        <Badge variant="secondary" className="mb-3 font-mono">Design Reference</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Design Tokens</h1>
        <p className="text-sm text-muted-foreground mt-1">The tokens, components, and motifs that make up the OpenMoney visual language.</p>
      </div>

      {/* Colors */}
      <section className="mb-14">
        <h2 className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-5">COLOR PALETTE</h2>
        <p className="text-sm text-muted-foreground mb-6">The palette that makes up every surface in the product. Click a swatch to copy its hex.</p>
        <div className="space-y-8">
          {colorGroups.map((group) => (
            <div key={group.label}>
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-3">{group.label}</p>
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
        <h2 className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-5">TYPOGRAPHY</h2>
        <p className="text-sm text-muted-foreground mb-6">Geist for UI, Geist Mono for code and metadata.</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-md p-5">
            <p className="font-mono text-[10px] text-muted-foreground mb-1">UI FONT</p>
            <p className="text-lg font-semibold">Geist Sans</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">Body, headings, navigation</p>
          </div>
          <div className="bg-card border border-border rounded-md p-5">
            <p className="font-mono text-[10px] text-muted-foreground mb-1">DATA FONT</p>
            <p className="font-mono text-lg font-semibold">Geist Mono</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">Numbers, IDs, timestamps, prices</p>
          </div>
        </div>

        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-4">TYPE SCALE</p>
        <div className="bg-card border border-border rounded-md overflow-hidden">
          {typeScale.map((t, i) => (
            <div key={t.token} className={`flex items-center gap-6 px-4 py-3 ${i < typeScale.length - 1 ? 'border-b border-border' : ''} hover:bg-accent transition-colors`}>
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

      {/* Radius */}
      <section className="mb-14">
        <h2 className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-5">BORDER RADIUS</h2>
        <p className="text-sm text-muted-foreground mb-6">Base is 0.2rem — deliberately tight. Code blocks and inline callouts break to 0 for a sharper, more editorial feel.</p>
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

      <hr className="border-border my-12" />

      {/* Shadows */}
      <section>
        <h2 className="font-mono uppercase text-[10px] tracking-wider text-muted-foreground mb-5">SHADOWS</h2>
        <p className="text-sm text-muted-foreground mb-6">Shadows are used sparingly — only to lift interactive affordances. Code blocks and cards stay flat.</p>
        <div className="grid grid-cols-5 gap-3">
          {['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'].map((s) => (
            <div key={s} className="bg-card border border-border rounded-md p-4" style={{ boxShadow: `var(--${s})` }}>
              <p className="font-mono text-xs font-medium">{s}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
