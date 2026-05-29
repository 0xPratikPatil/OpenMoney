'use client';

import * as React from 'react';
import { Wand, Zap, MousePointer, FormInput, Waypoints, PanelTop, Database, MessageSquare, BarChart3 } from 'lucide-react';
import { ComponentDemos } from '../../components/component-demos';

const categories = [
  { id: 'buttons', label: 'Buttons', icon: MousePointer },
  { id: 'forms', label: 'Forms & Input', icon: FormInput },
  { id: 'navigation', label: 'Navigation', icon: Waypoints },
  { id: 'overlays', label: 'Overlays', icon: PanelTop },
  { id: 'data-display', label: 'Data Display', icon: Database },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'motion', label: 'Motion', icon: Wand },
  { id: 'premium', label: 'Premium', icon: Zap },
  { id: 'domain', label: 'Domain', icon: BarChart3 },
];

export default function ComponentsPage() {
  return (
    <div className="relative min-h-dvh">
      <div className="flex flex-col lg:flex-row">
        <SideRail />
        <div className="relative w-full lg:w-[70%] overflow-x-hidden">
          <div className="px-5 sm:px-6 lg:px-10 lg:pt-16 pb-10">
            <MobileHeader />
            <div className="pt-4 lg:pt-0">
              <ComponentDemos />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Side Rail ── */
function SideRail() {
  return (
    <aside className="hidden lg:block relative w-full shrink-0 lg:w-[30%] lg:h-dvh border-b lg:border-b-0 lg:border-r border-foreground/[0.06] overflow-clip px-5 sm:px-6 lg:px-10 lg:sticky lg:top-0">
      <div className="absolute inset-0 bg-grid text-foreground/[0.04] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="relative w-full pt-6 md:pt-10 pb-6 lg:pb-0 flex flex-col justify-center lg:h-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Component Library</p>
              <span className="text-[10px] font-mono text-foreground/40 bg-foreground/[0.05] border border-foreground/10 px-1.5 py-px">v0.0.1</span>
            </div>
            <h1 className="text-2xl md:text-3xl xl:text-4xl tracking-tight leading-tight">
              <span className="underline underline-offset-4 decoration-foreground/40">Components</span>
            </h1>
            <p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed max-w-[280px]">
              UI primitives, premium components, and finance domain modules with live previews and code snippets.
            </p>
          </div>

          <nav className="border-t border-foreground/10 pt-4 space-y-0">
            {categories.map((cat, i) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="flex items-center gap-2 py-1.5 border-b border-dashed border-foreground/[0.06] last:border-0 group no-underline"
              >
                <cat.icon size={12} className="text-foreground/40 group-hover:text-foreground/60 transition-colors shrink-0" />
                <span className="text-[11px] text-foreground/70 dark:text-foreground/50 uppercase tracking-wider group-hover:text-foreground/90 transition-colors">
                  {cat.label}
                </span>
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
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Component Library</p>
          <span className="text-[10px] font-mono text-foreground/40 bg-foreground/[0.05] border border-foreground/10 px-1.5 py-px">v0.0.1</span>
        </div>
        <h1 className="text-2xl md:text-3xl tracking-tight leading-tight">
          <span className="underline underline-offset-4 decoration-foreground/40">Components</span>
        </h1>
        <p className="text-sm text-foreground/70 dark:text-foreground/50 leading-relaxed">
          UI primitives, premium components, and finance domain modules.
        </p>
      </div>
    </div>
  );
}
