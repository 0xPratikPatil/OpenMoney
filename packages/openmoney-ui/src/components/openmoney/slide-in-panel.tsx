import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { cn } from "../../lib/utils";

interface SlideInPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  side?: "right" | "left";
}

function SlideInPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  side = "right",
}: SlideInPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("sm:max-w-lg", className)}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle className="text-xl font-semibold tracking-tight">{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="mt-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export { SlideInPanel };
