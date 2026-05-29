'use client';

import { Badge, StaggerChildren, AnimateOnScroll, FadeIn } from '@openmoney/ui';
import { Component, Sparkles, Zap, Wand } from 'lucide-react';
import { ComponentDemos } from '../../components/component-demos';

const categories = [
  { id: 'motion', label: 'Motion', icon: Wand },
  { id: 'premium', label: 'Premium', icon: Zap },
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Forms & Input' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'data-display', label: 'Data Display' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'domain', label: 'Domain' },
];

export default function ComponentsPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <FadeIn duration={0.4}>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="font-mono text-[10px] tracking-wider gap-1">
              <Sparkles size={10} className="text-brand" /> 80+ Components
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Component size={20} className="text-brand" />
            Components
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            UI primitives, premium components, and finance domain modules with live previews.
          </p>
        </div>
      </FadeIn>

      {/* Category filter pills */}
      <AnimateOnScroll animation="fade-up" className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-border">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors duration-150 px-3 py-1.5 rounded-lg border border-border hover:border-border-strong hover:bg-surface-1 no-underline"
          >
            {cat.icon && <cat.icon size={13} />}
            {cat.label}
          </a>
        ))}
      </AnimateOnScroll>

      <ComponentDemos />
    </div>
  );
}
