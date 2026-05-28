---
version: alpha
name: OpenMoney
description: A dark-first quantitative finance platform design system engineered for precision, trust, and data density. Dark-only surfaces with high-contrast typography, a disciplined oklch palette, tight 0.2rem radius, and a single accent — a vivid teal-cyan that signals positive financial action and data integrity. The system treats information hierarchy as a structural problem: every pixel earns its place.

colors:
  background: "oklch(0.145 0 0)"
  foreground: "oklch(0.93 0 0)"
  card: "oklch(0.145 0 0)"
  card-foreground: "oklch(0.93 0 0)"
  popover: "oklch(0.145 0 0)"
  popover-foreground: "oklch(0.93 0 0)"
  primary: "oklch(0.93 0 0)"
  primary-foreground: "oklch(0.205 0 0)"
  secondary: "oklch(0.269 0 0)"
  secondary-foreground: "oklch(0.93 0 0)"
  muted: "oklch(0.205 0 0)"
  muted-foreground: "oklch(0.708 0 0)"
  accent: "oklch(0.269 0 0)"
  accent-foreground: "oklch(0.93 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-foreground: "oklch(0.637 0.237 25.331)"
  border: "oklch(0.205 0 0)"
  input: "oklch(0.205 0 0)"
  ring: "oklch(0.708 0 0)"
  positive: "oklch(0.696 0.17 162.48)"
  positive-bg: "oklch(0.25 0.06 162.48 / 0.18)"
  negative: "oklch(0.577 0.245 27.325)"
  negative-bg: "oklch(0.25 0.08 27.325 / 0.18)"
  warning: "oklch(0.769 0.188 70.08)"
  warning-bg: "oklch(0.25 0.08 70.08 / 0.18)"
  success: "oklch(0.696 0.17 162.48)"
  info: "oklch(0.488 0.243 264.376)"
  info-bg: "oklch(0.25 0.08 264.376 / 0.15)"
  brand: "oklch(0.65 0.18 180)"
  brand-dim: "oklch(0.45 0.12 180)"
  brand-border: "oklch(0.35 0.08 180)"
  brand-hover: "oklch(0.72 0.18 180)"
  brand-glow: "oklch(0.55 0.12 180 / 0.25)"
  chart-1: "oklch(0.646 0.222 41.116)"
  chart-2: "oklch(0.6 0.118 184.704)"
  chart-3: "oklch(0.398 0.07 227.392)"
  chart-4: "oklch(0.828 0.189 84.429)"
  chart-5: "oklch(0.769 0.188 70.08)"
  chart-6: "oklch(0.488 0.243 264.376)"
  chart-7: "oklch(0.627 0.265 303.9)"
  chart-8: "oklch(0.696 0.17 162.48)"
  surface-0: "oklch(0.145 0 0)"
  surface-1: "oklch(0.175 0 0)"
  surface-2: "oklch(0.205 0 0)"
  surface-3: "oklch(0.235 0 0)"
  text-primary: "oklch(0.93 0 0)"
  text-secondary: "oklch(0.75 0 0)"
  text-tertiary: "oklch(0.55 0 0)"
  text-inverse: "oklch(0.145 0 0)"
  border-strong: "oklch(0.30 0 0)"
  border-subtle: "oklch(0.18 0 0)"

typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -1.44px
  h1:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.72px
  h2:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.36px
  h3:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  label-md:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Geist Mono
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.08em
  caption:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  code:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  mono-data:
    fontFamily: Geist Mono
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.02em
  mono-metric:
    fontFamily: Geist Mono
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.03em
  button-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0

rounded:
  none: 0px
  sharp: 0px
  xs: calc(0.2rem - 2px)
  sm: calc(0.2rem - 1px)
  md: 0.2rem
  lg: calc(0.2rem + 2px)
  xl: calc(0.2rem + 4px)
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  3xl: 48px
  4xl: 64px
  section: 96px
  data-row: 44px
  metric-gap: 20px
  card-padding: 20px
  dashboard-gap: 20px
  input-height: 36px
  button-height-sm: 32px
  button-height-md: 36px
  button-height-lg: 44px
  icon-sm: 16px
  icon-md: 20px
  icon-lg: 24px

