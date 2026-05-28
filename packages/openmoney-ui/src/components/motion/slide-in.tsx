'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   SlideIn — slides children in from a specified edge on mount.
   Follows DESIGN.md rules: 150-300ms, ease-out, restrained distance.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface SlideInProps {
  children: ReactNode;
  /** Slide direction. Default: 'up' */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Slide distance in px. Default: 16 */
  distance?: number;
  /** Duration in seconds. Default: 0.25 */
  duration?: number;
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** CSS class for wrapper */
  className?: string;
  /** Animate only once when element enters viewport */
  whileInView?: boolean;
  /** Viewport threshold. Default: 0.1 */
  threshold?: number;
}

const directionMap: Record<NonNullable<SlideInProps['direction']>, 'x' | 'y'> = {
  up: 'y',
  down: 'y',
  left: 'x',
  right: 'x',
};

const directionSign: Record<NonNullable<SlideInProps['direction']>, number> = {
  up: 1,
  down: -1,
  left: 1,
  right: -1,
};

export function SlideIn({
  children,
  direction = 'up',
  distance = 16,
  duration = 0.25,
  delay = 0,
  className,
  whileInView = false,
  threshold = 0.1,
}: SlideInProps) {
  const axis = directionMap[direction];
  const sign = directionSign[direction];
  const offset = distance * sign;

  const variants: Variants = {
    hidden: { opacity: 0, [axis]: offset },
    visible: { opacity: 1, [axis]: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      {...(whileInView
        ? { whileInView: 'visible', viewport: { once: true, amount: threshold } }
        : { animate: 'visible' })}
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
