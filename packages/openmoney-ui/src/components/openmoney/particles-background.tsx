'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   ParticlesBackground
   Subtle canvas-based particle system for hero backgrounds.
   Particles are small dots that drift slowly and connect with thin lines
   when they are close to each other, creating a network effect.

   Follows DESIGN.md: dark-first, surface-0 background, subtle brand-dim
   coloration. Respects prefers-reduced-motion by rendering static dots.
   Cleans up animation frame and resize observer on unmount.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Types ───────────────────────────────────────────────────────────────── */

export interface ParticlesBackgroundProps {
  /** Number of particles to render. Default: 80 */
  particleCount?: number;
  /** Color of particles and connecting lines. Default: 'var(--brand-dim)' */
  color?: string;
  /** Animation speed preset. Default: 'default' */
  speed?: 'slow' | 'default' | 'fast';
  /** Maximum distance in px for particles to connect with lines. Default: 150 */
  connectDistance?: number;
  /** Additional CSS classes on the canvas wrapper */
  className?: string;
}

/* ── Particle ────────────────────────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

/* ── Speed presets ───────────────────────────────────────────────────────── */

const speedFactors: Record<NonNullable<ParticlesBackgroundProps['speed']>, number> = {
  slow: 0.3,
  default: 0.6,
  fast: 1.2,
};

/* ── Component ───────────────────────────────────────────────────────────── */

/**
 * Canvas-based particle network background that responds to container size.
 * Uses requestAnimationFrame for smooth 60fps animation.
 * On prefers-reduced-motion, particles render statically without animation.
 */
export function ParticlesBackground({
  particleCount = 80,
  color = 'var(--brand-dim)',
  speed = 'default',
  connectDistance = 150,
  className,
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  /* ── Initialize particles ──────────────────────────────────────────────── */

  const initParticles = useCallback(
    (width: number, height: number) => {
      const factor = speedFactors[speed];
      const particles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * factor,
          vy: (Math.random() - 0.5) * factor,
          size: Math.random() * 2 + 1, // 1–3px dots
        });
      }

      return particles;
    },
    [particleCount, speed],
  );

  /* ── Render / animate loop ─────────────────────────────────────────────── */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    let width: number;
    let height: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      particlesRef.current = initParticles(width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    /* ── Draw loop ──────────────────────────────────────────────────────── */

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const connectDist = connectDistance;
      const dotColor = color;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle (unless reduced motion)
        if (!prefersReducedMotion.current) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around edges
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.6;
        ctx.fill();

        // Check connections to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            // Opacity falls off with distance
            const opacity = (1 - dist / connectDist) * 0.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = dotColor;
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Draw once immediately even with reduced motion
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, [particleCount, color, speed, connectDistance, initParticles]);

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