components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: "{spacing.button-height-md}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: "{spacing.button-height-md}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: "{spacing.button-height-md}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: "{spacing.button-height-md}"
  button-ghost-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "oklch(0.985 0.001 106.423)"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: "{spacing.button-height-md}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
    padding: 0
  text-input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
    height: "{spacing.input-height}"
  text-input-focus:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  card-code:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.sharp}"
    padding: "{spacing.lg}"
  badge-default:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "oklch(0.985 0.001 106.423)"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-positive:
    backgroundColor: "{colors.positive-bg}"
    textColor: "{colors.positive}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-negative:
    backgroundColor: "{colors.negative-bg}"
    textColor: "{colors.negative}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  metric-block:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  toast:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  sidebar:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    width: 240px
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 6px 10px
  nav-item-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
  table-row:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    height: 44px
  table-header:
    backgroundColor: "transparent"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.label-sm}"
    height: 36px
  code-block:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.foreground}"
    typography: "{typography.code}"
    rounded: "{rounded.sharp}"
    padding: 16px
  tab-default:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 6px 12px
  tab-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
  skeleton:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.xs}"
  tooltip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 6px 10px
  modal-overlay:
    backgroundColor: "oklch(0.145 0 0 / 0.7)"
  modal-content:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  checkbox:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xs}"
  dropdown-item:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 6px 8px
  dropdown-item-hover:
    backgroundColor: "{colors.accent}"
  slider-track:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.full}"
    height: 4px
  slider-thumb:
    backgroundColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    size: 16px
  toggle-off:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.full}"
  toggle-on:
    backgroundColor: "{colors.positive}"
    rounded: "{rounded.full}"
  progress-bar:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.full}"
    height: 4px
  progress-fill:
    backgroundColor: "{colors.positive}"
    rounded: "{rounded.full}"
  empty-state:
    backgroundColor: "transparent"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.body}"
    padding: "{spacing.3xl}"
  alert-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  alert-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  alert-error:
    backgroundColor: "{colors.negative-bg}"
    textColor: "{colors.negative}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  callout:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.none}"
    padding: 12px 16px
  dashboard-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.card-padding}"
  kbd:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.xs}"
    padding: 2px 6px
    height: 20px
  search-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 36px
  positive-value:
    textColor: "{colors.positive}"
    typography: "{typography.mono-data}"
  negative-value:
    textColor: "{colors.negative}"
    typography: "{typography.mono-data}"
  neutral-value:
    textColor: "{colors.text-primary}"
    typography: "{typography.mono-data}"
  connection-indicator-active:
    backgroundColor: "{colors.positive}"
    rounded: "{rounded.full}"
    size: 8px
  connection-indicator-error:
    backgroundColor: "{colors.negative}"
    rounded: "{rounded.full}"
    size: 8px
  connection-indicator-pending:
    backgroundColor: "{colors.warning}"
    rounded: "{rounded.full}"
    size: 8px
---

## Overview

OpenMoney's design language is built for a single purpose: **making financial data legible at speed.** Every visual decision — from the near-black background to the 0.2rem radius — serves information density without sacrificing composure.

### Visual Identity

The system operates in three registers:

1. **Chrome** — Navigation, toolbars, controls. Monochrome dark surfaces with hairline borders. Unobtrusive. Gets out of the way.
2. **Data** — Numbers, charts, tables, metrics. The protagonist. Monospace typography signals precision. Color is reserved for meaning (green = up, red = down).
3. **Action** — Buttons, inputs, interactive surfaces. A restrained teal-cyan accent (`{colors.brand}`) emerges only where human decision intersects with data.

**The page is not the product.** The data is the product. Every pixel of chrome that can be removed should be removed.

### Emotional Tone

- **Trustworthy.** Monospace numbers on dark surfaces feel like a Bloomberg terminal, not a toy.
- **Restrained.** Color appears only where it has meaning. Accent color is used at most once per viewport fold.
- **Precise.** The 0.2rem radius, 8px spacing base unit, and mono labels communicate that this is software for people who care about accuracy.
- **Modern, not cold.** Geist Sans carries the UI with warmth through its humanist proportions. The dark background reduces eye strain for professionals who spend hours in the product.

### Design Philosophy

**Information hierarchy is a structural problem, not a decorative one.** Before choosing a color or font weight, ask: what does the user need to know first? That's your hierarchy. Everything else is subordinate.

**Restraint is the premium signal.** The brands with the highest design quality — Linear, Stripe, Vercel, Apple — share one trait: they refuse decoration. Every visual element must justify its existence through function. If removing it doesn't hurt comprehension, remove it.

**Dark-first is not a preference; it's a requirement.** Financial professionals work across multiple monitors, often in low-light environments. Dark backgrounds reduce glare and cognitive fatigue. Light mode is provided as an accessibility accommodation, not a design target.

**Type drives the system.** Geist for UI, Geist Mono for data. Font weight, size, and spacing — not color — carry hierarchy. Headlines are set tight (tracking-tight). Labels are uppercase mono with wide tracking. The type scale alone should communicate structure.

## Colors

The palette is a disciplined oklch color space, dark-first, with semantic roles that map directly to financial data conventions.

### Surface Ladder

Four-step surface hierarchy — each notch lighter moves the element one step closer to the viewer. No shadows needed.

| Token | Value | Usage |
|-------|-------|-------|
| `{colors.surface-0}` | `oklch(0.145 0 0)` | Page background — the anchor. |
| `{colors.surface-1}` | `oklch(0.175 0 0)` | Cards, panels, code blocks. One step above canvas. |
| `{colors.surface-2}` | `oklch(0.205 0 0)` | Elevated cards, hovered rows, active nav items. |
| `{colors.surface-3}` | `oklch(0.235 0 0)` | Highest elevation — dropdowns, popovers, modals. |

### Text Hierarchy

| Token | Value | Usage |
|-------|-------|-------|
| `{colors.text-primary}` | `oklch(0.93 0 0)` | Headlines, primary body text, active states. |
| `{colors.text-secondary}` | `oklch(0.75 0 0)` | Secondary text, sidebar labels, descriptions. |
| `{colors.text-tertiary}` | `oklch(0.55 0 0)` | Metadata, timestamps, disabled states. |
| `{colors.text-inverse}` | `oklch(0.145 0 0)` | Text on primary/inverse surfaces. |

### Financial Semantics

Color carries meaning in finance. These tokens must NEVER be used for decoration — only for data communication.

