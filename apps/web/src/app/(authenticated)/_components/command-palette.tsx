'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from 'cmdk';
import {
  LayoutDashboard, Globe, TrendingUp, Search, Briefcase,
  Eye, ShieldAlert, Lightbulb, BookOpen, Settings, Database,
  Plus, FileText, BarChart3, Zap, Bot,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', keywords: 'home overview' },
  { id: 'markets', label: 'Markets', icon: Globe, href: '/markets', keywords: 'indices sectors etf' },
  { id: 'screener', label: 'Screener', icon: TrendingUp, href: '/screener', keywords: 'filter screen stock finder' },
  { id: 'search', label: 'Search', icon: Search, href: '/search', keywords: 'find ticker symbol lookup' },
  { id: 'portfolios', label: 'Portfolios', icon: Briefcase, href: '/portfolio', keywords: 'holdings investments' },
  { id: 'watchlists', label: 'Watchlists', icon: Eye, href: '/watchlist', keywords: 'track monitor' },
  { id: 'risk', label: 'Risk Analytics', icon: ShieldAlert, href: '/portfolio/risk', keywords: 'var sharpe drawdown' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, href: '/portfolio/recommendations', keywords: 'signals actions' },
  { id: 'journal', label: 'Journal', icon: BookOpen, href: '/journal', keywords: 'predictions thesis accuracy' },
  { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard, href: '/dashboards', keywords: 'widgets custom' },
  { id: 'providers', label: 'Data Sources', icon: Database, href: '/providers', keywords: 'api keys credentials' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', keywords: 'preferences profile' },
];

const ACTIONS = [
  { id: 'new-journal', label: 'New Journal Entry', icon: FileText, href: '/journal/new', keywords: 'write thesis prediction' },
  { id: 'new-portfolio', label: 'Create Portfolio', icon: Plus, href: '/portfolio', keywords: 'new portfolio' },
  { id: 'new-watchlist', label: 'Create Watchlist', icon: Eye, href: '/watchlist', keywords: 'new watchlist' },
  { id: 'quick-search', label: 'Quick Ticker Search', icon: Search, href: '/search', keywords: 'find ticker' },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Menu"
      className="[&_[cmdk-root]]:bg-[var(--surface-2)] [&_[cmdk-root]]:border [&_[cmdk-root]]:border-[var(--border)] [&_[cmdk-root]]:rounded-xl [&_[cmdk-root]]:shadow-2xl [&_[cmdk-root]]:overflow-hidden"
    >
      <div className="flex items-center border-b border-[var(--border-subtle)] px-3">
        <Search size={14} className="text-[var(--text-tertiary)] mr-2 shrink-0" />
        <CommandInput
          placeholder="Type a command or search..."
          className="flex-1 h-11 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
        <kbd className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--surface-3)] rounded px-1.5 py-0.5 ml-2">
          ⌘K
        </kbd>
      </div>
      <CommandList className="max-h-[400px] overflow-y-auto p-2">
        <CommandEmpty className="py-8 text-center text-sm text-[var(--text-tertiary)]">
          No results found.
        </CommandEmpty>

        <CommandGroup heading="Navigate" className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-tertiary)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
          {PAGES.map((page) => (
            <CommandItem
              key={page.id}
              value={`${page.label} ${page.keywords}`}
              onSelect={() => runCommand(() => router.push(page.href))}
              className="flex items-center gap-3 px-2 py-2 rounded-md text-sm text-[var(--text-secondary)] aria-selected:text-[var(--text-primary)] aria-selected:bg-[var(--accent)] cursor-pointer transition-colors"
            >
              <page.icon size={16} className="shrink-0" />
              <span className="flex-1">{page.label}</span>
              <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{page.href}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="my-1 border-t border-[var(--border-subtle)]" />

        <CommandGroup heading="Quick Actions" className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-tertiary)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
          {ACTIONS.map((action) => (
            <CommandItem
              key={action.id}
              value={`${action.label} ${action.keywords}`}
              onSelect={() => runCommand(() => router.push(action.href))}
              className="flex items-center gap-3 px-2 py-2 rounded-md text-sm text-[var(--text-secondary)] aria-selected:text-[var(--text-primary)] aria-selected:bg-[var(--accent)] cursor-pointer transition-colors"
            >
              <action.icon size={16} className="shrink-0" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border-subtle)] font-mono text-[9px] text-[var(--text-tertiary)]">
        <div className="flex items-center gap-3">
          <span><kbd className="bg-[var(--surface-3)] rounded px-1 py-0.5">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-[var(--surface-3)] rounded px-1 py-0.5">↵</kbd> Open</span>
          <span><kbd className="bg-[var(--surface-3)] rounded px-1 py-0.5">Esc</kbd> Close</span>
        </div>
        <span>OpenMoney</span>
      </div>
    </CommandDialog>
  );
}
