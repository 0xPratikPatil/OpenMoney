'use client';

import * as React from "react";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";

interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

function TopBar({ left, center, right, className, ...props }: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-12 items-center justify-between border-b border-border bg-background px-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 flex-1">{left}</div>
      {center && (
        <>
          <div className="flex items-center gap-3 flex-1 justify-center">{center}</div>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}
      <div className="flex items-center gap-3 flex-1 justify-end">{right}</div>
    </header>
  );
}

export { TopBar };
export type { TopBarProps };
