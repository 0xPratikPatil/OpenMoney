# BRAND.md — OpenMoney

> **BRAND.md is deprecated. The canonical design system is now `DESIGN.md`.**
>
> `DESIGN.md` is the single source of truth for all AI-generated UI, agent design decisions, component consistency, and visual identity. It follows the Google DESIGN.md format specification — machine-readable YAML tokens + human-readable design rationale.

## What moved where

| Old (BRAND.md) | New (DESIGN.md) |
|----------------|-----------------|
| Color tokens table | YAML `colors:` front matter + `## Colors` prose section |
| Typography spec | YAML `typography:` front matter + `## Typography` section |
| Radius scale | YAML `rounded:` front matter + `## Shapes` section |
| Shadow table | `## Elevation & Depth` section |
| Component variants | YAML `components:` front matter + `## Components` prose |
| Voice / tone | `## Overview` → Emotional Tone |
| Motifs (bg-grid, dashed) | `## Motifs` section |

## Quick Reference

- **Design Style**: Dark-first, premium, data-dense, modern SaaS
- **Typography**: Geist (UI), Geist Mono (code/data)
- **Colors**: oklch dark palette + financial semantics (positive/negative/warning)
- **Radius**: Deliberately tight — 0.2rem base
- **Voice**: Clear over clever. Terse, but warm. Show the code. Sharp, not loud.
- **Brand Accent**: Teal-cyan — used sparingly, at most once per viewport fold

## Using DESIGN.md with AI agents

Drop DESIGN.md into any AI coding agent (Claude, Cursor, OpenCode, Copilot) and tell it:

```
Build a dashboard/component/page that follows the design system in DESIGN.md
```

The agent will parse the YAML tokens + prose to generate UI that matches the system's visual identity, component patterns, and interaction rules.

See [DESIGN.md](./DESIGN.md) for the complete specification.
