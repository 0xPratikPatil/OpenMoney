'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   StaggerChildren — staggers animation for a list of child elements.
   Each child appears one after another with configurable delay.
   Follows DESIGN.md: 50ms stagger steps, slide-in-up, ease-out.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface StaggerChildrenProps {
  children: ReactNode;
  /** Delay between each child's start (seconds). Default: 0.05 */
  staggerDelay?: number;
  /** Duration of each child's animation (seconds). Default: 0.2 */
  childDuration?: number;
  /** Animation direction for children. Default: 'up' */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Distance in px. Default: 8 */
  distance?: number;
  /** CSS class */
  className?: string;
}

const directionOffsets: Record<NonNullable<StaggerChildrenProps['direction']>, { x?: number; y?: number }> = {
  none: {},
  up: { y: 8 },
  down: { y: -8 },
  left: { x: 8 },
  right: { x: -8 },
};

export function StaggerChildren({
  children,
  staggerDelay = 0.05,
  childDuration = 0.2,
  direction = 'up',
  distance = 8,
  className,
}: StaggerChildrenProps) {
  const dir = directionOffsets[direction];
  const x = (dir.x ?? 0) * (distance / 8);
  const y = (dir.y ?? 0) * (distance / 8);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, x, y },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: childDuration, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
