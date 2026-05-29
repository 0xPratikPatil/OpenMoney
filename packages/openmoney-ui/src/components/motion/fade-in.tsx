'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode, HTMLAttributes } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   FadeIn — wraps children with configurable fade-in on mount.
   Follows DESIGN.md rules: duration 150-300ms, ease-out, no bounce.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Animation duration in seconds. Default: 0.3 */
  duration?: number;
  /** Delay before animation starts in seconds. Default: 0 */
  delay?: number;
  /** Fade direction. Default: 'none' (fade only) */
  direction?: 'none' | 'up' | 'down' | 'left' | 'right';
  /** Distance to travel in px. Default: 8 */
  distance?: number;
  /** If true, only animate when in viewport */
  animateOnView?: boolean;
  /** Viewport threshold for animateOnView. Default: 0.1 */
  threshold?: number;
}

const directionOffsets: Record<NonNullable<FadeInProps['direction']>, { x?: number; y?: number }> = {
  none: {},
  up: { y: -8 },
  down: { y: 8 },
  left: { x: -8 },
  right: { x: 8 },
};

export function FadeIn({
  children,
  duration = 0.3,
  delay = 0,
  direction = 'none',
  distance,
  animateOnView = false,
  threshold = 0.1,
  className,
  id,
}: FadeInProps) {
  const dir = directionOffsets[direction];
  const dist = distance ?? (direction === 'none' ? 0 : 8);
  const x = (dir.x ?? 0) * (dist / 8 > 0 ? dist / 8 : 1);
  const y = (dir.y ?? 0) * (dist / 8 > 0 ? dist / 8 : 1);

  const variants: Variants = {
    hidden: { opacity: 0, x, y },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      {...(animateOnView
        ? { whileInView: 'visible', viewport: { once: true, amount: threshold } }
        : { animate: 'visible' })}
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      id={id}
    >
      {children}
    </motion.div>
  );
}
