'use client';

import * as React from 'react';
import {
  Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Input, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton,
  DeltaBadge, SparklineBar, MetricCard, StatusBadge, LiveIndicator,
  SignalGauge, PriorityBadge, TagChip, Callout,
} from '@openmoney/ui';
import { Palette, Component, ArrowRight, Info, TriangleAlert, CircleX, CircleCheck } from 'lucide-react';

/* ───────────────────────────────────────────────────────────────
   Brand Page — mirrors better-auth.com/brand
   Sections: Foundations → Motifs → Components → Voice
   ─────────────────────────────────────────────────────────────── */

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

const calloutAccents = [
  { name: 'info', color: 'bg-blue-500', label: 'Info' },
  { name: 'warn', color: 'bg-orange-500', label: 'Warn' },
  { name: 'error', color: 'bg-red-500', label: 'Error' },
  { name: 'success', color: 'bg-green-500', label: 'Success' },
];

const radii = [
  { label: 'sharp (code)', value: '0' },
  { label: 'sm', value: 'calc(var(--radius) - 4px)' },
  { label: 'md', value: 'calc(var(--radius) - 2px)' },
  { label: 'lg (default)', value: 'var(--radius)' },
  { label: 'xl', value: 'calc(var(--radius) + 4px)' },
];

const shadows = [
  { label: 'xs', token: 'shadow-xs' },
  { label: 'sm', token: 'shadow-sm' },
  { label: 'md', token: 'shadow-md' },
  { label: 'lg', token: 'shadow-lg' },
  { label: 'xl', token: 'shadow-xl' },
];

