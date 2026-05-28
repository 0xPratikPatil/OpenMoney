'use client';

import { motion, useScroll, useTransform, type HTMLMotionProps } from 'motion/react';
import { useRef, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   ParallaxLayer — moves element at a different rate than the scroll.
   Restrained: subtle speed values only. Never dramatic.
   Follows DESIGN.md: no parallax inside the product. Marketing only.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ParallaxLayerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Speed multiplier. Negative = moves opposite direction. Default: 0.3 */
  speed?: number;
  /** Direction. Default: 'vertical' */
  direction?: 'vertical' | 'horizontal' | 'opacity';
  /** CSS class */
  className?: string;
}

export function ParallaxLayer({
  children,
  speed = 0.3,
  direction = 'vertical',
  className,
  ...props
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const transformValue = useTransform(scrollYProgress, [0, 1], [speed * 64, -speed * 64]);
  const opacityValue = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);

  const style =
    direction === 'opacity'
      ? { opacity: opacityValue }
      : {
          [direction === 'horizontal' ? 'x' : 'y']: transformValue,
        };

  return (
    <motion.div ref={ref} style={style} className={className} {...props}>
      {children}
    </motion.div>
  );
}
