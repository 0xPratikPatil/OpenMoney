'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, Badge } from '@openmoney/ui';
import { Palette, Component, LayoutDashboard, Sparkles, Layers, Zap } from 'lucide-react';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Home', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'DESIGN',
    items: [
      { label: 'Tokens', href: '/tokens', icon: Palette },
    ],
  },
  {
    label: 'COMPONENTS',
    items: [
      { label: 'All Components', href: '/components', icon: Component },
    ],
  },
  {
    label: 'PREMIUM',
    items: [
      { label: 'Motion', href: '/components#motion', icon: Sparkles },
      { label: 'New', href: '/components#premium', icon: Zap, badge: '13' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 h-screen flex flex-col border-r border-border bg-surface-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 h-11 px-3.5 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center shrink-0">
          <span className="text-black font-bold text-[10px] font-mono">OM</span>
        </div>
        <span className="text-xs font-semibold tracking-tight">OpenMoney</span>
        <span className="font-mono text-[10px] text-text-tertiary ml-auto">v0.1.0</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('#')[0]!);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] font-medium transition-colors duration-150 no-underline',
                      isActive
                        ? 'bg-surface-2 text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-1'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" />
                    )}
                    <Icon size={15} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto font-mono text-[9px] py-0 px-1.5 h-4">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" />
          <span className="font-mono text-[9px] text-text-tertiary">Dark-first · React 19</span>
        </div>
      </div>
    </aside>
  );
}
