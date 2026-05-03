"use client";

import { cn } from "../../lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FolderOpen,
  Eye,
  BookOpen,
  Bell,
  Search,
  WifiOff,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        className,
      )}
    >
      {/* Icon */}
      {Icon && (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="size-6 text-muted-fg" aria-hidden="true" />
        </div>
      )}

      {/* Title */}
      <div className="max-w-xs space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm leading-relaxed text-muted-fg">{description}</p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
                "bg-foreground text-background hover:opacity-90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
                "border border-border bg-background text-foreground hover:bg-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Presets — used as EmptyState.Portfolios, etc.
// ---------------------------------------------------------------------------

function Portfolios(props: Omit<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <EmptyState
      icon={Briefcase}
      title="No portfolios yet"
      description="Create your first portfolio to start tracking your investments and performance."
      {...props}
    />
  );
}

function Positions(props: Omit<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No positions"
      description="Positions from your portfolios will appear here once you add them."
      {...props}
    />
  );
}

function Watchlist(props: Omit<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <EmptyState
      icon={Eye}
      title="Watchlist is empty"
      description="Add tickers to your watchlist to monitor price movements and signals."
      {...props}
    />
  );
}

function Journal(props: Omit<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No journal entries"
      description="Start logging your trading ideas and predictions to track your accuracy over time."
      {...props}
    />
  );
}

function Signals(props: Omit<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <EmptyState
      icon={Bell}
      title="No signals"
      description="Signals will appear here when your configured conditions are triggered."
      {...props}
    />
  );
}

function SearchResults(props: Omit<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      {...props}
    />
  );
}

function Providers(props: Omit<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <EmptyState
      icon={WifiOff}
      title="No providers connected"
      description="Connect a data provider to start fetching market data."
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Attach presets as static properties
// ---------------------------------------------------------------------------

EmptyState.Portfolios = Portfolios;
EmptyState.Positions = Positions;
EmptyState.Watchlist = Watchlist;
EmptyState.Journal = Journal;
EmptyState.Signals = Signals;
EmptyState.Search = SearchResults;
EmptyState.Providers = Providers;

export { EmptyState };
export type { EmptyStateProps, EmptyStateAction };
