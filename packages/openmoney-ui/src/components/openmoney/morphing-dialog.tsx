'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   MorphingDialog
   Dialog that morphs from a trigger element into the full dialog using
   motion/react layoutId. The trigger and content share a layoutId so
   motion animates between them seamlessly.

   Follows DESIGN.md: 0.2rem radius, dark surfaces, surface ladder,
   animation 200ms ease-out, no bounce, no springs.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Context ─────────────────────────────────────────────────────────────── */

const MORPHING_LAYOUT_ID = 'morphing-dialog-content';

interface MorphingDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: DOMRect | null;
  triggerRef: (el: HTMLElement | null) => void;
}

const MorphingDialogContext = createContext<MorphingDialogContextValue | null>(null);

function useMorphingDialog() {
  const ctx = useContext(MorphingDialogContext);
  if (!ctx) {
    throw new Error('MorphingDialog components must be used within <MorphingDialog>');
  }
  return ctx;
}

/* ── MorphingDialog (wrapper) ────────────────────────────────────────────── */

export interface MorphingDialogProps {
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Dialog content and trigger must be children */
  children: ReactNode;
  className?: string;
}

/**
 * Root wrapper that manages open/close state for the morphing dialog.
 * Must contain a MorphingDialogTrigger and MorphingDialogContent.
 */
export function MorphingDialog({
  open: controlledOpen,
  onOpenChange,
  children,
  className,
}: MorphingDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const triggerRef = useCallback((el: HTMLElement | null) => {
    setTriggerEl(el);
    if (el) setTriggerRect(el.getBoundingClientRect());
  }, []);

  // Update trigger rect on scroll/resize while dialog is closed
  useEffect(() => {
    if (open || !triggerEl) return;
    const handle = () => {
      if (triggerEl) setTriggerRect(triggerEl.getBoundingClientRect());
    };
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [open, triggerEl]);

  return (
    <MorphingDialogContext.Provider value={{ open, setOpen, triggerRect, triggerRef }}>
      <div className={cn(className)}>{children}</div>
    </MorphingDialogContext.Provider>
  );
}

/* ── MorphingDialogTrigger ───────────────────────────────────────────────── */

export interface MorphingDialogTriggerProps {
  /** Content rendered inside the trigger (icon, text, etc.) */
  children: ReactNode;
  className?: string;
}

/**
 * The trigger element the user clicks to open the dialog.
 * During open, this element is hidden (opacity-0) while the morphing
 * overlay animates to the full dialog size.
 */
export function MorphingDialogTrigger({ children, className }: MorphingDialogTriggerProps) {
  const { open, setOpen, triggerRef } = useMorphingDialog();

  return (
    <div
      ref={triggerRef}
      className={cn(
        'inline-flex cursor-pointer',
        open && 'invisible',
        className,
      )}
      onClick={() => setOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
      }}
    >
      {children}
    </div>
  );
}

/* ── MorphingDialogContent ───────────────────────────────────────────────── */

export interface MorphingDialogContentProps {
  /** Dialog title shown in the header */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /** Main content of the dialog */
  children?: ReactNode;
  className?: string;
}

/**
 * The expanded dialog content. When open, this animates from the trigger's
 * position using layoutId to morph into a full modal overlay.
 */
export function MorphingDialogContent({
  title,
  description,
  children,
  className,
}: MorphingDialogContentProps) {
  const { open, setOpen, triggerRect } = useMorphingDialog();
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, setOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const triggerStyle: React.CSSProperties | undefined = triggerRect
    ? {
        position: 'fixed',
        top: triggerRect.top,
        left: triggerRect.left,
        width: triggerRect.width,
        height: triggerRect.height,
        borderRadius: 'var(--radius-lg)',
      }
    : undefined;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Morphing overlay — starts at trigger position, expands to center */}
          <motion.div
            ref={contentRef}
            layoutId={MORPHING_LAYOUT_ID}
            className={cn(
              'fixed z-50 overflow-hidden',
              'bg-[var(--surface-2)]',
              'border border-[var(--border)]',
              'shadow-2xl',
              className,
            )}
            style={{
              ...triggerStyle,
              borderRadius: triggerRect ? 'var(--radius-lg)' : 'var(--radius-xl)',
            }}
            initial={false}
            animate={{
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              width: triggerRect
                ? `min(calc(100vw - 2rem), 28rem)`
                : 'min(calc(100vw - 2rem), 28rem)',
              height: 'auto',
              borderRadius: 'var(--radius-xl)',
            }}
            exit={{
              ...(triggerRect
                ? {
                    top: triggerRect.top,
                    left: triggerRect.left,
                    x: 0,
                    y: 0,
                    width: triggerRect.width,
                    height: triggerRect.height,
                    borderRadius: 'var(--radius-lg)',
                  }
                : {}),
              opacity: 0,
            }}
            transition={{
              type: 'tween',
              duration: 0.25,
              ease: [0.25, 0.1, 0.25, 1], // ease-out cubic
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Dialog'}
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 pb-0">
              <div className="min-w-0">
                {title && (
                  <h2 className="text-lg font-semibold leading-none tracking-tight text-[var(--text-primary)]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-[var(--radius-md)] p-1.5 text-[var(--text-tertiary)] transition-colors duration-150 ease-out hover:bg-[var(--accent)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 text-sm text-[var(--text-secondary)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