| Token | Value | Semantic Meaning |
|-------|-------|------------------|
| `{colors.positive}` | `oklch(0.696 0.17 162.48)` | Gains, profits, upward movement, buy signals, success. |
| `{colors.negative}` | `oklch(0.577 0.245 27.325)` | Losses, downward movement, sell signals, errors, destruction. |
| `{colors.warning}` | `oklch(0.769 0.188 70.08)` | Volatility alerts, margin calls, pending actions, caution. |
| `{colors.info}` | `oklch(0.488 0.243 264.376)` | Informational callouts, news indicators, neutral context. |

### Brand Accent

The teal-cyan brand accent (`{colors.brand}`) is the system's only chromatic voice on chrome. It appears on:
- The brand mark and logo
- Primary CTA in auth flows and onboarding
- Active navigation indicators
- Focus rings (when the default `{colors.ring}` is insufficient)
- Provider connection status indicators

It must NEVER appear on:
- Section backgrounds or card fills
- Decorative gradients
- Body text or labels
- Multiple CTAs in a single viewport

### Chart Palette

Eight data-visualization colors in oklch. Designed for distinguishable categories in financial charts (portfolio allocation, sector breakdowns, correlation matrices). Ordered for sequential use; never reorder.

| Token | Color | Use |
|-------|-------|-----|
| `{colors.chart-1}` | Warm orange-red | Primary data series, largest allocation slice. |
| `{colors.chart-2}` | Teal | Secondary series, second allocation. |
| `{colors.chart-3}` | Deep blue | Tertiary series. |
| `{colors.chart-4}` | Bright gold | Fourth series. |
| `{colors.chart-5}` | Amber | Fifth series. |
| `{colors.chart-6}` | Electric blue | Sixth series. |
| `{colors.chart-7}` | Purple-pink | Seventh series. |
| `{colors.chart-8}` | Mint green | Eighth series, often used for "Other" / residual. |

### Component Palette (shadcn/ui compat)

These map to the shadcn/ui CSS variable convention (`--background`, `--primary`, etc.). They power the base component library.

| Token | Dark Value | Role |
|-------|-----------|------|
| `{colors.background}` | `hsl(0 0% 0%)` | Page background. |
| `{colors.foreground}` | `oklch(0.985 0.001 106.423)` | All primary text on dark surfaces. |
| `{colors.primary}` | `oklch(0.985 0.001 106.423)` | Primary interactive (white pill CTA). |
| `{colors.primary-foreground}` | `oklch(0.216 0.006 56.043)` | Text on primary (dark). |
| `{colors.secondary}` | `oklch(0.268 0.007 34.298)` | Secondary surfaces. |
| `{colors.muted}` | `oklch(0.268 0.007 34.298)` | Muted backgrounds. |
| `{colors.muted-foreground}` | `oklch(0.709 0.01 56.259)` | Muted/deemphasized text. |
| `{colors.accent}` | `oklch(0.268 0.007 34.298)` | Hover/active states. |
| `{colors.destructive}` | `oklch(0.396 0.141 25.723)` | Destructive actions. |
| `{colors.border}` | `oklch(0.268 0.007 34.298)` | All borders, dividers, rules. |
| `{colors.ring}` | `oklch(0.553 0.013 58.071)` | Focus ring color. |

## Typography

### Font Pairing

