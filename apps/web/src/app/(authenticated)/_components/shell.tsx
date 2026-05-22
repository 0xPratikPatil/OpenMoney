'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'sonner';
import {
  LayoutDashboard,
  Briefcase,
  ShieldAlert,
  Lightbulb,
  Eye,
  BookOpen,
  Search,
  Settings,
  Globe,
  TrendingUp,
  LogOut,
  Bell,
  Sparkles,
  Command,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';

/* ───────────────────────────────────────────────────────────────
   Navigation Items
   ─────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  {
    group: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { id: 'markets',   label: 'Markets',    icon: Globe,            href: '/markets' },
      { id: 'screener',  label: 'Screener',   icon: TrendingUp,       href: '/screener' },
      { id: 'search',    label: 'Search',     icon: Search,           href: '/search' },
    ],
  },
  {
    group: 'Portfolio',
    items: [
      { id: 'portfolios',      label: 'Portfolios',      icon: Briefcase,   href: '/portfolio' },
      { id: 'watchlists',      label: 'Watchlists',      icon: Eye,         href: '/watchlist' },
      { id: 'risk',            label: 'Risk',            icon: ShieldAlert, href: '/portfolio/risk' },
      { id: 'recommendations', label: 'Recommendations', icon: Lightbulb,   href: '/portfolio/recommendations' },
    ],
  },
  {
    group: 'Analysis',
    items: [
      { id: 'journal',     label: 'Journal',      icon: BookOpen,       href: '/journal' },
      { id: 'dashboards',  label: 'Dashboards',   icon: LayoutDashboard, href: '/dashboards' },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'providers',  label: 'Providers',  icon: Database,  href: '/providers' },
      { id: 'settings',   label: 'Settings',   icon: Settings,  href: '/settings' },
    ],
  },
];

function getActiveId(pathname: string): string {
  for (const group of NAV_ITEMS) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + '/')) return item.id;
    }
  }
  return 'dashboard';
}

/* ───────────────────────────────────────────────────────────────
   Shell Component
   ─────────────────────────────────────────────────────────────── */

interface ShellProps {
  session: any;
  children: React.ReactNode;
}

export function Shell({ session, children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const activeId = getActiveId(pathname);

  const SIDEBAR_W = collapsed ? 56 : 224;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col h-full shrink-0 border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300 ease-out"
        style={{ width: SIDEBAR_W }}
      >
        {/* Logo */}
        <div className={`flex items-center h-14 px-4 border-b border-[var(--border)] ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand-muted)]">
            <Sparkles size={15} className="text-[var(--brand)]" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">OpenMoney</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {NAV_ITEMS.map((group) => (
            <div key={group.group}>
              {group.group && !collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.id === activeId;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.href)}
                      className={`
                        flex items-center w-full rounded-lg transition-all duration-150
                        ${collapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : 'gap-3 px-3 h-9'}
                        ${isActive
                          ? 'bg-[var(--brand-muted)] text-[var(--brand)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                        }
                      `}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                      {!collapsed && isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-[var(--border)]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full h-8 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — glass */}
        <header className="flex items-center justify-between h-14 px-6 shrink-0 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)]">
              <Command size={12} className="text-[var(--text-tertiary)]" />
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                {pathname.replace(/\//g, ' / ').replace(/^\s+\/\s/, '') || 'dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--success-muted)] border border-[var(--success)]/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-[10px] font-medium text-[var(--success)]">Live</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors">
              <Bell size={16} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--brand)] ring-2 ring-[var(--surface)]" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--brand-muted)] text-[var(--brand)] text-xs font-semibold">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
              </div>
              <span className="text-xs text-[var(--text-secondary)] hidden sm:block max-w-[120px] truncate">
                {session?.user?.name || session?.user?.email}
              </span>
              <Link
                href="/api/auth/sign-out"
                className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--destructive)] hover:bg-[var(--destructive-muted)] transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Toasts */}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '13px',
            boxShadow: 'var(--shadow-lg)',
          },
        }}
      />
    </div>
  );
}
