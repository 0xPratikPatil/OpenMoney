'use client';

import { Badge, Separator } from '@openmoney/ui';

const colorGroups = [
  {
    label: 'Surface Hierarchy',
    colors: [
      { name: 'Background', token: '--background', value: '#09090B' },
      { name: 'Surface', token: '--surface', value: '#0F0F13' },
      { name: 'Surface Elevated', token: '--surface-elevated', value: '#16161B' },
      { name: 'Surface Overlay', token: '--surface-overlay', value: '#1C1C24' },
    ],
  },
  {
    label: 'Text',
    colors: [
      { name: 'Primary', token: '--text-primary', value: '#FAFAFA' },
      { name: 'Secondary', token: '--text-secondary', value: '#A1A1AA' },
      { name: 'Tertiary', token: '--text-tertiary', value: '#71717A' },
    ],
  },
  {
    label: 'Brand — Emerald',
    colors: [
      { name: 'Brand', token: '--brand', value: '#10B981' },
      { name: 'Brand Muted', token: '--brand-muted', value: 'rgba(16,185,129,0.12)' },
      { name: 'Brand Glow', token: '--brand-glow', value: 'rgba(16,185,129,0.08)' },
    ],
  },
  {
    label: 'Semantic',
    colors: [
      { name: 'Success', token: '--success', value: '#22C55E' },
      { name: 'Destructive', token: '--destructive', value: '#EF4444' },
      { name: 'Warning', token: '--warning', value: '#F59E0B' },
      { name: 'Info', token: '--info', value: '#3B82F6' },
    ],
  },
  {
    label: 'Borders & Glass',
    colors: [
      { name: 'Border', token: '--border', value: 'rgba(255,255,255,0.06)' },
      { name: 'Border Hover', token: '--border-hover', value: 'rgba(255,255,255,0.1)' },
      { name: 'Glass BG', token: '--glass-bg', value: 'rgba(22,22,27,0.8)' },
      { name: 'Glass Blur', token: '--glass-blur', value: '20px' },
    ],
  },
];

const typeScale = [
  { token: 'xs', size: '11px', weight: '500', usage: 'Labels, metadata, captions' },
  { token: 'sm', size: '13px', weight: '400', usage: 'Body text, table cells' },
  { token: 'base', size: '15px', weight: '400', usage: 'Default body' },
  { token: 'lg', size: '18px', weight: '600', usage: 'Section headings' },
  { token: 'xl', size: '22px', weight: '700', usage: 'Card titles, panel headers' },
  { token: '2xl', size: '28px', weight: '700', usage: 'Page titles' },
  { token: '3xl', size: '34px', weight: '700', usage: 'Hero metrics' },
];

const radii = [
  { token: 'xs', value: '0.375rem', usage: 'Small inputs, checkboxes' },
  { token: 'sm', value: '0.5rem', usage: 'Badges, small pills' },
  { token: 'md', value: '0.75rem', usage: 'Default — buttons, inputs' },
  { token: 'lg', value: '0.875rem', usage: 'Cards, panels' },
  { token: 'xl', value: '1.25rem', usage: 'Modals, large cards' },
];

const shadows = [
  { token: 'xs', desc: 'Subtle elevation' },
  { token: 'sm', desc: 'Card default' },
  { token: 'md', desc: 'Card hover' },
  { token: 'lg', desc: 'Popover, dropdown' },
  { token: 'xl', desc: 'Modal, dialog' },
  { token: 'glow', desc: 'Brand accent glow' },
];

function ColorSwatch({ color }: { color: { name: string; token: string; value: string } }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
      <div className="w-10 h-10 rounded-xl border border-border shrink-0 shadow-sm" style={{ backgroundColor: color.value }} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{color.name}</p>
        <p className="text-[11px] font-mono text-muted-foreground">{color.token}</p>
        <p className="text-[11px] font-mono text-muted-foreground">{color.value}</p>
      </div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-10">
        <Badge variant="brand" className="text-xs font-mono mb-3">Design Reference</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Design Tokens</h1>
        <p className="text-sm text-muted-foreground mt-1">The visual foundations of OpenMoney — modern AI-product aesthetic.</p>
      </div>

      {/* Colors */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold mb-5">Color Palette</h2>
        <div className="space-y-8">
          {colorGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">{group.label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {group.colors.map((color) => <ColorSwatch key={color.name} color={color} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Typography */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold mb-5">Typography</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { font: 'Inter', usage: 'UI font', sample: 'The quick brown fox jumps over the lazy dog.', className: 'font-sans' },
            { font: 'JetBrains Mono', usage: 'Data / Code font', sample: 'AAPL 304.99 +2.34% vol 42M', className: 'font-mono' },
          ].map((f) => (
            <div key={f.font} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground mb-1">{f.usage}</p>
              <p className="text-base font-semibold mb-2">{f.font}</p>
              <p className={`text-sm ${f.className}`}>{f.sample}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Type Scale</p>
        <div className="rounded-2xl border border-border overflow-hidden">
          {typeScale.map((t, i) => (
            <div key={t.token} className={`flex items-center gap-6 px-5 py-3.5 ${i < typeScale.length - 1 ? 'border-b border-border' : ''} hover:bg-secondary/50 transition-colors`}>
              <div className="w-12"><p className="text-xs font-mono text-muted-foreground">{t.token}</p></div>
              <div className="w-24"><p className="text-xs font-mono text-muted-foreground">{t.size} / {t.weight}</p></div>
              <div className="flex-1"><p style={{ fontSize: t.size, fontWeight: t.weight as any }}>The quick brown fox.</p></div>
              <div className="w-40 text-right"><p className="text-xs text-muted-foreground">{t.usage}</p></div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Radii + Shadows */}
      <div className="grid grid-cols-2 gap-8 mb-14">
        <section>
          <h2 className="text-lg font-semibold mb-5">Border Radius</h2>
          <div className="flex flex-wrap gap-4">
            {radii.map((r) => (
              <div key={r.token} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-lg border border-border bg-card flex items-center justify-center" style={{ borderRadius: r.value }}>
                  <span className="text-[10px] font-mono text-muted-foreground">{r.token}</span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">{r.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-5">Shadows</h2>
          <div className="space-y-3">
            {shadows.map((s) => (
              <div key={s.token} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: `var(--shadow-${s.token})` }}>
                <p className="text-xs font-semibold">{s.token}</p>
                <p className="text-[11px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
