# SPECS.md — OpenMoney

> **This file has moved to `.opencode/project/SPECS.md`**

See `.opencode/project/SPECS.md` for the full architecture specification.

## Quick Reference

**OpenMoney** is an open-source quantitative investment research and portfolio intelligence platform.

### Architecture
- **Frontend**: Next.js 15 App Router + Tailwind CSS
- **Backend**: Hono 4 on Bun
- **Database**: PostgreSQL + TimescaleDB
- **Auth**: better-auth with Prisma
- **Provider System**: OpenBB's Provider → Fetcher → TET pattern (ported to TypeScript)

### Key Features
1. Portfolio management with real-time P&L
2. Real-time market data from 33+ providers
3. Risk analytics (VaR, Sharpe, drawdown, correlation)
4. Action recommendations engine
5. Investment journal with prediction tracking
6. Watchlist & market screener
7. AI agent analysis (37 agents, inspired by FinceptTerminal)

### Reference Projects
- **OpenBB Platform** — Primary architecture reference (Provider → Fetcher → TET)
- **FinceptTerminal** — Feature inspiration (AI agents, brokers, QuantLib)

See `.opencode/project/SPECS.md` for full details.
