'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AppShell,
  Sidebar,
  TopBar,
  DataFreshnessIndicator,
} from '@openmoney/ui';
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
  Plus,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
} from 'lucide-react';
import { Toaster } from 'sonner';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, href: '/dashboard' },
      { id: 'markets', label: 'Global Markets', icon: <Globe size={16} />, href: '/markets' },
    ],
  },
  {
    title: 'Portfolio',
    items: [
      { id: 'portfolios', label: 'Portfolios', icon: <Briefcase size={16} />, href: '/portfolio' },
      { id: 'risk', label: 'Risk Analytics', icon: <ShieldAlert size={16} />, href: '/portfolio/risk' },
      { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb size={16} />, href: '/portfolio/recommendations' },
    ],
  },
  {
    title: 'Research',
    items: [
      { id: 'watchlists', label: 'Watchlists', icon: <Eye size={16} />, href: '/watchlist' },
      { id: 'screener', label: 'Screener', icon: <TrendingUp size={16} />, href: '/screener' },
      { id: 'search', label: 'Search', icon: <Search size={16} />, href: '/search' },
    ],
  },
  {
    title: 'Journal',
    items: [
      { id: 'journal', label: 'Journal', icon: <BookOpen size={16} />, href: '/journal' },
    ],
  },
  {
    title: 'Custom',
    items: [
      { id: 'dashboards', label: 'My Dashboards', icon: <LayoutDashboard size={16} />, href: '/dashboards' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: <Settings size={16} />, href: '/settings' },
      { id: 'providers', label: 'Data Providers', icon: <Plus size={16} />, href: '/settings/providers' },
    ],
  },
];

function getActiveSection(pathname: string): string {
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/dashboards')) return 'dashboards';
  if (pathname.startsWith('/markets')) return 'markets';
  if (pathname.startsWith('/portfolio/risk')) return 'risk';
  if (pathname.startsWith('/portfolio/recommendations')) return 'recommendations';
  if (pathname.startsWith('/portfolio')) return 'portfolios';
  if (pathname.startsWith('/watchlist')) return 'watchlists';
  if (pathname.startsWith('/screener')) return 'screener';
  if (pathname.startsWith('/journal')) return 'journal';
  if (pathname.startsWith('/settings/providers')) return 'providers';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/search')) return 'search';
  return 'dashboard';
}

interface ShellProps {
  session: any;
  children: React.ReactNode;
}

export function Shell({ session, children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const activeSection = getActiveSection(pathname);

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      active: item.id === activeSection,
      onClick: () => router.push(item.href!),
    })),
  }));

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            sections={sections}
            collapsed={sidebarCollapsed}
            header={
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 font-bold text-[var(--text-primary)] ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <span className="text-primary-500 text-lg">◆</span>
                {!sidebarCollapsed && <span className="text-sm">OpenMoney</span>}
              </Link>
            }
            footer={
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="flex w-full items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {sidebarCollapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
              </button>
            }
          />
        }
        topbar={
          <TopBar
            left={
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  {pathname.replace(/\//g, ' › ').replace(/^\s+›\s/, '') || 'Dashboard'}
                </span>
              </div>
            }
            right={
              <div className="flex items-center gap-3">
                <DataFreshnessIndicator state="live" timestamp={new Date()} />
                <button className="relative rounded-full p-1.5 hover:bg-[var(--accent)] transition-colors">
                  <Bell size={16} className="text-[var(--text-secondary)]" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Link
                    href="/api/auth/sign-out"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--negative)] hover:bg-[var(--accent)] transition-colors"
                  >
                    <LogOut size={14} />
                  </Link>
                </div>
              </div>
            }
          />
        }
        sidebarCollapsed={sidebarCollapsed}
      >
        {children}
      </AppShell>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' },
        }}
      />
    </>
  );
}
