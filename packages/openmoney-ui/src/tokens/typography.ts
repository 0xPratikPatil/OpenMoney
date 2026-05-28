/**
 * OpenMoney Design Tokens — Typography
 *
 * All typographic tokens matching DESIGN.md spec.
 * Font families: Geist (sans), Geist Mono (mono)
 *
 * @see DESIGN.md — Typography section
 */

import type { CSSProperties } from 'react';

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: CSSProperties['fontWeight'];
  lineHeight: number | string;
  letterSpacing: string;
}

export const typography = {
  display: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '48px',
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-1.44px',
  },
  h1: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: '-0.72px',
  },
  h2: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.36px',
  },
  h3: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '-0.24px',
  },
  bodyLg: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0',
  },
  body: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  bodySm: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.45,
    letterSpacing: '0',
  },
  labelMd: {
    fontFamily: "var(--font-mono), 'Geist Mono', monospace",
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '0.06em',
  },
  labelSm: {
    fontFamily: "var(--font-mono), 'Geist Mono', monospace",
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '0.08em',
  },
  caption: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '11px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  code: {
    fontFamily: "var(--font-mono), 'Geist Mono', monospace",
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  monoData: {
    fontFamily: "var(--font-mono), 'Geist Mono', monospace",
    fontSize: '24px',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  monoMetric: {
    fontFamily: "var(--font-mono), 'Geist Mono', monospace",
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  buttonMd: {
    fontFamily: "var(--font-sans), 'Geist', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0',
  },
} as const satisfies Record<string, TypographyToken>;

export type TypographyTokenName = keyof typeof typography;