export default function TokensPage() {
  return (
    <div className="relative min-h-dvh">
      <div className="flex flex-col lg:flex-row">
        <SideRail />
        <div className="relative w-full lg:w-[70%] overflow-x-hidden">
          <div className="px-5 sm:px-6 lg:px-10 lg:pt-16 pb-10">
            <MobileHeader />
            <div className="space-y-16 pt-4 lg:pt-0">
              <Section id="foundations" eyebrow="01" title="Foundations">
                <ColorsBlock />
                <TypographyBlock />
                <RadiusBlock />
                <ShadowBlock />
              </Section>

              <Section id="motifs" eyebrow="02" title="Motifs">
                <MotifBlock />
              </Section>

              <Section id="components" eyebrow="03" title="Components">
                <ButtonsBlock />
                <FormBlock />
                <CardsBlock />
                <CalloutsBlock />
                <TabsBlock />
                <BadgesBlock />
                <AlertsBlock />
              </Section>

              <Section id="finance" eyebrow="04" title="Finance Components">
                <FinanceBlock />
              </Section>

              <Section id="voice" eyebrow="05" title="Voice">
                <VoiceBlock />
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Side Rail ── */
function SideRail() {
  const sections = [
    { label: 'Foundations', href: '#foundations' },
    { label: 'Motifs', href: '#motifs' },
    { label: 'Components', href: '#components' },
    { label: 'Finance', href: '#finance' },
    { label: 'Voice', href: '#voice' },
  ];

  return (
    <aside className="hidden lg:block relative w-full shrink-0 lg:w-[30%] lg:h-dvh border-b lg:border-b-0 lg:border-r border-foreground/[0.06] overflow-clip px-5 sm:px-6 lg:px-10 lg:sticky lg:top-0">
      <div className="absolute inset-0 bg-grid text-foreground/[0.04] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="relative w-full pt-6 md:pt-10 pb-6 lg:pb-0 flex flex-col justify-center lg:h-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Design System</p>
            <h1 className="text-2xl md:text-3xl xl:text-4xl tracking-tight leading-tight">
              <span className="underline underline-offset-4 decoration-foreground/40">Brand</span>
            </h1>
            <p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed max-w-[280px]">
              The tokens, components, and motifs that make up the OpenMoney visual language. Everything here is pulled live from the same variables used across product and docs.
            </p>
          </div>

          <nav className="border-t border-foreground/10 pt-4 space-y-0">
            {sections.map((s, i) => (
              <a key={s.href} href={s.href}
                className="flex items-baseline justify-between py-1.5 border-b border-dashed border-foreground/[0.06] last:border-0 group no-underline">
                <span className="text-[11px] text-foreground/70 dark:text-foreground/50 uppercase tracking-wider group-hover:text-foreground/90 transition-colors">
                  {s.label}
                </span>
                <span className="text-[11px] text-foreground/40 font-mono">0{i + 1}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader() {
  return (
    <div className="lg:hidden relative border-b border-foreground/[0.06] overflow-hidden -mx-5 sm:-mx-6 px-5 sm:px-6 mb-5">
      <div className="absolute inset-0 bg-grid text-foreground/[0.04] pointer-events-none" />
      <div className="relative space-y-2 py-12">
        <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Design System</p>
        <h1 className="text-2xl md:text-3xl tracking-tight leading-tight">
          <span className="underline underline-offset-4 decoration-foreground/40">Brand</span>
        </h1>
        <p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed">
          The tokens, components, and motifs that make up OpenMoney.
        </p>
      </div>
    </div>
  );
}

/* ── Section ── */
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

function Subsection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? <p className="text-[13px] text-foreground/50 leading-relaxed max-w-prose">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

/* ── Colors ── */
function ColorsBlock() {
  return (
    <Subsection title="Color" description="The palette that makes up every surface in the product. Click a swatch to copy its hex.">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10">
        {colorTokens.map((t) => (
          <ColorSwatch key={t.name} name={t.name} label={t.label} />
        ))}
      </div>
      <div className="space-y-2 pt-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Callout accents</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {calloutAccents.map((c) => (
            <div key={c.name} className="border border-foreground/10 flex items-center gap-2 p-2">
              <span className={`h-6 w-1 ${c.color}`} />
              <span className="text-[11px] font-medium">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Subsection>
  );
}

function ColorSwatch({ name, label }: { name: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (typeof document === 'undefined') return;
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.backgroundColor = `var(--${name})`;
    document.body.appendChild(probe);
    const hex = getComputedStyle(probe).backgroundColor;
    document.body.removeChild(probe);
    navigator.clipboard?.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button type="button" onClick={copy} className="bg-background p-3 space-y-2 text-left hover:bg-foreground/[0.02] transition-colors">
      <div className="h-14 w-full border border-foreground/10" style={{ backgroundColor: `var(--${name})` }} />
      <div className="space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-medium">{label}</p>
          <p className="text-[10px] font-mono text-foreground/60">{copied ? 'Copied' : '—'}</p>
        </div>
        <p className="text-[10px] font-mono text-foreground/45">--{name}</p>
      </div>
    </button>
  );
}

/* ── Typography ── */
function TypographyBlock() {
  return (
    <Subsection title="Typography" description="Geist for UI, Geist Mono for code and metadata.">
      <div className="divide-y divide-foreground/10 border border-foreground/10">
        <TypeRow label="Geist Sans · H1" meta="text-4xl tracking-tight" className="text-4xl tracking-tight">
          OpenMoney, better.
        </TypeRow>
        <TypeRow label="Geist Sans · H2" meta="text-xl tracking-tight" className="text-xl tracking-tight">
          Portfolio intelligence, real-time.
        </TypeRow>
        <TypeRow label="Geist Sans · Body" meta="text-sm" className="text-sm text-foreground/80">
          The quick brown fox jumps over the lazy dog. 0123456789.
        </TypeRow>
        <TypeRow label="Geist Mono · Label" meta="text-[11px] font-mono uppercase tracking-wider" className="text-[11px] font-mono uppercase tracking-wider text-foreground/70">
          api / openmoney / v0.0.1
        </TypeRow>
        <TypeRow label="Geist Mono · Code" meta="font-mono text-sm" className="font-mono text-sm text-foreground/80">
          {'const executor = new QueryExecutor(registry);'}
        </TypeRow>
      </div>
    </Subsection>
  );
}

function TypeRow({ label, meta, className, children }: { label: string; meta: string; className?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 p-4">
      <div className="space-y-0.5">
        <p className="text-[11px] font-medium">{label}</p>
        <p className="text-[10px] font-mono text-foreground/50">{meta}</p>
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

/* ── Radius ── */
function RadiusBlock() {
  return (
    <Subsection title="Radius" description="Base is 0.2rem — deliberately tight. Code blocks and inline callouts break to 0 for a sharper, more editorial feel.">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {radii.map((r) => (
          <div key={r.label} className="border border-foreground/10 p-3 space-y-3">
            <div className="h-12 w-full bg-foreground/5 border border-foreground/10" style={{ borderRadius: r.value }} />
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium">{r.label}</p>
              <p className="text-[10px] font-mono text-foreground/50">{r.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Subsection>
  );
}

/* ── Shadow ── */
function ShadowBlock() {
  return (
    <Subsection title="Shadow" description="Shadows are used sparingly — only to lift interactive affordances. Code blocks and cards stay flat.">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 border border-foreground/10">
        {shadows.map((s) => (
          <div key={s.token} className="space-y-2 text-center">
            <div className={`h-14 w-full bg-background border border-foreground/10 ${s.token}`} />
            <p className="text-[11px] font-mono text-foreground/50">{s.token}</p>
          </div>
        ))}
      </div>
    </Subsection>
  );
}

/* ── Motifs ── */
function MotifBlock() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <MotifCard label="Grid · 32px" meta=".bg-grid" className="bg-grid text-foreground/20" />
      <MotifCard label="Grid · 8px" meta=".bg-grid-small" className="bg-grid-small text-foreground/20" />
      <MotifCard label="Dot · 16px" meta=".bg-dot" className="bg-dot text-foreground/30" />
    </div>
  );
}

function MotifCard({ label, meta, className }: { label: string; meta: string; className: string }) {
  return (
    <div className="border border-foreground/10">
      <div className={`h-36 w-full ${className}`} />
      <div className="flex items-baseline justify-between border-t border-foreground/10 px-3 py-2">
        <p className="text-[11px] font-medium">{label}</p>
        <p className="text-[10px] font-mono text-foreground/50">{meta}</p>
      </div>
    </div>
  );
}

/* ── Buttons ── */
function ButtonsBlock() {
  return (
    <Subsection title="Buttons" description="Six variants, four sizes.">
      <div className="border border-foreground/10 p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-foreground/5 pt-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5v14" strokeLinecap="round" /></svg>
          </Button>
        </div>
      </div>
    </Subsection>
  );
}

/* ── Form ── */
function FormBlock() {
  return (
    <Subsection title="Inputs" description="Sharp, minimal affordances.">
      <div className="border border-foreground/10 p-4 grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Email</span>
          <Input type="email" placeholder="you@openmoney.com" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Password</span>
          <Input type="password" placeholder="••••••••" />
        </label>
      </div>
    </Subsection>
  );
}

/* ── Cards ── */
function CardsBlock() {
  return (
    <Subsection title="Card" description="Flat border, no shadow. Uses dashed footer rules for meta.">
      <div className="grid sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Session</CardTitle><CardDescription>The canonical unit of auth state on every request.</CardDescription></CardHeader>
          <CardContent><p className="text-sm text-foreground/70">Cookies, JWTs, or both — configured per deployment.</p></CardContent>
          <CardFooter><span className="text-[11px] font-mono text-foreground/50">v0.0.1</span></CardFooter>
        </Card>
        <Card>
          <CardHeader><CardTitle>Provider</CardTitle><CardDescription>Interchangeable data adapter — yfinance, FMP, Polygon.</CardDescription></CardHeader>
          <CardContent><p className="text-sm text-foreground/70">Each provider registers fetcher models with TET lifecycle.</p></CardContent>
          <CardFooter><span className="text-[11px] font-mono text-foreground/50">33 providers</span></CardFooter>
        </Card>
      </div>
    </Subsection>
  );
}

/* ── Callouts ── */
function CalloutsBlock() {
  return (
    <Subsection title="Callouts">
      <div className="space-y-2">
        <Callout type="info" title="Heads up">Callouts use a dashed left stripe sized to the accent type.</Callout>
        <Callout type="warn" title="Careful">This action rotates signing keys and invalidates every active session.</Callout>
        <Callout type="error" title="Broken">The provider returned an unexpected data shape.</Callout>
        <Callout type="success" title="Nice">Your provider connected and synced successfully.</Callout>
      </div>
    </Subsection>
  );
}

/* ── Tabs ── */
function TabsBlock() {
  return (
    <Subsection title="Tabs">
      <div className="border border-foreground/10 p-4">
        <Tabs defaultValue="ts" className="w-full">
          <TabsList>
            <TabsTrigger value="ts">TypeScript</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="sh">Shell</TabsTrigger>
          </TabsList>
          <TabsContent value="ts">
            <pre className="mt-3 font-mono text-xs p-3 bg-foreground/[0.03] border border-foreground/10 overflow-x-auto">
              <code>{`import { globalRegistry, QueryExecutor } from "@openmoney/provider-core";\n\nconst executor = new QueryExecutor(globalRegistry);\nconst data = await executor.execute("yfinance", "equity/quote", { symbol: "AAPL" });`}</code>
            </pre>
          </TabsContent>
          <TabsContent value="js">
            <pre className="mt-3 font-mono text-xs p-3 bg-foreground/[0.03] border border-foreground/10 overflow-x-auto">
              <code>{`const { globalRegistry, QueryExecutor } = require("@openmoney/provider-core");\n\nconst executor = new QueryExecutor(globalRegistry);\nconst data = await executor.execute("yfinance", "equity/quote", { symbol: "AAPL" });`}</code>
            </pre>
          </TabsContent>
          <TabsContent value="sh">
            <pre className="mt-3 font-mono text-xs p-3 bg-foreground/[0.03] border border-foreground/10 overflow-x-auto">
              <code>curl "http://localhost:4000/api/equity/quote?symbol=AAPL&provider=yfinance"</code>
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </Subsection>
  );
}

/* ── Badges ── */
function BadgesBlock() {
  return (
    <Subsection title="Badges">
      <div className="border border-foreground/10 p-4 flex flex-wrap gap-2">
        <Badge>default</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
      </div>
    </Subsection>
  );
}

/* ── Alerts ── */
function AlertsBlock() {
  return (
    <Subsection title="Alerts">
      <div className="space-y-3">
        <div className="border border-foreground/10 rounded-md p-4">
          <p className="text-sm font-medium">Provider connected</p>
          <p className="text-sm text-foreground/60 mt-1">Yahoo Finance is now serving equity data.</p>
        </div>
        <div className="border border-destructive/20 rounded-md p-4 text-destructive">
          <p className="text-sm font-medium">Query failed</p>
          <p className="text-sm text-destructive/80 mt-1">The provider returned an invalid response shape.</p>
        </div>
      </div>
    </Subsection>
  );
}

/* ── Finance Components ── */
function FinanceBlock() {
  const sparkData = React.useMemo(() => Array.from({length: 20}, () => Math.random()), []);

  return (
    <Subsection title="Finance Components" description="Domain-specific components for financial data display.">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Metric Cards</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="PORTFOLIO VALUE" value="$2.4M" status="neutral" sparkline={sparkData} accent />
            <MetricCard label="DAY P&L" value="+$12.8K" delta="+0.53%" status="positive" sparkline={sparkData.map(v => v * 1.3)} />
            <MetricCard label="VAR (95%)" value="-2.34%" delta="-0.8%" status="negative" />
            <MetricCard label="POSITIONS" value="24" status="neutral" />
          </div>
        </div>

        {/* Delta Badges */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Delta Badges</p>
          <div className="flex gap-2">
            <DeltaBadge value="+2.4%" status="positive" />
            <DeltaBadge value="-1.8%" status="negative" />
            <DeltaBadge value="0.0%" status="neutral" />
          </div>
        </div>

        {/* Status Badges */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Status Badges</p>
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status="ACTIVE" />
            <StatusBadge status="COMPLETED" />
            <StatusBadge status="REVIEWING" />
            <StatusBadge status="FAILED" />
            <StatusBadge status="PENDING" />
          </div>
        </div>

        {/* Priority & Tags */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Priority</p>
            <div className="flex gap-2">
              <PriorityBadge priority="HIGH" />
              <PriorityBadge priority="MEDIUM" />
              <PriorityBadge priority="LOW" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Tags</p>
            <div className="flex gap-1.5 flex-wrap">
              <TagChip label="EQUITY" active />
              <TagChip label="CRYPTO" />
              <TagChip label="ETF" />
              <TagChip label="FOREX" />
            </div>
          </div>
        </div>

        {/* Signal Gauge */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Signal Gauge</p>
          <div className="border border-foreground/10 p-4">
            <SignalGauge value={72} label="CONFIDENCE" segments={40} />
          </div>
        </div>

        {/* Sparkline Bar */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Sparkline Bar</p>
          <div className="flex gap-4">
            <div className="border border-foreground/10 p-3">
              <SparklineBar values={sparkData} status="positive" height={24} />
            </div>
            <div className="border border-foreground/10 p-3">
              <SparklineBar values={sparkData.map(v => 1 - v)} status="negative" height={24} />
            </div>
          </div>
        </div>

        {/* Live Indicator */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Live Indicator</p>
          <div className="flex items-center gap-4">
            <LiveIndicator label="LIVE" />
            <LiveIndicator label="CONNECTED" />
          </div>
        </div>
      </div>
    </Subsection>
  );
}

/* ── Voice ── */
function VoiceBlock() {
  const principles = [
    { title: 'Clear over clever', body: 'We name things what they are. Session, key, secret — not SessionManagerV2Provider.' },
    { title: 'Terse, but warm', body: 'Short sentences. No marketing fluff. Sound like a thoughtful engineer, not a billboard.' },
    { title: 'Show the code', body: 'A well-named snippet does more than a paragraph. Prose sets context; code proves it.' },
    { title: 'Sharp, not loud', body: 'Minimal radii, dashed dividers, mono for metadata. The design should feel precise, never decorative.' },
  ];
  return (
    <Subsection title="Voice" description="How OpenMoney communicates — across docs, product copy, and marketing.">
      <div className="grid sm:grid-cols-2 gap-3">
        {principles.map((p) => (
          <div key={p.title} className="border border-foreground/10 p-4">
            <p className="text-sm font-medium">{p.title}</p>
            <p className="text-sm text-foreground/60 leading-relaxed mt-1">{p.body}</p>
          </div>
        ))}
      </div>
    </Subsection>
  );
}
