'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@openmoney/ui';
import { Sparkles, Palette, Component, LayoutDashboard } from 'lucide-react';

const navGroups = [
  { label: 'Overview', items: [{ label: 'Home', href: '/', icon: LayoutDashboard }] },
  { label: 'Design', items: [{ label: 'Tokens', href: '/tokens', icon: Palette }] },
  { label: 'Components', items: [{ label: 'All Components', href: '/components', icon: Component }] },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 h-screen flex flex-col border-r border-sidebar-border bg-sidebar-bg">
      <div className="flex items-center gap-3 h-14 px-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
          <Sparkles size={15} className="text-accent-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight">OpenMoney</span>
          <p className="text-[10px] text-muted-foreground">Design System</p>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-150 no-underline',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    {item.label}
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground text-center">v0.0.1 · Emerald</p>
      </div>
    </aside>
  );
}
