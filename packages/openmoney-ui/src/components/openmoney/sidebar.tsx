import * as React from "react";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  href?: string;
  badge?: string | number;
  onClick?: () => void;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  sections: SidebarSection[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

function Sidebar({
  sections,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  className,
  ...props
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-background transition-all duration-250 ease-out",
        collapsed ? "w-16" : "w-60",
        className
      )}
      {...props}
    >
      {header && <div className={cn("flex items-center h-12 px-4", collapsed && "justify-center px-0")}>{header}</div>}

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && !collapsed && (
              <p className="px-2 pb-1 text-xs font-mono uppercase tracking-wider text-muted-fg">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors duration-150",
                    "hover:bg-accent text-muted-fg hover:text-foreground",
                    item.active && "bg-accent text-foreground font-medium",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs font-mono tabular-nums text-muted-fg">{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {footer && (
        <>
          <Separator />
          <div className={cn("p-4", collapsed && "px-0 flex justify-center")}>{footer}</div>
        </>
      )}
    </aside>
  );
}

export { Sidebar };
export type { SidebarProps, SidebarItem, SidebarSection };
