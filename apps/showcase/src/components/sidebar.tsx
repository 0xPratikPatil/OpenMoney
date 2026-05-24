'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@openmoney/ui';
import { Palette, Component, LayoutDashboard } from 'lucide-react';

const navGroups = [
  { label: 'OVERVIEW', items: [{ label: 'Home', href: '/', icon: LayoutDashboard }] },
  { label: 'DESIGN', items: [{ label: 'Tokens', href: '/tokens', icon: Palette }] },
  { label: 'COMPONENTS', items: [{ label: 'All Components', href: '/components', icon: Component }] },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 h-screen flex flex-col border-r border-foreground/10 bg-background">
      <div className="flex items-center gap-2 h-10 px-3 border-b border-foreground/10">
        <span className="font-mono text-foreground text-sm font-bold">O</span>
        <span className="text-xs font-semibold tracking-tight">OpenMoney</span>
        <span className="font-mono text-[9px] text-muted-foreground ml-auto">v0.0.1</span>
      </div>
      <nav className="flex-1 py-2 px-1.5 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      'relative flex items-center gap-2.5 px-2.5 h-8 rounded-md text-xs font-medium transition-colors no-underline',
                      isActive ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                    )}>
                    {isActive && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-foreground" />}
                    <Icon size={15} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-2 border-t border-foreground/10">
        <p className="font-mono text-[9px] text-muted-foreground text-center">Design System</p>
      </div>
    </aside>
  );
}
