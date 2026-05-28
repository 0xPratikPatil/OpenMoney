# AGENTS.md — OpenMoney

> **Project specifications have moved to `.opencode/project/`**

## Quick Start for Agents

Before writing ANY code, read these files in order:

1. **`.opencode/project/ACTION-PLAN.md`** — **START HERE** — Complete action plan from start to finish
2. **`.opencode/project/AGENTS.md`** — Architectural decisions, patterns, constraints
3. **`.opencode/project/SPECS.md`** — Full architecture, data models, API contracts, service boundaries
4. **`.opencode/project/PLAN.md`** — Phased implementation plan
5. **`.opencode/project/BRAND.md`** — Design system, colors, typography, voice

## Reference Codebases

- **OpenBB Platform** (`reference/`) — Primary architecture reference. Port their Provider → Fetcher → TET pattern to TypeScript.
- **FinceptTerminal** — Feature inspiration. 37 AI agents, 100+ data connectors, 16 broker integrations, QuantLib suite.

## Locked-in Decisions

| Decision | Choice |
|----------|--------|
| Language | TypeScript strict mode, zero `.js` files |
| Runtime | Bun 1.2+ |
| Package manager | Bun workspaces |
| Backend | Hono 4 on Bun |
| Frontend | Next.js 15 App Router |
| Database | PostgreSQL + TimescaleDB |
| Auth | better-auth with Prisma |
| UI | shadcn/ui in `packages/openmoney-ui/` |
| Data validation | Zod everywhere |
| Provider architecture | OpenBB's Provider → Fetcher → TET pattern |

## Key Commands

```bash
bun install          # install everything
bun run dev          # start all services
bun run typecheck    # strict mode check
bun run test         # all tests
bun run lint         # ESLint + Prettier
```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| AGENTS.md | `.opencode/project/AGENTS.md` | Agent instructions & patterns |
| SPECS.md | `.opencode/project/SPECS.md` | Full architecture spec |
| PLAN.md | `.opencode/project/PLAN.md` | Implementation roadmap |
| BRAND.md | `.opencode/project/BRAND.md` | Design system |
| README.md | Root | Getting started guide |
