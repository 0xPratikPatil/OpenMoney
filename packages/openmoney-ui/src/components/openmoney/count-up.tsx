'use client';

import { motion } from 'motion/react';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   CountUp — animated number counter from 0 to a target value.
   Uses useCountUp hook with easing, wrapped in a tabular-nums span.

   Follows DESIGN.md: 1500ms default, font-mono tabular-nums for alignment.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface CountUpProps {
  /** Target number to animate to */
  target: number;
  /** Animation duration in ms. Default: 1500 */
  duration?: number;
  /** Prefix string rendered before the number (e.g. "$") */
  prefix?: string;
  /** Suffix string rendered after the number (e.g. "%") */
  suffix?: string;
  /** Number of decimal places shown. Default: 0 */
  decimals?: number;
  /** Additional CSS classes */
  className?: string;
  /** Start counting on mount. Default: true */
  start?: boolean;
}

/**
 * Animated number counter that counts from 0 to the target value over a
 * configurable duration. Ideal for dashboard KPIs, metric cards,
 * and portfolio values that animate into view.
 *
 * @example
 * <CountUp target={2400000} prefix="$" decimals={2} />
 *
 * @example
 * <CountUp target={85.7} suffix="%" decimals={1} duration={2000} />
 */
export function CountUp({
  target,
  duration = 1500,
  prefix,
  suffix,
  decimals = 0,
  className,
  start = true,
}: CountUpProps) {
  const value = useCountUp({
    target,
    duration,
    start,
    decimals,
    format: (n) => {
      const fixed = n.toFixed(decimals);
      // Use Intl for locale-aware formatting that preserves decimals
      const [intPart, fracPart] = fixed.split('.');
      const formatted = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return fracPart !== undefined ? `${formatted}.${fracPart}` : formatted;
    },
  });

  return (
    <motion.span
      className={cn('font-mono tabular-nums', className)}
      initial={{ opacity: 0, y: 4 }}
      animate={start ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {prefix}
      {value}
      {suffix}
    </motion.span>
  );
}
