'use client';

import { useState, useEffect } from 'react';

interface UseScrollProgressOptions {
  /** Element ID to track progress of a specific section. Defaults to window. */
  targetId?: string;
  /** Offset from top (e.g., for sticky headers). Default: 0 */
  offset?: number;
}

/**
 * Returns 0-1 scroll progress value.
 * Without targetId: tracks full page scroll.
 * With targetId: tracks when target is in view and its scroll progress.
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}) {
  const { targetId, offset = 0 } = options;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function calculateProgress() {
      if (targetId) {
        const el = document.getElementById(targetId);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elHeight = rect.height;
        const scrollTop = -rect.top + offset;
        const maxScroll = elHeight - window.innerHeight + offset;
        if (maxScroll <= 0) {
          setProgress(rect.top <= 0 ? 1 : 0);
          return;
        }
        setProgress(Math.max(0, Math.min(1, scrollTop / maxScroll)));
      } else {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) {
          setProgress(0);
          return;
        }
        setProgress(Math.max(0, Math.min(1, scrollTop / docHeight)));
      }
    }

    calculateProgress();
    window.addEventListener('scroll', calculateProgress, { passive: true });
    return () => window.removeEventListener('scroll', calculateProgress);
  }, [targetId, offset]);

  return progress;
}
