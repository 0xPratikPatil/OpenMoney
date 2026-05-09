'use client';

import * as React from "react";
import { cn } from "../../lib/utils";

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  statusBar?: React.ReactNode;
}

function AppShell({
  sidebar,
  topbar,
  children,
  statusBar,
  sidebarCollapsed = false,
  className,
  ...props
}: AppShellProps) {
  return (
    <div className={cn("flex h-screen bg-background text-foreground", className)} {...props}>
      {sidebar}
      <div className="flex flex-1 flex-col overflow-hidden">
        {topbar}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        {statusBar && (
          <footer className="flex h-6 items-center justify-between border-t border-border px-4 text-[11px] font-mono text-muted-fg">
            {statusBar}
          </footer>
        )}
      </div>
    </div>
  );
}

export { AppShell };
export type { AppShellProps };
