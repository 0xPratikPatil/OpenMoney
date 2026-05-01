# OpenMoney

> Open-source quantitative investment research and portfolio intelligence platform. Ingest real-time market data, quantify risk, forecast scenarios, and get actionable recommendations — all in one system.

OpenMoney closes the loop that fragmented tools leave open: **Data → Forecast → Risk Assessment → Action → Journal → Learn**. Unlike OpenBB (data aggregation only) and Bloomberg Terminal (consumption-only), OpenMoney is built around a continuous intelligence engine that helps investors make better decisions.

## What makes OpenMoney different?

- **📊 Real-time portfolio intelligence** — Track positions, cost basis, P&L enriched with live market data
- **🔮 Forecasting engine** — ARIMA, GARCH, Monte Carlo simulations for price and volatility predictions
- **⚠️ Risk-aware recommendations** — Per-position and portfolio-level signals (Hold/Add/Reduce/Exit) with clear reasoning
- **📝 Investment journal** — Structured prediction tracking with accuracy calibration and Brier score
- **🔧 Declarative strategy rules** — Define investment rules in YAML/UI, not code
- **🔌 API-first architecture** — TypeScript-native (Hono + Next.js), open API for custom integrations

## Tech stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Backend API** | Hono 4 (Bun runtime) |
| **Database** | PostgreSQL + TimescaleDB |
| **Auth** | better-auth with Prisma |
| **Docs** | Fumadocs |
| **Real-time** | WebSocket, Redis Streams |
| **Quant** | Python (statsmodels, arch, numpy) via subprocess bridge |
| **Orchestration** | Docker Compose (dev), Kubernetes (prod) |

## Getting started

```bash
# Prerequisites: Bun 1.2+, Docker
git clone https://github.com/0xPratikPatil/OpenMoney.git
cd openmoney

# Install dependencies
bun install

# Start infrastructure (PostgreSQL + Redis)
docker compose up -d db redis

# Run database migrations
bun run db:migrate

# Start development
bun run dev
```

## Project structure

```
openmoney/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Hono API gateway
│   ├── ingestion/        # Data ingestion workers
│   ├── quant-engine/     # Quant & risk calculations
│   ├── notification/     # Alerts & notifications
│   └── docs/             # Fumadocs documentation
├── packages/
│   ├── shared/           # Shared types, schemas, utils
│   ├── database/         # Prisma schema & client
│   └── config/           # Shared configuration
├── docker/
└── kubernetes/
```

## Roadmap

- **MVP**: Portfolio tracking, real-time prices, risk metrics (VaR/Sharpe/drawdown), action recommendations, investment journal
- **Post-MVP**: Declarative strategy builder, broker integrations, team/collaboration features, advanced forecasting models

## License

AGPL-3.0 — See [LICENSE](LICENSE) for details.

## Contributors

Built by [Pratik Patil](https://github.com/0xPratikPatil).