**Geist** (Vercel's typeface) for UI — humanist proportions, excellent readability at small sizes, modern without being trendy.

**Geist Mono** for code, data, and metadata labels — geometric construction reads as precise and technical.

### Hierarchy Scale

| Token | Font | Size/Weight | Tracking | Use |
|-------|------|------------|----------|-----|
| `{typography.display}` | Geist | 48px / 600 | -1.44px | Landing page hero. Never inside the product. |
| `{typography.h1}` | Geist | 36px / 600 | -0.72px | Page titles, dashboard names. |
| `{typography.h2}` | Geist | 24px / 600 | -0.36px | Section headings, card group titles. |
| `{typography.h3}` | Geist | 20px / 500 | -0.24px | Card titles, panel headers. |
| `{typography.body-lg}` | Geist | 16px / 400 | 0 | Lead paragraphs, onboarding text, long-form. |
| `{typography.body}` | Geist | 14px / 400 | 0 | **Default body.** All product body text, card descriptions. |
| `{typography.body-sm}` | Geist | 12px / 400 | 0 | Secondary body, sidebar labels, timestamps. |
| `{typography.label-md}` | Geist Mono | 12px / 500 | 0.06em | Inline labels, field labels, category tags. |
| `{typography.label-sm}` | Geist Mono | 11px / 500 | 0.08em | **Default label.** Table headers, badge text, eyebrow labels. |
| `{typography.caption}` | Geist | 11px / 400 | 0 | Fine print, footnotes, legal. |
| `{typography.code}` | Geist Mono | 13px / 400 | 0 | Inline code, API responses, terminal output. |
| `{typography.mono-data}` | Geist Mono | 24px / 500 | -0.02em | Data values in dashboard cards (e.g., "$142,391.27"). |
| `{typography.mono-metric}` | Geist Mono | 32px / 600 | -0.03em | Hero metric values, KPI headlines. |
| `{typography.button-md}` | Geist | 14px / 500 | 0 | All button labels. |

### Typography Rules

1. **Geist Mono is the voice of data.** Any number displayed in the UI — price, return percentage, volume, position size — must be set in `{typography.mono-data}`. This creates a clear visual separation between UI chrome (Geist Sans) and financial data (Geist Mono).
2. **Labels are uppercase Geist Mono.** Every UI label — chart axis labels, column headers, metric descriptions, form field labels — uses `{typography.label-sm}` with positive letter-spacing. This creates a "dashboard" texture.
3. **Negative tracking on headlines.** `{typography.h1}` through `{typography.h3}` use negative letter-spacing. This is non-negotiable — it's the primary signal that something is a heading.
4. **No bold body text.** Body text is weight 400. Emphasis uses color (white from `{colors.text-primary}` to brighter white `{colors.foreground}`) or placement, never font-weight escalation.
5. **One display level per page.** The `{typography.display}` token is reserved for marketing/landing pages. Inside the product, `{typography.h1}` is the ceiling.

### Font Substitutes

If Geist fonts cannot load:
- **Geist Sans** → Inter (400, 500, 600) with `font-feature-settings: "ss01", "ss02"` for geometric alternates
- **Geist Mono** → JetBrains Mono (400, 500) — closest stylistic match

## Layout

### Spacing System

Base unit: **4px**. Every spacing value is a multiple of 4. The system uses fractional 4px steps sparingly (only `{spacing.xxs}` 2px for micro-gaps, `{spacing.md}` 12px for nudge adjustments).

| Token | Value | Use |
|-------|-------|-----|
| `{spacing.xxs}` | 2px | Icon-to-label gaps, tight inline separators. |
| `{spacing.xs}` | 4px | Button icon padding, badge internal gap. |
| `{spacing.sm}` | 8px | **Default inline gap.** Button clusters, form rows, icon stacks. |
| `{spacing.md}` | 12px | Card interior spacing (compact), list item padding. |
| `{spacing.lg}` | 16px | Section padding, card-to-card gap, form field stacks. |
| `{spacing.xl}` | 24px | Section margins, card group gutters. |
| `{spacing.xxl}` | 32px | Large section boundaries. |
| `{spacing.3xl}` | 48px | Major layout divisions. |
| `{spacing.4xl}` | 64px | Hero section padding (marketing). |
| `{spacing.section}` | 96px | Between-page-section rhythm (marketing). |
| `{spacing.card-padding}` | 20px | Standard card interior padding. |
| `{spacing.dashboard-gap}` | 20px | Dashboard card grid gap. |
| `{spacing.metric-gap}` | 20px | Gap between metric blocks in a metric grid. |

### Grid & Container

- **Max content width:** 1400px for dashboard layouts; 1200px for marketing/marketing-style pages.
- **Dashboard grid:** 12-column flexible grid. Cards span 3, 4, 6, or 12 columns. No card smaller than 3 columns.
- **Sidebar width:** 240px (`{components.sidebar}` width). Fixed-width, always visible on desktop ≥ 1024px.
- **Content gutter:** `{spacing.xl}` 24px on both sides at desktop; `{spacing.lg}` 16px at tablet/mobile.

### Whitespace Philosophy

The dark background IS the whitespace. The system breathes through generous negative space on the dark canvas, not through white margins. Cards sit on the surface ladder — their visual separation comes from the surface color change, not from margins or padding. This means:

- **Card grids use `{spacing.dashboard-gap}` 20px.** Tighter than typical SaaS because the surface color change already provides separation.
- **Section boundaries use `{spacing.xxl}` 32px minimum.** Sections are distinct contexts; they need room.
- **Never stack two elements of the same surface color adjacent without a gap.** The surface ladder only works when transitions are visible.

## Elevation & Depth

OpenMoney achieves depth through **surface color ladder + hairline borders** — never through shadows on static elements.

| Level | Treatment | Use |
|-------|-----------|------|
| 0 — Flat | `{colors.surface-0}` background, no border. | Page body. |
| 1 — Card | `{colors.surface-1}` background, 1px `{colors.border}`. | All cards, code blocks, panels. |
| 2 — Elevated | `{colors.surface-2}` background, 1px `{colors.border}`. | Hovered cards, active nav items, dropdowns, popovers. |
| 3 — Modal | `{colors.surface-2}` background + `{colors.modal-overlay}` backdrop + subtle shadow. | Dialogs, modals, drawers. |
| 4 — Focus | 2px `{colors.ring}` outline at 100% opacity, offset 2px. | Focused inputs, focused buttons. |

### Shadow Usage

Shadows are reserved exclusively for:
1. **Interactive overlay surfaces** — dropdowns, popovers, modals that float above the page.
2. **Button hover/pressed states** — the `{colors.hairline-strong}` border transitions to a subtle shadow on hover to reinforce interactivity.

Cards, code blocks, and static content surfaces are **flat by default.** The surface ladder + border is the depth system. Adding shadows to static cards breaks the system's restraint.

## Shapes

### Border Radius Scale

Base is `0.2rem` — deliberately tight. The system's "sharp minimalism" is one of its strongest identity signals.

| Token | Value | CSS | Use |
|-------|-------|-----|-----|
| `{rounded.none}` | `0px` | `rounded-none` | Full-bleed sections, footer. |
| `{rounded.sharp}` | `0px` | `rounded-none` | Code blocks, inline code chips, callout left stripes. Code is sharp — never rounded. |
| `{rounded.xs}` | `calc(0.2rem - 2px)` | — | Keycap glyphs, tiny inline tags, checkboxes. |
| `{rounded.sm}` | `calc(0.2rem - 1px)` | — | Inputs, search fields, small interactive surfaces. |
| `{rounded.md}` | `0.2rem` | `var(--radius)` — `rounded-md` | **Default radius.** Buttons, badges, tabs, dropdown items, standard interactive elements. |
| `{rounded.lg}` | `calc(0.2rem + 2px)` | — | Cards, panels, metric blocks. |
| `{rounded.xl}` | `calc(0.2rem + 4px)` | — | Modals, dialogs, large containers. |
| `{rounded.full}` | `9999px` | `rounded-full` | Pills, avatars, toggle switches, badges, status indicators. |

### Shape Rules

1. **Code is sharp.** Any element containing or framing code (code blocks, inline `<code>`, terminal mockups) uses `{rounded.sharp}` 0px. This signals "system" vs "interface."
2. **Interactive surfaces use `{rounded.md}` 0.2rem.** Buttons, inputs, tabs — anything clickable gets the base radius.
3. **Containers use `{rounded.lg}`.** Cards, panels, metric blocks carrying non-interactive content.
4. **Modals use `{rounded.xl}`.** The extra radius signals that the modal is "floating" and temporary.
5. **Never mix rounded and sharp corners in the same visual group.** If a card has `{rounded.lg}`, every element inside it is either sharp or `{rounded.md}` or smaller. No mismatch.

## Components

### Buttons

Six variants map to intent. Four sizes for density control. Every button uses `{typography.button-md}` at weight 500.

| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| `default` | `{colors.primary}` | `{colors.primary-foreground}` | none | Primary CTA — one per viewport fold maximum. |
| `secondary` | `{colors.secondary}` | `{colors.secondary-foreground}` | none | Secondary action, inline with primary. |
| `outline` | transparent | `{colors.foreground}` | 1px `{colors.border}` | Tertiary action, boundary-defining CTAs. |
| `ghost` | transparent | `{colors.foreground}` | none | Low-emphasis action: toolbar icons, table row actions. |
| `destructive` | `{colors.destructive}` | white | none | Delete, remove, cancel — destructive actions only. |
| `link` | transparent | `{colors.primary}` | none | Inline text links. |

**Sizes:**

| Size | Height | Padding | Use |
|------|--------|---------|-----|
| `sm` | 32px | 6px 12px | Compact toolbars, table actions. |
| `md` (default) | 36px | 8px 16px | Standard buttons. |
| `lg` | 44px | 10px 20px | Primary CTAs in hero/signup/auth flows. |

**States:**
- **Hover:** Lighten background by 8-12% luminance.
- **Pressed:** Darken background by 8-12% luminance.
- **Focus:** 2px `{colors.ring}` outline, 2px offset.
- **Disabled:** Opacity 0.5, cursor not-allowed, no hover effect.

**Button Rules:**
- Only ONE `default` variant button per viewport fold.
- Ghost buttons in toolbars only.
- Destructive buttons must have a confirmation step. Never place destructive next to primary without a separator.

### Inputs

Single-line text inputs. Sharp, minimal affordances. The input is 36px tall (`{spacing.input-height}`) with 8px vertical padding and 12px horizontal padding.

**States:**
- **Default:** 1px `{colors.border}`, transparent background, `{typography.body}` text.
- **Hover:** Border shifts to `{colors.border-strong}`.
- **Focus:** Border shifts to `{colors.ring}`, 2px offset focus ring.
- **Error:** Border shifts to `{colors.destructive}`, helper text in `{colors.negative}`.
- **Disabled:** Opacity 0.4, cursor not-allowed.

**Input Rules:**
- Every input must have a visible label (not placeholder-only).
- Error state always includes helper text below the input.
- Never use `{colors.brand}` as an input focus color — use the neutral `{colors.ring}`.

### Cards

**Standard Card (`card-default`):**
- Background `{colors.card}`, 1px `{colors.border}`, `{rounded.lg}`, padding `{spacing.card-padding}` 20px.
- **Footer:** Optional dashed top border for meta/actions (`dashed-t` motif class).
- **No shadow.** Cards sit flat on the surface. Their surface color lift is the depth cue.

**Data Card (`dashboard-card`):**
- Background `{colors.surface-1}`, 1px `{colors.border}`, `{rounded.md}`, padding `{spacing.card-padding}`.
- Contains a metric value in `{typography.mono-metric}` or `{typography.mono-data}` with a `{typography.label-sm}` description above.
- Optional sparkline or mini-chart embedded.

**Code Card (`card-code`):**
- Background `{colors.surface-1}`, `{rounded.sharp}` 0px, padding `{spacing.lg}`.
- Always Geist Mono. No border radius. Sharp corners signal "this is code, not interface."

### Callouts

Four variants: info, warning, error, success. Each uses a **dashed left border stripe** (`dashed-l`) colored to the accent type.

| Variant | Border Color | Background | Icon |
|---------|-------------|-----------|------|
| Info | `{colors.info}` | transparent | ℹ |
| Warning | `{colors.warning}` | transparent | ⚠ |
| Error | `{colors.negative}` | transparent | ✕ |
| Success | `{colors.positive}` | transparent | ✓ |

The callout body uses `{typography.body}` at `{colors.text-secondary}`. The title uses `{typography.body}` at `{colors.text-primary}` with weight 500.

### Badges

| Variant | Background | Text |
|---------|-----------|------|
| `default` | `{colors.secondary}` | `{colors.secondary-foreground}` |
| `secondary` | `{colors.secondary}` | (same) |
| `destructive` | `{colors.destructive}` | white |
| `outline` | transparent | `{colors.foreground}` |
| `positive` | `{colors.positive-bg}` | `{colors.positive}` |
| `negative` | `{colors.negative-bg}` | `{colors.negative}` |

All badges: `{typography.label-sm}`, `{rounded.full}`, padding 2px 10px.

### Tabs

Horizontal tab bar. Each tab: `{typography.body-sm}`, `{rounded.md}`, padding 6px 12px.

- **Default:** transparent background, `{colors.text-secondary}` text.
- **Active:** `{colors.surface-2}` background, `{colors.text-primary}` text.
- The content panel below uses a 1px `{colors.border}` top rule spanning full width.

### Tables

Data tables are the most common component in a financial platform. Precision is mandatory.

- **Header row:** `{typography.label-sm}` (Geist Mono, uppercase), `{colors.text-tertiary}`, height 36px. Sticky on scroll.
- **Data row:** `{typography.body}`, `{colors.text-primary}`, height 44px (`{spacing.data-row}`).
- **Numeric columns:** Right-aligned. Always Geist Mono (`{typography.code}` or `{typography.mono-data}`).
- **Positive values:** `{colors.positive}` text color.
- **Negative values:** `{colors.negative}` text color.
- **Row hover:** Background shifts to `{colors.surface-2}`.
- **Row border:** 1px `{colors.border-subtle}` bottom rule on each row.

### Sidebar

240px fixed width (`{components.sidebar}` width), `{colors.surface-1}` background, 1px `{colors.border}` right rule.

- **Nav items:** `{typography.body-sm}`, padding 6px 10px, `{rounded.md}`. `{colors.text-secondary}` default, `{colors.text-primary}` active.
- **Active item:** `{colors.surface-2}` background + 2px `{colors.brand}` left indicator bar.
- **Sections:** Separated by 1px `{colors.border-subtle}` dividers with `{spacing.sm}` gap.
- **Icon size:** `{spacing.icon-md}` 20px, matching the text line height.

### Navigation

**Top Navigation Bar:**
- Height 48px, `{colors.surface-0}` background, 1px `{colors.border}` bottom rule.
- Left: brand mark + optional breadcrumb.
- Center: (reserved for search in product; empty in marketing).
- Right: icon buttons (notifications, settings) + avatar dropdown.
- All nav items use `{typography.body-sm}`.

**Command Palette:**
- Triggered by `⌘K` or `Ctrl+K`.
- `{colors.surface-2}` background with `{colors.modal-overlay}` backdrop.
- Search input at top, results list below.
- Each result row: `{typography.body}`, padding 6px 10px, `{rounded.sm}`.
- Active row: `{colors.surface-3}` background.
- Keyboard shortcut hints use `{component.kbd}` at the right edge.

### Modals & Dialogs

- Backdrop: `{colors.modal-overlay}` — semi-transparent black.
- Content: `{colors.card}` background, `{rounded.xl}`, padding `{spacing.xl}` 24px.
- Header: `{typography.h3}` title + close button (ghost circle, top-right).
- Body: `{typography.body}` at `{colors.text-secondary}`.
- Footer: right-aligned button cluster, typically "Cancel" (outline) + "Confirm" (default).
- No header-bottom or footer-top dividers unless the content scrolls.

### Alerts & Toasts

**Toasts (`{component.toast}`):**
- `{colors.surface-2}` background, `{rounded.md}`, padding 12px 16px.
- Slide up from bottom-right (mobile: bottom-center).
- Auto-dismiss after 4 seconds (configurable for persistent alerts).
- Four variants: default, success (`{colors.positive}` icon), error (`{colors.negative}` icon), warning (`{colors.warning}` icon).

### Skeleton Loaders

- `{colors.surface-2}` base, `{rounded.xs}` 2px.
- Pulse animation: opacity 1 → 0.5 → 1, 1.5s ease-in-out infinite.
- Match skeleton dimensions to their content's approximate size.
- Card skeleton: 2-3 rows of varying-width rectangles, no more than 4.
- Table skeleton: 5 rows of equal-height bars.

### Empty States

- Padding: `{spacing.3xl}` 48px all sides.
- Icon or illustration at top (32-48px, `{colors.text-tertiary}` opacity).
- Title: `{typography.h3}` at `{colors.text-primary}`.
- Description: `{typography.body}` at `{colors.text-secondary}`, max-width 400px.
- CTA button below the description if there's a clear action.

### Chart & Data Visualization

**Price Charts:**
- Dark canvas (`{colors.surface-1}`). No chart border.
- Gridlines: 1px `{colors.border-subtle}`, horizontal only. No vertical gridlines.
- Line color: `{colors.positive}` for the primary series.
- Area fill: `{colors.positive}` at 8% opacity below the line.
- Crosshair: `{colors.text-secondary}` vertical line + tooltip at intersection.
- Axis labels: `{typography.label-sm}` at `{colors.text-tertiary}`.

**Candlestick Charts:**
- Bullish candle: `{colors.positive}` filled body.
- Bearish candle: `{colors.negative}` filled body.
- Wick color matches body color.
- Volume bars below in `{colors.text-tertiary}` at 40% opacity.

**Sparklines:**
- 100px × 30px minimum, embedded inside metric cards.
- No axes, no gridlines, no labels.
- Line color: `{colors.positive}` (trending up) or `{colors.negative}` (trending down).
- Area fill: matching color at 10% opacity.

**Pie/Donut Charts:**
- Colors cycle through `{colors.chart-1}` through `{colors.chart-8}`.
- Center hole for donut: 60% inner radius.
- Labels outside or on-hover tooltip. No inline labels for slices smaller than 10%.

**Gauges:**
- Semi-circular arc, 180° sweep.
- Color gradient: `{colors.negative}` (left) → `{colors.warning}` (center) → `{colors.positive}` (right).
- Needle or indicator at current value.
- Center value in `{typography.mono-metric}`.

### Provider Status Indicators

Three states for data provider health:
- **Active:** `{colors.positive}` dot, 8px (`{component.connection-indicator-active}` size).
- **Error:** `{colors.negative}` dot, 8px.
- **Pending/NeedsKey:** `{colors.warning}` dot, 8px.
- Label in `{typography.label-sm}` next to the dot.

## Motifs

Background patterns that signal metadata, code, and engineering precision.

| Class | Pattern | Size | Use |
|-------|---------|------|-----|
| `.bg-grid` | Grid lines | 32px | Landing pages, hero backgrounds. |
| `.bg-grid-small` | Fine grid | 8px | Code sections, terminal mockups. |
| `.bg-dot` | Dot matrix | 16px | Card footers, metadata regions. |
| `.dashed-b` | Dashed bottom border | — | Card footer rules, section dividers. |
| `.dashed-t` | Dashed top border | — | Card header rules. |
| `.dashed-l` | Dashed left border | — | Callout left stripes. |
| `.dashed-r` | Dashed right border | — | Rare: sidebar section separators. |

**Motif Rules:**
- Grid patterns are for marketing/brand surfaces only — never inside the product.
- Dashed borders are the system's signature decorative motif. Use `.dashed-b` for card footers and `.dashed-l` for callouts.
- Dot patterns may appear in product surfaces sparingly (empty states, onboarding).

## Agent Instruction Layer

### How to Compose Layouts

1. **Start with the data.** Determine what information the user needs to see. That's your content hierarchy. Everything else is scaffolding.
2. **Choose the surface.** Canvas (`surface-0`) → Card (`surface-1`) → Elevated (`surface-2`). Each step up the ladder is one step closer to the user's attention.
3. **Establish the grid.** Dashboard layouts use a 12-column grid. Marketing pages use a centered max-width container with generous section spacing.
4. **Place visual anchors.** The first large element on the page (hero metric, chart, data table) establishes the visual rhythm. Everything else aligns to it.
5. **Check the accent count.** There should be exactly zero or one uses of `{colors.brand}` per viewport fold. If you see two, one must go.

### How to Prioritize Hierarchy

- **Size before color.** A larger element always dominates a smaller one, regardless of color.
- **Position before decoration.** Top-left is read first (in LTR languages). Place primary content there.
- **Mono before sans.** Data (mono) always outranks chrome (sans). The numbers are the product.

### When to Use Visual Effects

- **Gradients:** Only in chart fills (area charts) at very low opacity. Never on chrome surfaces.
- **Shadows:** Only on floating overlays (modals, dropdowns, popovers). Never on static cards.
- **Animations:** Fade-in for content load, slide-up for toasts, 150ms ease-out for hover transitions. No bounce, no spring, no decorative motion.
- **Blur:** Only on modal backdrops. Never as decoration.

### When NOT to Use Visual Effects

- No glassmorphism. No backdrop-blur cards. No frosted glass.
- No neon glow. No text shadows.
- No gradient borders.
- No animated background patterns.
- No parallax scrolling effects inside the product.
- No decorative icon animations.

### How to Maintain Rhythm

- **The 8px rule.** Every vertical gap between major elements must be a multiple of 8px. Use the spacing tokens — don't invent values.
- **Consistent card padding.** Every card in a grid uses the same interior padding. If one card has 20px, they all have 20px.
- **Aligned metrics.** In a metrics grid, every metric block has identical dimensions. The data inside may vary, but the frame is fixed.
- **Sticky headers.** Table headers and dashboard section headers stick on scroll. The user should never lose context.

### How to Avoid Clutter

- **Remove before adding.** Before introducing a new element, ask: what can I remove instead?
- **One accent per fold.** If you've already used `{colors.brand}` on a CTA, don't use it again on an icon, a badge, a link, or a separator.
- **Mono everything.** When in doubt, monochrome dark. The system is almost entirely grayscale + semantic colors for data.
- **Table > chart.** If the data can be displayed in a table, prefer the table. Charts are for patterns, not precision.

### How to Design Premium Dashboards

1. **Generous metric cards.** Each KPI card has whitespace around the number. The metric value (`{typography.mono-metric}`) is large and centered or left-aligned. The label (`{typography.label-sm}`) sits above, muted.
2. **Sparklines, not full charts.** For trends, use sparklines inside metric cards. Reserve full charts for the main content area.
3. **Consistent card height.** All cards in the same row have equal height, regardless of content.
4. **Data density gradient.** The top of the dashboard is most dense (key metrics). Middle is medium (charts, tables). Bottom is reference (detailed tables, raw data).
5. **Provider health visible but unobtrusive.** A small row of dots at the top of the dashboard shows data source status. Never interrupt the workflow for a provider error.

### How to Generate SaaS Interfaces

- **Auth forms:** White/light input fields on dark surface. Single primary button. Minimal copy. No illustrations.
- **Settings pages:** Grouped sections with 1px border cards. Toggle switches, not checkboxes, for binary settings.
- **Billing pages:** Table-based layout with clear pricing tiers. No decorative cards, no gradients.
- **Onboarding:** Stepper at top. One action per screen. Generous whitespace. No walls of text.

### Anti-Patterns (Forbidden)

1. **Multiple primary buttons** in a single viewport.
2. **Colored backgrounds** on cards (orange cards, blue cards, etc.). The system is monochrome + semantic text colors.
3. **Rounded code blocks.** Code is always sharp.
4. **Drop shadows on static cards.** The surface ladder is the depth system.
5. **Gradient text** or gradient CTAs.
6. **All-caps Geist Sans text.** All-caps is reserved for Geist Mono labels.
7. **Positive green used as decoration** — it means "gain" and must only signal positive financial data.
8. **Long-form body text in monospace.** Mono is for data and code, not prose.
9. **Borders thicker than 1px** — except on focus rings (2px).
10. **Any new color not in the palette.** If a design requires a new color, the existing palette is being used incorrectly.

### Visual Constraints

- Maximum 3 font weights on screen: 400 (body), 500 (labels/buttons), 600 (headlines).
- Maximum 2 font families: Geist Sans + Geist Mono. Never introduce a third.
- Maximum 1 accent color use per viewport fold.
- Minimum 44px touch target for interactive elements on mobile.
- WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text).

