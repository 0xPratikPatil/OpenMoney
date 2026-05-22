import * as React from "react";
import { cn } from "../../lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalloutVariant = "info" | "warn" | "error" | "success";

interface CalloutProps {
  variant: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------

const variantConfig: Record<CalloutVariant, { border: string; bg: string; titleColor: string }> = {
  info:    { border: "border-[var(--info)]/30",       bg: "bg-[var(--info-muted)]",       titleColor: "text-[var(--info)]" },
  warn:    { border: "border-[var(--warning)]/30",    bg: "bg-[var(--warning-muted)]",    titleColor: "text-[var(--warning)]" },
  error:   { border: "border-[var(--destructive)]/30", bg: "bg-[var(--destructive-muted)]", titleColor: "text-[var(--destructive)]" },
  success: { border: "border-[var(--success)]/30",    bg: "bg-[var(--success-muted)]",    titleColor: "text-[var(--success)]" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Callout({
  variant,
  title,
  children,
  onClose,
  className,
}: CalloutProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative flex gap-3 rounded-xl border p-4",
        config.border, config.bg,
        className,
      )}
    >
      {/* Content */}
      <div className="min-w-0 flex-1">
        {title && (
          <h5 className={cn("text-sm font-semibold", config.titleColor)}>{title}</h5>
        )}
        <div className={cn("text-sm text-[var(--text-secondary)] leading-relaxed", title && "mt-1")}>
          {children}
        </div>
      </div>

      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss"
          className="size-6 shrink-0 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors">
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
