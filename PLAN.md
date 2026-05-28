# PLAN.md — OpenMoney

> **This file has moved to `.opencode/project/PLAN.md`**

See `.opencode/project/PLAN.md` for the full phased implementation plan.

## Quick Summary

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Foundation packages (shared, database, config) | ✅ Complete |
| Phase 2 | Provider core (AbstractFetcher, Registry, QueryExecutor) | ✅ Complete |
| Phase 3 | Auth layer (better-auth + Prisma) | 🔧 In progress |
| Phase 4 | Core API (portfolio, position, user routes) | 🔧 In progress |
| Phase 5 | Ingestion pipeline (workers, normalizer, TimescaleDB) | ⏳ Planned |
| Phase 6 | Quant engine (risk metrics, indicators, signals) | ⏳ Planned |
| Phase 7 | Frontend (Next.js pages, UI components) | ⏳ Planned |
| Phase 8 | Notification service | ⏳ Planned |
| Phase 9 | Landing page & docs | ⏳ Planned |
| Phase 10 | Infrastructure & CI/CD | ⏳ Planned |

## Provider Implementation Status

| Provider | Status | Models |
|----------|--------|--------|
| Yahoo Finance | ✅ FULL | 25+ models |
| FMP | ✅ FULL | Financial statements, ratios |
| Polygon.io | ✅ FULL | Equity, forex, crypto, options |
| FRED | ✅ FULL | Economic data, treasury rates |
| CBOE | ✅ FULL | Options chains, futures |
| SEC | ✅ FULL | Filings, insider trading |
| Finviz | ✅ FULL | Screeners, profiles |
| NASDAQ | ✅ FULL | Dividends, earnings, IPOs |
| ECB | ✅ FULL | Currency rates, yield curve |
| 21 more providers | 🔧 STUB | Planned |

See `.opencode/project/PLAN.md` for full details.