## Do's and Don'ts

### Do

- **Do** use `{colors.positive}` and `{colors.negative}` exclusively for financial data semantics.
- **Do** set all data values (numbers, prices, percentages, metrics) in Geist Mono.
- **Do** use the surface ladder (`{colors.surface-0}` → `{colors.surface-1}` → `{colors.surface-2}`) for visual hierarchy.
- **Do** keep code blocks sharp-cornered (`{rounded.sharp}` 0px) — code is never rounded.
- **Do** use dashed borders (`dashed-b`, `dashed-l`) for card footers and callout accents.
- **Do** maintain the 8px spacing rhythm — every gap is a multiple of 8px.
- **Do** prefer tables over charts when precision matters. Charts are for patterns, tables are for numbers.
- **Do** right-align numeric columns in tables.
- **Do** use the `{colors.ring}` token for all focus indicators — never a custom color.
- **Do** preserve a single accent (`{colors.brand}`) as the system's scarce interaction color.

### Don't

- **Don't** use `{colors.positive}` as decoration — it means "gain" and only signals positive financial data.
- **Don't** add drop shadows to static cards, code blocks, or metric panels.
- **Don't** mix rounded and sharp corners within the same visual group.
- **Don't** use more than one `default` variant button per viewport fold.
- **Don't** introduce a second chromatic accent color. `{colors.brand}` is the only one.
- **Don't** set body text or prose in Geist Mono — it's for data and code only.
- **Don't** use all-caps on Geist Sans text. Uppercase is reserved for Geist Mono labels.
- **Don't** create gradient buttons, gradient text, or gradient card borders.
- **Don't** use border radius larger than `{rounded.xl}` on any element except pills and avatars.
- **Don't** place a destructive action button adjacent to a primary action button without a visual separator.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|------------|
| Desktop-XL | 1920px+ | Full dashboard: 4-column metric grid, 12-column layout. |
| Desktop | 1440px | Default: 4-column metric grid, full sidebar visible. |
| Desktop-Sm | 1280px | Metric grid drops to 3 columns. |
| Tablet | 1024px | Sidebar collapses to icon-only (64px). Metric grid 2-column. |
| Tablet-Sm | 768px | Sidebar becomes hamburger drawer. Single-column layout. |
| Mobile | 480px | Cards stack vertically. Tables become card lists. |
| Mobile-Sm | 320px | Minimum supported width. Text truncation enabled. |

