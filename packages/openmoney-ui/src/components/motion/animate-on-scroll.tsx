'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   AnimateOnScroll — triggers specified animation when element enters viewport.
   Wraps motion.div with scroll-based triggers. One-time by default.
   Follows DESIGN.md: fade-in + subtle slide, once=true, 150-300ms.
   ═══════════════════════════════════════════════════════════════════════════ */

export type ScrollAnimation = 'fade-in' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in';

export interface AnimateOnScrollProps {
  children: ReactNode;
  /** Which animation to play. Default: 'fade-up' */
  animation?: ScrollAnimation;
  /** Duration in seconds. Default: 0.3 */
  duration?: number;
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** Trigger only once. Default: true */
  once?: boolean;
  /** Viewport threshold (0-1). Default: 0.1 */
  threshold?: number;
  /** CSS class */
  className?: string;
}

const animationConfig: Record<ScrollAnimation, Variants> = {
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'fade-up': {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-left': {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function AnimateOnScroll({
  children,
  animation = 'fade-up',
  duration = 0.3,
  delay = 0,
  once = true,
  threshold = 0.1,
  className,
}: AnimateOnScrollProps) {
  const variants = animationConfig[animation];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
