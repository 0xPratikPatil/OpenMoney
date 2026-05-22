'use client';

import { Badge } from '@openmoney/ui';
import { ComponentDemos } from '../../components/component-demos';
import { Component } from 'lucide-react';

const categories = [
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
      <div className="mb-8">
        <Badge variant="brand" className="text-xs font-mono mb-3">73 Components</Badge>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Component size={20} className="text-brand" /> Components
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          UI primitives and domain components with live previews and code samples.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-border">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-border-hover hover:bg-secondary no-underline"
          >
            {cat.label}
          </a>
        ))}
      </div>

      <ComponentDemos />
    </div>
  );
}
