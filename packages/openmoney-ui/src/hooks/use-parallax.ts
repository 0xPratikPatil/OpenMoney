'use client';

import { useScrollProgress } from './use-scroll-progress';

interface UseParallaxOptions {
  /** Speed multiplier. Positive = moves faster than scroll. Negative = slower/opposite. */
  speed?: number;
  /** Direction: 'vertical' | 'horizontal' */
  direction?: 'vertical' | 'horizontal';
}

/**
 * Returns a CSS transform style string based on scroll progress.
 * Attach to `style={{ transform: transformStyle }}` on a motion element.
 *
 * @example
 * const style = useParallax({ speed: 0.3 });
 * return <motion.div style={style}>Parallax content</motion.div>
 */
export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.3, direction = 'vertical' } = options;
  const progress = useScrollProgress();

  const offset = progress * speed * 100;

  if (direction === 'horizontal') {
    return { transform: `translateX(${offset}%)` };
  }
  return { transform: `translateY(${offset}%)` };
}
