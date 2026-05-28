'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { type ReactNode, type CSSProperties, Children, isValidElement } from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   BentoGrid & BentoGridItem — responsive grid of cards with configurable
   column and row spans.

   Cards sit on a CSS Grid where each item declares its colSpan and rowSpan.
   On hover, the card lifts 2px with a 150ms ease-out — no shadow, per
   DESIGN.md depth conventions.

   The grid auto-fills with 1-column fallback on mobile (< 640px).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── BentoGrid ─────────────────────────────────────────────────────────── */

export interface BentoGridProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Number of columns. Default: 3 */
  columns?: number;
  /** Gap between grid items, mapped to Tailwind gap scale. Default: 'md' (12px) */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional wrapper classes */
  className?: string;
  /** Grid children — should be BentoGridItem instances */
  children: ReactNode;
}

const gapMap = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

/**
 * Responsive bento grid container.
 *
 * @example
 * ```tsx
 * <BentoGrid columns={4} gap="lg">
 *   <BentoGridItem colSpan={2} rowSpan={2}>
 *     <LargeCard />
 *   </BentoGridItem>
 *   <BentoGridItem colSpan={1} rowSpan={1}>
 *     <SmallCard />
 *   </BentoGridItem>
 * </BentoGrid>
 * ```
 */
export function BentoGrid({
  columns = 3,
  gap = 'md',
  className,
  children,
  ...props
}: BentoGridProps) {
  const gapPx = gapMap[gap];

  const style: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gapPx}px`,
    // On mobile (< 640px), collapse to single column
    // Using a CSS custom property + inline style is cleaner than a media query here;
    // Tailwind handles the responsive override.
  };

  // Build responsive column mapping — at small screens, force 1 column
  const responsiveColumns = {
    '--bento-columns': columns.toString(),
  } as CSSProperties;

  return (
    <motion.div
      className={cn(
        'grid gap-3',
        // Force single column on very small screens
        'grid-cols-1',
        // Two columns at sm
        'sm:grid-cols-2',
        // Expand to full column count at md+
        columns >= 3 && 'md:grid-cols-3',
        columns >= 4 && 'lg:grid-cols-4',
        className,
      )}
      style={{ ...style, gap: undefined }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

BentoGrid.displayName = 'BentoGrid';

/* ── BentoGridItem ─────────────────────────────────────────────────────── */

export interface BentoGridItemProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Number of columns this item spans. Default: 1 */
  colSpan?: number;
  /** Number of rows this item spans. Default: 1 */
  rowSpan?: number;
  /** Additional item classes */
  className?: string;
  /** Card content */
  children: ReactNode;
}

/**
 * A single cell within a BentoGrid.
 *
 * Renders as a surface-1 card with border. On hover, lifts 2px with
 * a restrained 150ms ease-out — no shadow, no scale. The subtle
 * translateY is the sole depth cue, in keeping with DESIGN.md's
 * flat-card philosophy.
 */
export function BentoGridItem({
  colSpan = 1,
  rowSpan = 1,
  className,
  children,
  ...props
}: BentoGridItemProps) {
  return (
    <motion.div
      className={cn(
        'rounded-lg border bg-surface-1 text-text-primary p-5',
        className,
      )}
      style={{
        gridColumn: `span ${Math.max(1, colSpan)} / span ${Math.max(1, colSpan)}`,
        gridRow: `span ${Math.max(1, rowSpan)} / span ${Math.max(1, rowSpan)}`,
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

BentoGridItem.displayName = 'BentoGridItem';
