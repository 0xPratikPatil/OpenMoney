# OpenMoney Brand Guidelines

> Design system and brand identity for OpenMoney — an open-source quantitative investment research and portfolio intelligence platform.
> Inspired by the clarity of Better Auth, the precision of financial terminals, and the minimalism of modern developer tools.

---

## Foundations

### 01 — Color

The palette balances warmth (the human side of investing) with precision (the quantitative side). Dark mode is the default — financial professionals work in low-light environments.

#### Base palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0C0C0F` | Page background |
| `--foreground` | `#F0EFED` | Primary text |
| `--primary` | `#F0EFED` | Primary interactive |
| `--primary-fg` | `#0C0C0F` | Text on primary |
| `--secondary` | `#1E1E26` | Secondary surfaces |
| `--secondary-fg` | `#F0EFED` | Text on secondary |
| `--muted` | `#1E1E26` | Muted backgrounds |
| `--muted-fg` | `#8E8D96` | Muted text |
| `--accent` | `#1E1E26` | Hover/active states |
| `--accent-fg` | `#F0EFED` | Text on accent |
| `--border` | `#26262E` | Borders, dividers |
| `--input` | `#26262E` | Input borders |
| `--ring` | `#6B6A78` | Focus rings |
| `--destructive` | `#7F1D1D` | Destructive actions |

#### Light mode overrides

| Token | Light Hex |
|-------|-----------|
| `--background` | `#F8F8FA` |
| `--foreground` | `#1C1B1A` |
| `--primary` | `#1C1B1A` |
| `--primary-fg` | `#F8F8FA` |
| `--secondary` | `#E8E8EE` |
| `--muted-fg` | `#6B6A72` |
| `--border` | `#D6D6DE` |
| `--destructive` | `#DC2626` |

#### Financial semantics

These are data colors — reserved for P&L, risk direction, and market movement.

| Token | Hex | Usage |
|-------|-----|-------|
| `--positive` | `#16A34A` | Price up, gain, bull signal |
| `--negative` | `#DC2626` | Price down, loss, bear signal |
| `--warning` | `#D97706` | Drawdown alert, reduce signal |
| `--info` | `#2563EB` | Neutral system message |

#### Callout accents

| Type | Hex |
|------|-----|
| Info | `#3B82F6` |
| Warn | `#F59E0B` |
| Error | `#EF4444` |
| Success | `#10B981` |

#### Accent color customization

Default accent is Emerald (`#059669`). Users can switch to:

- **Indigo** (`#4F46E5`) — analytical, professional
- **Amber** (`#D97706`) — warm, trader-desk feel
- **Rose** (`#E11D48`) — bold, distinctive
- **Blue** (`#2563EB`) — classic financial

---

### 02 — Typography

**Inter** for UI, **JetBrains Mono** for data and code. Numbers in financial contexts are always set in mono.

#### Font stack

```
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace
```

#### Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 11px | 500 | Labels, metadata, captions |
| `--text-sm` | 13px | 400 | Body text, table cells |
| `--text-base` | 14px | 400 | Default body |
| `--text-lg` | 16px | 500 | Section headings |
| `--text-xl` | 20px | 600 | Card titles, panel headers |
| `--text-2xl` | 24px | 600 | Page titles |
| `--text-3xl` | 30px | 700 | Hero metrics |
| `--text-4xl` | 36px | 700 | Display, empty states |

#### Type examples

```
Display · text-3xl font-sans tracking-tight

$284,530
Portfolio Value

Body · text-sm font-sans
Your portfolio is within all risk thresholds.

Data value · text-lg font-mono
+$3,240 (+1.2%)

Code · text-sm font-mono
const portfolio = await prisma.portfolio.findFirst(...);
```

---

### 03 — Radius

Deliberately tight. Sharp corners communicate precision.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | Code blocks, table headers |
| `--radius-sm` | `calc(var(--radius) - 2px)` | Inputs, small buttons |
| `--radius-md` | `calc(var(--radius) - 1px)` | Buttons, badges |
| `--radius-lg` | `var(--radius) = 0.375rem` | Cards, dialogs |
| `--radius-xl` | `calc(var(--radius) + 4px)` | Modals, panels |

