'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountUpOptions {
  /** Target number to animate to */
  target: number;
  /** Animation duration in ms. Default: 1500 */
  duration?: number;
  /** Easing function. Default: easeOutExpo-like (t => 1 - Math.pow(1 - t, 3)) */
  easing?: (t: number) => number;
  /** Format function applied to the current value. Default: n => n.toString() */
  format?: (value: number) => string;
  /** Start counting when this becomes true. Default: true */
  start?: boolean;
  /** Number of decimal places. Default: 0 */
  decimals?: number;
}

/**
 * Animates a number from 0 to target over duration.
 * Returns the current animated value string.
 *
 * @example
 * const value = useCountUp({ target: 2400000, format: n => `$${n.toLocaleString()}` });
 * return <span>{value}</span>
 */
export function useCountUp(options: UseCountUpOptions) {
  const {
    target,
    duration = 1500,
    easing = (t: number) => 1 - Math.pow(1 - t, 3),
    format = (n: number) => n.toLocaleString(),
    start = true,
    decimals = 0,
  } = options;

  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      const easedT = easing(t);
      const value = target * easedT;
      setCurrent(Number(value.toFixed(decimals)));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    },
    [target, duration, easing, decimals]
  );

  useEffect(() => {
    if (!start) {
      setCurrent(0);
      return;
    }
    startTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [start, animate]);

  return format(current);
}
