'use client';

import Link from 'next/link';
import {
  Button, Badge,
  FadeIn, SlideIn, StaggerChildren, AnimateOnScroll, ParallaxLayer,
  GradientText, BentoGrid, BentoGridItem, Marquee,
  ParticlesBackground, Dock, DockItem, CursorGlow,
  CountUp, Typewriter, AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent,
} from '@openmoney/ui';
import {
  ArrowRight, Sparkles, Component, Palette, LayoutDashboard, Code2,
  Zap, Globe, Layers, Monitor, Smartphone, Cpu, ChevronRight,
  Github, Twitter, ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';

/* ── Section Header ── */
function SectionHeader({ label, title, description }: { label?: string; title: string; description?: string }) {
  return (
    <AnimateOnScroll animation="fade-up" className="space-y-3 text-center max-w-2xl mx-auto">
      {label && <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">{label}</Badge>}
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
    </AnimateOnScroll>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-full bg-surface-0">
      {/* ═══════════════════════════════════════════════════════ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-border-subtle">
        <ParticlesBackground
          particleCount={60}
          color="var(--brand-dim)"
          speed="default"
          connectDistance={180}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 hero-gradient pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8 py-32">
          <FadeIn duration={0.5}>
            <Badge variant="outline" className="font-mono text-[11px] gap-2 glass-surface">
              <Sparkles size={12} className="text-brand" />
              <Typewriter text="Production-grade design system" speed={40} />
            </Badge>
          </FadeIn>

          <FadeIn duration={0.5} delay={0.15}>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
              <GradientText gradientFrom="var(--brand)" gradientVia="var(--info)" gradientTo="var(--brand-hover)" animate>
                OpenMoney
              </GradientText>
              <span className="block mt-3">components for the</span>
              <span className="block text-muted-foreground">modern web</span>
            </h1>
          </FadeIn>

          <FadeIn duration={0.5} delay={0.3}>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A dark-first, production-grade component library for building premium financial interfaces. 
              Crafted with precision motion, accessibility, and developer experience in mind.
            </p>
          </FadeIn>

          <FadeIn duration={0.5} delay={0.45}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/components">
                <Button size="lg" className="gap-2">
                  <Component size={16} />
                  Browse Components
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/tokens">
                <Button variant="outline" size="lg" className="gap-2">
                  <Palette size={16} />
                  Design Tokens
                </Button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn duration={0.5} delay={0.6}>
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-brand" /> <CountUp target={70} suffix="+ components" />
              </span>
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-info" /> Dark-first
              </span>
              <span className="flex items-center gap-1.5">
                <Code2 size={14} className="text-muted-foreground" /> TypeScript
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <ChevronRight size={20} className="rotate-90" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ FEATURES BENTO ═══════════════════════════════════════════════ */}
      <section className="border-b border-border-subtle py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <SectionHeader
            label="WHY OPENMONEY"
            title="Designed for the modern stack"
            description="Every component is optimized for TypeScript, Tailwind v4, React 19, and the motion ecosystem."
          />

          <BentoGrid columns={3} gap={5}>
            <BentoGridItem colSpan={2} rowSpan={1}>
              <CursorGlow glowSize={500}>
                <div className="p-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand-border flex items-center justify-center">
                      <Layers size={20} className="text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Dark-First Design System</h3>
                      <p className="text-xs text-muted-foreground">Complete oklch palette with financial semantics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['positive', 'negative', 'warning', 'info', 'brand', 'chart-1', 'chart-2', 'chart-3'].map((color) => (
                      <div key={color} className="h-8 rounded-md border border-border-subtle" style={{ backgroundColor: `var(--${color})` }} />
                    ))}
                  </div>
                </div>
              </CursorGlow>
            </BentoGridItem>

            <BentoGridItem colSpan={1} rowSpan={1}>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center">
                  <Cpu size={20} className="text-info" />
                </div>
                <h3 className="font-semibold text-sm">Motion Primitives</h3>
                <p className="text-xs text-muted-foreground">6 composable animation primitives. 150ms-300ms, ease-out, no bounce.</p>
              </div>
            </BentoGridItem>

            <BentoGridItem colSpan={1} rowSpan={1}>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-positive/10 border border-positive/20 flex items-center justify-center">
                  <Monitor size={20} className="text-positive" />
                </div>
                <h3 className="font-semibold text-sm">Accessible</h3>
                <p className="text-xs text-muted-foreground">WCAG AA contrast, keyboard nav, screen reader support built in.</p>
              </div>
            </BentoGridItem>

            <BentoGridItem colSpan={1} rowSpan={1}>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
                  <Smartphone size={20} className="text-warning" />
                </div>
                <h3 className="font-semibold text-sm">Responsive</h3>
                <p className="text-xs text-muted-foreground">Mobile-first with 6 breakpoints. Touch targets ≥ 44px.</p>
              </div>
            </BentoGridItem>

            <BentoGridItem colSpan={1} rowSpan={1}>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Code2 size={20} className="text-destructive" />
                </div>
                <h3 className="font-semibold text-sm">Tree-Shakeable</h3>
                <p className="text-xs text-muted-foreground">Import only what you need. Zero runtime for unused components.</p>
              </div>
            </BentoGridItem>
          </BentoGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ COMPONENT SPOTLIGHT ═══════════════════════════════════════════ */}
      <section className="border-b border-border-subtle py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <SectionHeader
            label="PREMIUM COMPONENTS"
            title="New animation-first components"
            description="Built on motion/react with DESIGN.md-compliant animation primitives."
          />

          <StaggerChildren staggerDelay={0.08} childDuration={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'FadeIn', desc: 'Configurable fade-in on mount', icon: Sparkles, color: 'brand' },
                { name: 'SlideIn', desc: 'Directional slide entrance', icon: ArrowRight, color: 'info' },
                { name: 'ScaleIn', desc: '0.95→1 scale entrance', icon: Layers, color: 'positive' },
                { name: 'StaggerChildren', desc: 'Delayed child animation', icon: LayoutDashboard, color: 'warning' },
                { name: 'MorphingDialog', desc: 'layoutId morph animation', icon: Monitor, color: 'chart-1' },
                { name: 'Dock', desc: 'macOS-style floating nav', icon: Zap, color: 'chart-2' },
                { name: 'Marquee', desc: 'Infinite scroll banner', icon: Globe, color: 'chart-3' },
                { name: 'GradientText', desc: 'Animated gradient text', icon: Palette, color: 'brand' },
              ].map((item) => (
                <Link key={item.name} href="/components" className="no-underline group">
                  <div className="border border-border rounded-lg p-5 bg-surface-1 hover:border-border-strong transition-colors duration-150 hover:-translate-y-0.5">
                    <div className={`w-9 h-9 rounded-lg bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center mb-3`}>
                      <item.icon size={18} className={`text-${item.color}`} />
                    </div>
                    <p className="font-mono text-xs font-medium">{item.name}</p>
                    <p className="text-[11px] text-text-tertiary mt-1">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ DATA COMPONENTS ═══════════════════════════════════════════════ */}
      <section className="border-b border-border-subtle py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <SectionHeader
            label="FINANCE COMPONENTS"
            title="Purpose-built for financial data"
            description="Components with semantic coloring, monospace data display, and real-time indicators."
          />

          <AnimateOnScroll animation="fade-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* KPI Cards */}
              {[
                { label: 'PORTFOLIO VALUE', value: '$2,412,391,27', change: '+3.2%', up: true },
                { label: 'DAY P&L', value: '+$12,841.53', change: '+0.53%', up: true },
                { label: 'VOLATILITY (30D)', value: '18.4%', change: '-2.1%', up: false },
              ].map((kpi) => (
                <div key={kpi.label} className="border border-border rounded-lg p-5 bg-surface-1">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary mb-2">{kpi.label}</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">{kpi.value}</p>
                  <span className={`inline-flex items-center gap-1 mt-2 font-mono text-[11px] ${kpi.up ? 'text-positive' : 'text-negative'}`}>
                    {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.change}
                  </span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ CTA ═══════════════════════════════════════════════════ */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <AnimateOnScroll animation="fade-up">
            <Badge variant="outline" className="font-mono text-[11px] glass-surface">OPEN SOURCE</Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-4">
              Ready to build something
              <span className="block text-brand">exceptional?</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-3">
              Start with production-ready components designed for financial intelligence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link href="/components">
                <Button size="lg" className="gap-2">
                  Explore Components
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="https://github.com/your-org/openmoney" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Github size={16} />
                  Star on GitHub
                </Button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ FOOTER ═══════════════════════════════════════════════════ */}
      <footer className="border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
              <Activity size={12} className="text-black" />
            </div>
            <span className="text-xs font-medium">OpenMoney</span>
            <Badge variant="outline" className="font-mono text-[10px]">v0.1.0</Badge>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="font-mono">Dark-first · TypeScript · Tailwind · React</span>
            <div className="flex items-center gap-3">
              <Link href="https://x.com/openmoney" className="hover:text-foreground transition-colors">
                <Twitter size={14} />
              </Link>
              <Link href="https://github.com/your-org/openmoney" className="hover:text-foreground transition-colors">
                <Github size={14} />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