---

### 04 — Shadow

Shadows lift only interactive affordances. Data containers stay flat.

| Level | Dark | Light |
|-------|------|-------|
| xs | `0 1px 2px rgba(0,0,0,0.3)` | `0 1px 2px rgba(0,0,0,0.05)` |
| sm | `0 1px 3px rgba(0,0,0,0.35)` | `0 1px 3px rgba(0,0,0,0.08)` |
| md | `0 4px 12px rgba(0,0,0,0.4)` | `0 4px 12px rgba(0,0,0,0.1)` |
| lg | `0 8px 24px rgba(0,0,0,0.45)` | `0 8px 24px rgba(0,0,0,0.12)` |

---

## Motifs

### 05 — Background Patterns

#### Grid — Fine
16px dot grid. `rgba(255,255,255,0.03)` dark, `rgba(0,0,0,0.04)` light.

#### Grid — Financial
Horizontal lines mimicking a chart grid. `rgba(255,255,255,0.04)` dark.

#### Noise
Grain texture at 5% opacity on elevated surfaces.

---

## Components

### 06 — Buttons

Six variants, three sizes. `transition-all duration-150`.

**Variants:** Primary, Secondary, Outline, Ghost, Link, Destructive

**Sizes:** Small (h-8), Default (h-9), Large (h-10)

### 07 — Inputs

Clean, minimal. Border does the work.

Default → `bg-transparent border border-input rounded-md px-3 py-2 text-sm`

Focus → `border-ring ring-1 ring-ring`

Error → `border-destructive`

### 08 — Cards

Flat border, no shadow. Separation via `bg-secondary` + `border-border`. Metric blocks have no border — just number + label.

### 09 — Callouts

Colored left border — no background fill.

### 10 — Tabs

Underline-style. Active tab has colored underline + smooth transition.

### 11 — Badges

Compact inline. Variants: default, secondary, outline, destructive, success.

### 12 — Alerts

Slide-in from top-right. Spring animation. Auto-dismiss at 5s.

---

## Logo

### 13 — Logo System

The mark is a stylized "O" formed by a rising trend line.

**Clear space:** 4px at 24px size, scaling proportionally.

**Minimum sizes:** Mark (24px), Wordmark (120px), Full logo (140px)

---

## Voice

### 14 — Voice & Tone

#### Precise over clever
Name things what they are. Portfolio, position, VaR, Sharpe ratio — not "MoneyJourney".

#### Terse, but confident
Short sentences. No filler. Write like an analyst who trusts their numbers.

#### Let data do the talking
Lead with the metric, follow with context:

```
$284,530          ← The headline
Portfolio Value   ← The label
▲ 2.3% this month ← The context
```

#### Sharp, not loud
Tight radii, dashed dividers, mono for numbers. Precise, never decorative.

#### Examples

| Context | Good | Bad |
|---------|------|-----|
| Empty | "Add your first position to start tracking." | "Welcome! Let's get started!" |
| Error | "Provider returned no data for XYZ." | "Oops! Something went wrong." |
| Alert | "Portfolio VaR at 3.2% — above 2.5% threshold." | "Heads up! Your risk is high." |

#### Dos and Don'ts

- ✅ Do use precise numbers ("VaR at 95%: 1.8%")
- ✅ Do use mono for all data values
- ✅ Do be direct ("Reduce MSFT by 5 shares")
- ❌ Don't use exclamation marks in data contexts
- ❌ Don't use emojis as UI elements
- ❌ Don't explain what a user already knows

---

## Appendix

### Tailwind Config Reference

```ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: { DEFAULT: 'var(--primary)', fg: 'var(--primary-fg)' },
        secondary: { DEFAULT: 'var(--secondary)', fg: 'var(--secondary-fg)' },
        muted: { DEFAULT: 'var(--muted)', fg: 'var(--muted-fg)' },
        accent: { DEFAULT: 'var(--accent)', fg: 'var(--accent-fg)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        destructive: 'var(--destructive)',
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        warning: 'var(--warning)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: { DEFAULT: 'var(--radius)' },
    },
  },
};
```

---

> Built for quants who demand precision. This document is living — it will evolve as OpenMoney grows.
