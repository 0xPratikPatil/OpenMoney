import * as React from "react";
import { cn } from "../../lib/utils";

type CalloutVariant = "info" | "warn" | "error" | "success";

interface CalloutProps {
  variant: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig: Record<CalloutVariant, { borderColor: string; textColor: string }> = {
  info:    { borderColor: "border-l-chart-1",   textColor: "text-chart-1" },
  warn:    { borderColor: "border-l-chart-3",   textColor: "text-chart-3" },
  error:   { borderColor: "border-l-destructive", textColor: "text-destructive" },
  success: { borderColor: "border-l-chart-2",   textColor: "text-chart-2" },
};

function Callout({ variant, title, children, onClose, className }: CalloutProps) {
  const config = variantConfig[variant];

  return (
    <div role="alert"
      className={cn(
        "relative flex gap-3 rounded-md border border-border border-l-4 border-l-solid p-4",
        config.borderColor,
        className,
      )}>
      <div className="min-w-0 flex-1">
        {title && <h5 className={cn("text-sm font-semibold leading-snug", config.textColor)}>{title}</h5>}
        <div className={cn("text-sm text-muted-foreground leading-relaxed", title && "mt-1")}>
          {children}
        </div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss"
          className="size-6 shrink-0 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export { Callout };
export type { CalloutProps, CalloutVariant };