### Touch Targets

- All interactive elements: minimum 44px × 44px tap area on mobile.
- Table rows: 44px minimum height (`{spacing.data-row}`).
- Button sizes: never smaller than `sm` (32px) on any viewport.

### Collapsing Strategy

- **Sidebar:** Full-width (240px) at desktop → icon-only (64px) at tablet → hamburger drawer at mobile.
- **Metric grid:** 4-up → 3-up → 2-up → 1-up stacked.
- **Tables:** Full columns at desktop → horizontal scroll container at mobile (with sticky first column).
- **Charts:** Responsive width, fixed minimum height (250px). Resize, never crop.
- **Navigation:** Full top bar at desktop → reduced bar with hamburger at mobile.

## Iteration Guide

1. Pull the YAML front matter tokens before writing any CSS or component code.
2. Reference tokens by path (`{colors.positive}`, `{typography.mono-data}`, `{rounded.md}`) — never hardcode values.
3. When adding a new component, define it in the YAML `components` section first, then implement.
4. Run validation: `npx @google/design.md lint DESIGN.md` after edits.
5. Add variants as separate component entries (`-hover`, `-active`, `-disabled`).
6. Default body to `{typography.body}` (14px / 400 / Geist). Reach for `{typography.body-sm}` for secondary text.
7. Keep the accent (`{colors.brand}`) scarce — at most one use per viewport fold.
8. Before adding any new color, confirm it cannot be expressed with the existing palette.
