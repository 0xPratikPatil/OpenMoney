# OpenMoney Brand Identity

> Based on the [better-auth.com](https://better-auth.com/brand) design system — adapted for a quantitative finance platform.
> Source: `https://better-auth.com/brand`

---

## Foundations

### Color

The palette that makes up every surface in the product. Dark-only.

| Token | Value | Usage |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` | Page background |
| `--foreground` | `oklch(0.93 0 0)` | Primary text |
| `--primary` | `oklch(0.93 0 0)` | Primary interactive |
| `--primary-foreground` | `oklch(0.205 0 0)` | Text on primary |
| `--secondary` | `oklch(0.269 0 0)` | Secondary surfaces |
| `--secondary-foreground` | `oklch(0.93 0 0)` | Text on secondary |
| `--muted` | `oklch(0.205 0 0)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.708 0 0)` | Muted text |
| `--accent` | `oklch(0.269 0 0)` | Hover/active states |
| `--accent-foreground` | `oklch(0.93 0 0)` | Text on accent |
| `--border` | `oklch(0.205 0 0)` | Borders, dividers |
| `--input` | `oklch(0.205 0 0)` | Input borders |
| `--ring` | `oklch(0.708 0 0)` | Focus rings |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Errors, destructive actions |

### Callout Accents

| Variant | Token | Usage |
|---|---|---|
| Info | `oklch(0.488 0.243 264.376)` | Informational callouts |
| Warn | `oklch(0.769 0.188 70.08)` | Warning callouts |
| Error | `oklch(0.577 0.245 27.325)` | Error callouts |
| Success | `oklch(0.696 0.17 162.48)` | Success callouts |

### Typography

**Geist** for UI, **Geist Mono** for code and metadata.

- **H1**: `text-4xl tracking-tight` — Page titles
- **H2**: `text-xl tracking-tight` — Section headings
- **Body**: `text-sm` — Default text
- **Label**: `text-[11px] font-mono uppercase tracking-wider` — Mono labels
- **Code**: `font-mono text-sm` — Code blocks, data values

### Radius

Base is `0.2rem` — deliberately tight.

| Token | Value | Usage |
|---|---|---|
| `sharp` | `0` | Code blocks, inline callouts |
| `sm` | `calc(var(--radius) - 2px)` | Inputs, small buttons |
| `md` | `calc(var(--radius) - 1px)` | Buttons, badges |
| `lg` | `var(--radius)` | Cards, default |
| `xl` | `calc(var(--radius) + 4px)` | Modals, panels |

### Shadow

Shadows are used sparingly — only to lift interactive affordances. Code blocks and cards stay flat.

---

## Motifs

| Class | Grid Size | Usage |
|---|---|---|
| `.bg-grid` | 32px | Background grid pattern |
| `.bg-grid-small` | 8px | Fine grid pattern |
| `.bg-dot` | 16px | Dot pattern |
| `.dashed-b` | — | Dashed bottom border |
| `.dashed-t` | — | Dashed top border |
| `.dashed-l` | — | Dashed left border |

---

## Components

### Buttons

Six variants: `default`, `secondary`, `outline`, `ghost`, `link`, `destructive`

### Card

Flat border, no shadow. Uses dashed footer rules for meta.

### Callout

Dashed left stripe sized to the accent type (info/warn/error/success).

### Badge

Four variants: `default`, `secondary`, `destructive`, `outline`

---

## Voice

How OpenMoney communicates — across docs, product copy, and marketing.

1. **Clear over clever** — We name things what they are.
2. **Terse, but warm** — Short sentences. No marketing fluff. Sound like a thoughtful engineer.
3. **Show the code** — A well-named snippet does more than a paragraph.
4. **Sharp, not loud** — Minimal radii, dashed dividers, mono for metadata. The design should feel precise, never decorative.

---

*Brand identity based on [better-auth.com/brand](https://better-auth.com/brand)*
