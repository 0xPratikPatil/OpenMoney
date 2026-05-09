'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@openmoney/ui';
import {
  LayoutDashboard,
  Briefcase,
  ShieldAlert,
  Eye,
  TrendingUp,
  Globe,
  Bell,
  Calendar,
  ArrowUpDown,
  DollarSign,
  BookOpen,
  Newspaper,
  Grid3x3,
  Plus,
} from 'lucide-react';
import { WIDGET_REGISTRY, type WidgetType } from '../_lib/dashboard-store';

/* -------------------------------------------------------------------------- */
/*  Icon resolver                                                              */
/* -------------------------------------------------------------------------- */

function getWidgetIcon(type: WidgetType, className = 'size-5') {
  const icons: Record<WidgetType, React.ReactNode> = {
    'portfolio-summary': <Briefcase className={className} />,
    'risk-metrics': <ShieldAlert className={className} />,
    'watchlist-mini': <Eye className={className} />,
    'price-chart': <TrendingUp className={className} />,
    'market-overview': <Globe className={className} />,
    'signal-feed': <Bell className={className} />,
    'economic-calendar': <Calendar className={className} />,
    'top-movers': <ArrowUpDown className={className} />,
    'allocation-pie': <DollarSign className={className} />,
    'correlation-matrix': <Grid3x3 className={className} />,
    'journal-stats': <BookOpen className={className} />,
    'news-feed': <Newspaper className={className} />,
  };
  return icons[type] ?? <LayoutDashboard className={className} />;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface WidgetGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (type: WidgetType) => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function WidgetGallery({ open, onOpenChange, onAddWidget }: WidgetGalleryProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard. Widgets can be moved and resized after placement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 max-h-[60vh] overflow-y-auto">
          {WIDGET_REGISTRY.map((meta) => (
            <button
              key={meta.type}
              type="button"
              onClick={() => {
                onAddWidget(meta.type);
                onOpenChange(false);
              }}
              className="flex flex-col items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-left transition-all hover:border-[var(--accent-brand)] hover:shadow-sm hover:bg-[var(--accent)] group"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-brand)] group-hover:bg-[var(--accent-brand)] group-hover:text-white transition-colors">
                {getWidgetIcon(meta.type)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{meta.name}</p>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] leading-snug">
                  {meta.description}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-secondary)]">
                  {meta.defaultSize.w}×{meta.defaultSize.h}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--accent-brand)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={10} />
                  Add
                </span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
