'use client';

import { useCallback, useRef } from 'react';

interface UseAnimateInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Triggers when an element enters the viewport using IntersectionObserver.
 * Returns a ref to attach to the element and `isInView` boolean.
 *
 * @example
 * const { ref, isInView } = useAnimateInView({ once: true });
 * return <motion.div ref={ref} animate={isInView ? { opacity: 1 } : { opacity: 0 }} />
 */
export function useAnimateInView(options: UseAnimateInViewOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options;
  const elementRef = useRef<HTMLElement | null>(null);
  const isInViewRef = useRef(false);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node || !('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            isInViewRef.current = true;
            if (once) observer.disconnect();
          } else if (!once) {
            isInViewRef.current = false;
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(node);
      elementRef.current = node;
    },
    [threshold, rootMargin, once]
  );

  return { ref, get isInView() { return isInViewRef.current; } };
}
