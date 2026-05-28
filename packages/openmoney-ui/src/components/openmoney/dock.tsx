'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Dock
   macOS-style floating dock navigation with magnification on hover.
   Items scale up smoothly when the cursor is near them, creating a
   fluid magnification effect. Active item shows brand accent indicator.

   Follows DESIGN.md: dark glassy surface-2, subtle border, 
   animation 150ms ease-out, no spring/bounce, brand accent.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Types ───────────────────────────────────────────────────────────────── */

export interface DockProps {
  /** Dock position on screen */
  position?: 'bottom' | 'top';
  /** Magnification multiplier on hover (1 = no magnification). Default: 1.5 */
  magnification?: number;
  /** Additional classes */
  className?: string;
  /** Dock items */
  children: ReactNode;
}

export interface DockItemProps {
  /** Lucide icon to display */
  icon: LucideIcon;
  /** Label for the tooltip shown on hover */
  label: string;
  /** Optional href — renders as a link if provided */
  href?: string;
  /** Whether this item is the currently active/selected one */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

/* ── Internal: Dock context for mouse tracking ───────────────────────────── */

interface DockContextValue {
  mouseX: number;
  dockRect: DOMRect | null;
  magnification: number;
}

const DockContext = createContext<DockContextValue>({
  mouseX: -Infinity,
  dockRect: null,
  magnification: 1.5,
});

function useDockContext() {
  return useContext(DockContext);
}

/* ── Dock container ──────────────────────────────────────────────────────── */

/**
 * Floating dock container with glassy dark background and subtle border.
 * Tracks mouse position to drive item magnification.
 */
export function Dock({
  position = 'bottom',
  magnification = 1.5,
  className,
  children,
}: DockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number>(-Infinity);
  const [dockRect, setDockRect] = useState<DOMRect | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDockRect(rect);
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(-Infinity);
  }, []);

  const positionStyles =
    position === 'bottom'
      ? 'bottom-4 left-1/2 -translate-x-1/2'
      : 'top-4 left-1/2 -translate-x-1/2';

  return (
    <DockContext.Provider value={{ mouseX, dockRect, magnification }}>
      <div
        ref={containerRef}
        className={cn(
          'fixed z-40 flex items-end gap-1',
          positionStyles,
          className,
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="navigation"
        aria-label="Dock navigation"
      >
        <div
          className={cn(
            'flex items-end gap-1 rounded-2xl px-3 py-2',
            'bg-[var(--surface-2)]/85 backdrop-blur-xl',
            'border border-[var(--border-subtle)]',
          )}
        >
          {children}
        </div>
      </div>
    </DockContext.Provider>
  );
}

/* ── DockItem ────────────────────────────────────────────────────────────── */

/** Width of each dock icon in pixels (unscaled) */
const ICON_SIZE = 48;
/** Gap between icons in pixels */
const ICON_GAP = 4;
/** The total width an icon occupies in the dock (icon + gap) */
const ICON_SLOT_WIDTH = ICON_SIZE + ICON_GAP;

/**
 * Individual dock item with icon, magnification on hover, and label tooltip.
 * Active items get a brand accent dot indicator below the icon.
 */
export function DockItem({
  icon: Icon,
  label,
  href,
  active = false,
  onClick,
  className,
}: DockItemProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const { mouseX, dockRect, magnification } = useDockContext();

  // Calculate magnification based on cursor proximity
  const getScale = (): number => {
    if (!dockRect || !iconRef.current || mouseX === -Infinity) return 1;
    const iconRect = iconRef.current.getBoundingClientRect();
    // Distance from cursor to icon center
    const iconCenterX = iconRect.left + iconRect.width / 2;
    const distance = Math.abs(mouseX - iconCenterX);

    // Influence radius — icons within this distance get magnified
    const maxDistance = ICON_SLOT_WIDTH * 1.5;
    if (distance > maxDistance) return 1;

    // Smooth falloff: closer = bigger
    const t = 1 - distance / maxDistance;
    return 1 + (magnification - 1) * t;
  };

  const scale = getScale();
  const isHovered = mouseX !== -Infinity && dockRect !== null && scale > 1.05;

  const content = (
    <motion.div
      ref={iconRef}
      className={cn(
        'relative flex items-center justify-center',
        'rounded-xl',
        'transition-colors duration-150 ease-out',
        'hover:bg-[var(--accent)]',
        active && 'bg-[var(--surface-3)]',
        className,
      )}
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        // Subtle spring-like feel with tween-based scale
        transformOrigin: 'bottom center',
      }}
      animate={{
        scale,
      }}
      transition={{
        type: 'tween',
        duration: 0.15,
        ease: 'easeOut',
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Icon
        className={cn(
          'size-5 transition-colors duration-150 ease-out',
          active
            ? 'text-[var(--brand)]'
            : isHovered
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)]',
        )}
        strokeWidth={1.5}
      />

      {/* Active indicator — brand accent dot below the icon */}
      {active && (
        <motion.div
          className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--brand)]"
          layoutId="dock-active-indicator"
          transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  );

  return (
    <div className="relative flex flex-col items-center">
      {href ? (
        <a
          href={href}
          onClick={(e) => {
            onClick?.();
            // Don't prevent default if it's a real navigation
          }}
          className="block"
          aria-label={label}
        >
          {content}
        </a>
      ) : (
        <div onClick={onClick}>{content}</div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={cn(
              'pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2',
              'whitespace-nowrap rounded-md px-2.5 py-1',
              'bg-[var(--surface-3)] text-xs text-[var(--text-primary)]',
              'border border-[var(--border-subtle)]',
            )}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

