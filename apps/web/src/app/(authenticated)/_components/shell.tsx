'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'sonner';
import {
  LayoutDashboard, Globe, TrendingUp, Search, Briefcase,
  Eye, ShieldAlert, Lightbulb, BookOpen, Settings, Database,
  LogOut, Bell, ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV_GROUPS = [
  { label: 'OVERVIEW', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'markets',   label: 'Markets',    icon: Globe,            href: '/markets' },
    { id: 'screener',  label: 'Screener',   icon: TrendingUp,       href: '/screener' },
    { id: 'search',    label: 'Search',     icon: Search,           href: '/search' },
  ]},
  { label: 'PORTFOLIO', items: [
    { id: 'portfolios',      label: 'Portfolios',      icon: Briefcase,   href: '/portfolio' },
    { id: 'watchlists',      label: 'Watchlists',      icon: Eye,         href: '/watchlist' },
    { id: 'risk',            label: 'Risk Analytics',  icon: ShieldAlert, href: '/portfolio/risk' },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb,   href: '/portfolio/recommendations' },
  ]},
  { label: 'ANALYSIS', items: [
    { id: 'journal',    label: 'Journal',     icon: BookOpen,        href: '/journal' },
    { id: 'dashboards', label: 'Dashboards',  icon: LayoutDashboard, href: '/dashboards' },
  ]},
  { label: 'SYSTEM', items: [
    { id: 'providers', label: 'Data Sources', icon: Database,  href: '/providers' },
    { id: 'settings',  label: 'Settings',     icon: Settings,  href: '/settings' },
  ]},
];

function getActiveId(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + '/')) return item.id;
    }
  }
  return 'dashboard';
}

interface ShellProps {
  session: any;
  children: React.ReactNode;
}

export function Shell({ session, children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const activeId = getActiveId(pathname);
  const SIDEBAR_W = collapsed ? 48 : 220;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex flex-col h-full shrink-0 border-r border-border transition-all duration-200"
        style={{ width: SIDEBAR_W }}>
        {/* Logo */}
        <div className={`flex items-center h-10 px-3 border-b border-border ${collapsed ? 'justify-center' : 'gap-2'}`}>
          <span className="font-mono text-foreground text-sm font-bold">O</span>
          {!collapsed && <span className="font-mono text-xs font-semibold tracking-tight text-foreground">OpenMoney</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2 mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.id === activeId;
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => router.push(item.href)}
                      className={`relative flex items-center w-full rounded-md transition-colors duration-100
                        ${collapsed ? 'justify-center h-8 w-8 mx-auto' : 'gap-2.5 px-2.5 h-8'}
                        ${isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}>
                      {isActive && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-foreground" />}
                      <Icon size={15} className="shrink-0" />
                      {!collapsed && <span className="text-xs font-medium truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse */}
        <div className="p-1.5 border-t border-border">
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — 40px */}
        <header className="flex items-center justify-between h-10 px-4 shrink-0 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground truncate">
              {pathname.replace(/\//g, ' / ').replace(/^\s+\/\s/, '') || 'dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-foreground" />
              </span>
              LIVE
            </span>

            <button className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <Bell size={14} />
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-foreground ring-1 ring-background" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-accent text-foreground text-[10px] font-mono font-semibold">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
              </div>
              <span className="font-mono text-[11px] text-muted-foreground hidden sm:block max-w-[100px] truncate">
                {session?.user?.name || session?.user?.email}
              </span>
              <Link href="/api/auth/sign-out"
                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out">
                <LogOut size={13} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <Toaster position="bottom-right" theme="dark" toastOptions={{
        style: {
          background: 'var(--background)', border: '1px solid var(--border)',
          color: 'var(--foreground)', borderRadius: 'var(--radius)', fontSize: '13px',
          fontFamily: 'var(--font-sans)', boxShadow: 'var(--shadow-lg)',
        },
      }} />
    </div>
  );
}
