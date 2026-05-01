# PLAN.md — OpenMoney

> Build plan generated from specs.md + user decisions. Phase order follows dependency chain.

## Service breakdown

| Service | Responsibility | Tech | Port | Depends on |
|---------|---------------|------|------|------------|
| `api-gateway` | Hono API server: auth middleware, route dispatch, CORS, rate limiting, request validation | Hono + Bun | 4000 | `packages/database`, `packages/shared` |
| `web-frontend` | Next.js 15 App Router: dashboard, portfolio UX, risk views, journal, watchlists | Next.js + Bun | 3000 | `api-gateway`, `packages/shared` |
| `ingestion` | Market data pipeline: WebSocket listeners, REST pollers, normalization, quality checks | Hono + Bun + Redis | — | `packages/database`, `packages/shared`, Redis |
| `quant-engine` | Risk metrics, indicators, signal generation, action recommendations | Bun + TypeScript | — | `packages/database`, `packages/shared`, Redis |
| `quant-python` | Python computation: ARIMA, GARCH, Monte Carlo, QuantStats risk metrics | FastAPI (Python 3.12) | 5000 | — (called by quant-engine) |
| `notification` | Email, web push, WebSocket alerts, daily digest | Hono + Bun | 4003 | `packages/database`, Redis |
| `docs` | Fumadocs documentation site | Next.js | 3001 | — |
| `redis` | Cache, pub/sub, rate limiting, session store, Streams | Redis 7 | 6379 | — |
| `db` | PostgreSQL 15 + TimescaleDB 2.x | Postgres + TimescaleDB | 5432 | — |

## Monorepo structure

```
openmoney/
├── apps/
│   ├── web/                        # Next.js frontend (port 3000)
│   ├── api/                        # Hono API gateway (port 4000)
│   ├── ingestion/                  # Data ingestion workers
│   ├── quant-engine/               # TypeScript quant engine
│   ├── quant-python/               # Python FastAPI quant microservice (port 5000)
│   ├── notification/               # Notification service (port 4003)
│   └── docs/                       # Fumadocs (port 3001)
├── packages/
│   ├── shared/                     # Zod schemas, TS types, shared utilities
│   ├── database/                   # Prisma schema + client
│   └── config/                     # Shared environment config
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── Dockerfile.ingestion
│   ├── Dockerfile.quant-engine
│   ├── Dockerfile.quant-python
│   ├── Dockerfile.notification
│   └── compose.yml
├── kubernetes/
├── .github/workflows/
├── specs.md
├── AGENTS.md
├── package.json                    # Bun workspace root
├── bun.lock
├── tsconfig.base.json
└── README.md
```

## Environment variables per service

### Shared (all services)
| Variable | Source | Required |
|----------|--------|----------|
| `DATABASE_URL` | .env / Vault | yes |
| `REDIS_URL` | .env / Vault | yes |
| `NODE_ENV` | .env | yes |

### api-gateway
| Variable | Source | Required |
|----------|--------|----------|
| `BETTER_AUTH_SECRET` | .env | yes |
| `BETTER_AUTH_URL` | .env | yes |
| `PORT` | .env (default 4000) | no |
| `GITHUB_ID` / `GITHUB_SECRET` | .env | optional |
| `GOOGLE_ID` / `GOOGLE_SECRET` | .env | optional |
| `QUANT_PYTHON_URL` | .env (default http://localhost:5000) | yes |

### web-frontend
| Variable | Source | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_API_URL` | .env (default http://localhost:4000) | yes |
| `NEXT_PUBLIC_WS_URL` | .env (default ws://localhost:4000) | yes |

### ingestion
| Variable | Source | Required |
|----------|--------|----------|
| `YFINANCE_ENABLED` | .env (default true) | no |
| `YFINANCE_RATE_LIMIT` | .env (default 2000) | no |
| `POLYGON_API_KEY` | .env / user config | optional |
| `ALPHA_VANTAGE_API_KEY` | .env / user config | optional |

### quant-engine + quant-python
| Variable | Source | Required |
|----------|--------|----------|
| `QUANT_PYTHON_URL` | .env | yes |
| `MANAGED_QUANT_PYTHON` | .env (default true) | no |

### notification
| Variable | Source | Required |
|----------|--------|----------|
| `SMTP_HOST` / `SMTP_PORT` | .env | optional |
| `SMTP_USER` / `SMTP_PASS` | .env | optional |
| `FROM_EMAIL` | .env | optional |

## Shared types and API contracts

### Inter-service contracts (Zod schemas in `packages/shared`)

```
packages/shared/src/
├── schemas/
│   ├── portfolio.schema.ts     # Portfolio, Position, Transaction
│   ├── market-data.schema.ts   # MarketData, OHLCV, PriceQuote
│   ├── risk.schema.ts          # VaR, Sharpe, RiskMetrics
│   ├── signal.schema.ts        # Signal, ActionRecommendation
│   ├── journal.schema.ts       # Prediction, JournalEntry
│   ├── watchlist.schema.ts     # Watchlist, WatchlistItem, ScreenResult
│   ├── user.schema.ts          # UserProfile, UserPreferences
│   └── ingestion.schema.ts     # DataAdapterConfig, IngestionJob, NormalizedTick
├── types/
│   ├── api.types.ts            # API response envelopes, pagination
│   ├── event.types.ts          # Redis pub/sub event shapes
│   └── quant.types.ts          # Quant computation request/response
├── utils/
│   ├── ticker-utils.ts         # Ticker normalization, validation
│   ├── date-utils.ts           # Market calendar helpers
│   └── number-utils.ts         # Decimal precision, rounding
```

### Key API contracts (shared between api-gateway and web-frontend)

```typescript
// Portfolio
interface PortfolioResponse {
  id: string
  name: string
  description: string | null
  currency: string
  isDefault: boolean
  summary: PortfolioSummary
  positions: PositionResponse[]
  createdAt: string
  updatedAt: string
}

interface PortfolioSummary {
  totalValue: number
  totalCostBasis: number
  totalReturn: number
  totalReturnPercent: number
  dayPnl: number
  dayPnlPercent: number
  positionCount: number
  allocationByAsset: { assetClass: string; percent: number }[]
}

// Position
interface PositionResponse {
  id: string
  ticker: string
  name: string | null
  assetClass: string
  quantity: number
  avgEntryPrice: number
  currentPrice: number | null
  costBasis: number
  marketValue: number | null
  unrealizedPnl: number | null
  unrealizedPnlPercent: number | null
  allocationPercent: number | null
  isOpen: boolean
  openedAt: string
  closedAt: string | null
}

// Risk metrics
interface RiskMetricsResponse {
  portfolioVaR95: number          // 1-day 95% VaR as percentage
  portfolioVaR99: number
  portfolioCVaR95: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  maxDrawdownDate: string | null
  beta: number | null
  correlationMatrix: { ticker: string; correlations: Record<string, number> }[]
  positionRiskContributions: { ticker: string; marginalVaR: number; componentVaR: number }[]
  asOfDate: string
}

// Action recommendation
interface ActionRecommendation {
  id: string
  ticker: string | null         // null for portfolio-level
  portfolioId: string
  action: 'hold' | 'add' | 'reduce' | 'exit' | 'rebalance' | 'hedge'
  confidence: number             // 0–1
  title: string
  reasoning: string[]
  triggeredBy: string[]          // rule names or metric names
  expiresAt: string | null
  createdAt: string
}

// Quant computation request (api → quant-python)
interface QuantRequest {
  type: 'risk_metrics' | 'forecast' | 'optimize' | 'technical_indicators'
  payload: Record<string, unknown>
}

interface QuantResponse {
  success: boolean
  data: Record<string, unknown>
  error?: string
  computedAt: string
}

// Market data (ingestion → TimescaleDB normalized shape)
interface NormalizedOHLCV {
  time: string           // ISO 8601
  ticker: string
  open: number
  high: number
  low: number
  close: number
  volume: number | null
  vwap: number | null
  interval: string       // '1m' | '5m' | '1h' | '1d'
  source: string         // 'polygon' | 'alpha_vantage' | 'yfinance'
}
```

### Quant-python FastAPI contract

```
POST /compute
  Request:  { type: "risk_metrics" | "forecast" | "optimize" | "technical_indicators", payload: {...} }
  Response: { success: boolean, data: {...}, error?: string, computedAt: "ISO8601" }

GET /health
  Response: { status: "ok", version: "1.0" }
```

## Database schema per service

### api-gateway / web-frontend / notification (PostgreSQL — Prisma-managed)

**Managed by better-auth** (auto-generated, then extended):
- `User`, `Account`, `Session`, `Verification` — better-auth standard models
- Extended with: `preferences Json?`, `dataSourceKeys Json?` (encrypted), `onboarded Boolean @default(false)`

**App-specific models** (defined in `packages/database/prisma/schema.prisma`):

```
Portfolio         — id, name, description, currency, isDefault, userId, createdAt, updatedAt
Position          — id, ticker, name?, assetClass, quantity(decimal), avgEntryPrice(decimal),
                    currentPrice(decimal)?, costBasis(decimal), marketValue(decimal)?,
                    unrealizedP&L(decimal)?, unrealizedP&LPercent(decimal)?,
                    openedAt, closedAt?, isOpen, notes?, portfolioId, createdAt, updatedAt
Transaction       — id, ticker, type("buy"|"sell"), quantity, price, fees?, notes?,
                    portfolioId, executedAt, createdAt
Prediction        — id, title, ticker?, direction, thesis, catalysts?, timeframe,
                    confidence(int 50-99), expectedOutcome?, actualOutcome?,
                    outcomeDate?, outcomeNotes?, userId, positionId?, createdAt, updatedAt
Watchlist         — id, name, isDefault, userId, createdAt, updatedAt
WatchlistItem     — id, ticker, note?, watchlistId, addedAt
Signal            — id, ticker?, portfolioId?, type, action?, confidence(decimal)?,
                    title, description, metadata(Json)?, expiresAt?, createdAt
StrategyRule (post-MVP) — id, name, description?, enabled, conditions(Json),
                    actions(Json), priority, userId, createdAt, updatedAt
```

### ingestion (TimescaleDB hypertable — managed via raw SQL migrations)

```
MarketData — time(DateTime), ticker(String), open(Decimal8,2), high(Decimal8,2),
             low(Decimal8,2), close(Decimal8,2), volume(Decimal16,2)?, vwap(Decimal8,2)?,
             interval(String), source(String), createdAt(DateTime)

  → hypertable on time, partitioned by day
  → compression after 6 months
  → indexes: (ticker, time, interval), (time)
```

### Redis state (not persisted)

```
sessions:*       — better-auth session cache
rate-limit:*     — per-user rate limit counters
ws:connections:* — active WebSocket connection map
streams:ingestion— ingestion event stream (backpressure buffer)
pub:data-update  — market data update events
pub:signal       — signal/recommendation events
cache:risk:*     — risk metrics cache (TTL 1 hour)
cache:portfolio:*— portfolio summary cache (TTL 5 min)
queue:quant      — quant computation task queue
queue:email      — email send queue
```

## Implementation phases

All assumptions made for each phase are documented inline.

### Phase 1: Foundation packages (days 1–2)

**Prerequisites**: Bun 1.2+ installed.

| Step | Task | Detail |
|------|------|--------|
| 1.1 | Initialize monorepo | Root `package.json` with `workspaces = ["apps/*", "packages/*"]`. `tsconfig.base.json` strict mode. `.gitignore` |
| 1.2 | Create `packages/config` | Shared environment loader (`@openmoney/config`). Reads `.env` files, exports typed config objects |
| 1.3 | Create `packages/shared` | All Zod schemas, TypeScript types, utility functions (`@openmoney/shared`). No runtime dependencies beyond `zod` |
| 1.4 | Create `packages/database` | Prisma schema with all app models. `@openmoney/database` package exports typed Prisma client |
| 1.5 | Setup ESLint + Prettier | `bun run lint` command. Strict config consistent with TS strict mode |
| 1.6 | Setup bun:test config | Root `bun run test` command. Initial smoke test |
| 1.7 | Create `.env.example` | All environment variables with placeholder values |

**Assumptions**: 
- No Docker or database needed for Phase 1 (pure TypeScript packages)
- bun:test is the test runner (not vitest, not jest)

### Phase 2: Development infrastructure (day 2)

| Step | Task | Detail |
|------|------|--------|
| 2.1 | Create `docker/compose.yml` | PostgreSQL (with TimescaleDB init), Redis, volumes, health checks |
| 2.2 | Create `docker/init-timescaledb.sql` | Hypertable creation script for MarketData, compression policies |
| 2.3 | Create `docker/Dockerfile.api` | Bun-based Hono API image |
| 2.4 | Create `docker/Dockerfile.web` | Next.js standalone image |
| 2.5 | Create `docker/Dockerfile.quant-python` | Python FastAPI image |
| 2.6 | Create `docker/Dockerfile.ingestion` | Ingestion service image |
| 2.7 | Update `.env.example` with Docker defaults | `DATABASE_URL`, `REDIS_URL` pointing to Docker services |

**Assumptions**:
- TimescaleDB is available as a Docker image (timescaledb/timescaledb:latest-pg15)
- Redis official image (redis:7-alpine)
- User will run `docker compose up -d db redis` before dev

### Phase 3: Auth layer (days 3–4)

| Step | Task | Detail |
|------|------|--------|
| 3.1 | Install better-auth with Prisma adapter | `bun add better-auth @better-auth/prisma-adapter` |
| 3.2 | Generate Prisma schema via better-auth CLI | `npx auth@latest generate` — creates User, Account, Session, Verification models |
| 3.3 | Extend Prisma schema | Add Portfolio, Position, Prediction, Watchlist, etc. plus User extensions (preferences, dataSourceKeys) |
| 3.4 | Create initial migration | `npx prisma migrate dev --name init` |
| 3.5 | Create `apps/api/src/lib/auth.ts` | better-auth server config: email/password, OAuth providers, session config, Prisma adapter |
| 3.6 | Create `apps/api/src/index.ts` | Hono entry point. `export default { port: 4000, fetch: app.fetch }` |
| 3.7 | Create auth middleware | Hono middleware that extracts session from cookie/header and injects user context |
| 3.8 | Mount auth routes | `app.route("/api/auth", authHandler)` — delegates to better-auth |
| 3.9 | Create auth client lib | `apps/web/lib/auth-client.ts` — better-auth React client |
| 3.10 | Create auth API route file | `apps/web/app/api/auth/[...all]/route.ts` — Next.js route handler for better-auth |
| 3.11 | Create login/register pages | `apps/web/app/auth/login/page.tsx`, `register/page.tsx` |
| 3.12 | Create basic layout with auth check | `apps/web/app/(authenticated)/layout.tsx` — redirects to login if no session |
| 3.13 | Verify full auth flow | signup → email verify → login → session → logout. Test with bun:test |

**Assumptions**:
- better-auth generates Prisma schema to `prisma/schema.prisma` — we then extend it in-place
- Email verification is required (default better-auth behavior)
- Session cookie named `better-auth-session` by default

### Phase 4: Core API (days 5–8)

| Step | Task | Detail |
|------|------|--------|
| 4.1 | Create API route structure | `apps/api/src/routes/v1/` — portfolios, positions, watchlists, journal, market-data, search, user |
| 4.2 | Implement portfolio routes | CRUD + summary with computed fields (total value, P&L, allocation) |
| 4.3 | Implement position routes | CRUD + close position + real-time price enrichment from cache |
| 4.4 | Implement watchlist routes | CRUD for watchlists + items |
| 4.5 | Implement journal routes | CRUD for predictions + stats endpoint (accuracy, calibration, Brier score) |
| 4.6 | Implement search routes | Ticker auto-complete (uses yfinance for symbol lookup) |
| 4.7 | Implement user routes | Profile GET/PUT |
| 4.8 | Create middleware stack | CORS (`hono/cors`), logger (`hono/logger`), rate limiting (custom), auth guard |
| 4.9 | Create api-gateway entry point | Wire routes + middleware + WebSocket upgrade handler |
| 4.10 | Add API tests | bun:test with Hono's `app.fetch()` for each route group |
| 4.11 | Create Hono RPC client types | Export `hc`-compatible route types to `packages/shared` |

**Assumptions**:
- `apps/api/src/routes/v1/*.ts` — each route file exports Hono router, mounted at `/api/v1`
- Portfolio summary computed server-side from Position data (no aggregation service yet)
- WebSocket handlers stubbed (real-time comes in Phase 5)
- Ticker search uses yfinance symbol lookup (no dedicated database)

### Phase 5: Ingestion pipeline (days 9–12)

| Step | Task | Detail |
|------|------|--------|
| 5.1 | Create `DataAdapter` interface | Abstract base class: `fetchQuote(ticker)`, `fetchHistory(ticker, from, to)`, `fetchBatch(tickers)`, `subscribe(ticker, handler)`, `healthCheck()` |
| 5.2 | Implement `YFinanceAdapter` | Uses `yfinance` npm package (or direct yfinance API calls). Rate-limit aware (2s between calls) |
| 5.3 | Implement `AlphaVantageAdapter` (optional) | REST poller with 5 req/min throttle. Activated only if user provides API key |
| 5.4 | Implement `PolygonAdapter` (skeleton) | WebSocket + REST adapter. Activated only if user provides API key |
| 5.5 | Create ingestion worker | Hono-based service that manages data source connections, scheduled polling, WebSocket listeners |
| 5.6 | Create data normalizer | Gap detection, staleness check, anomaly flag (>5σ), source consistency check |
| 5.7 | Create Redis Streams pipeline | Unprocessed data → Redis Stream → worker consumes → normalizes → inserts to TimescaleDB |
| 5.8 | Create hypertable SQL migration | `CREATE TABLE market_data (...)`, `SELECT create_hypertable(...)`, compression policy, retention policy |
| 5.9 | Create post-ingestion hook | After successful insert: invalidate risk cache, publish update event to Redis pub/sub |
| 5.10 | Create WebSocket market-data handler | `apps/api` WS route: clients subscribe to ticker updates, pushed via Redis pub/sub |
| 5.11 | Wire ingestion into startup | `apps/ingestion/src/index.ts` — connects adapters, starts pollers, listens on WS |
| 5.12 | Add ingestion tests | Mock data adapter, verify normalizer logic, verify TimescaleDB insert |
| 5.13 | Update Docker Compose | Add ingestion service + quant-python service |

**Assumptions**:
- yfinance npm package works with Bun (or we use direct HTTP calls to Yahoo Finance APIs)
- TimescaleDB is available as Docker image with hypertable support
- Redis Streams used for backpressure (not Kafka — too heavy for MVP)
- Data quality checks are best-effort: they flag issues but don't block ingestion

### Phase 6: Quant engine (days 13–16)

| Step | Task | Detail |
|------|------|--------|
| 6.1 | Create `quant-python` FastAPI microservice | Minimal FastAPI app with `/compute` and `/health` |
| 6.2 | Implement risk metrics computation | VaR (historical + parametric), CVaR, Sharpe, Sortino, max drawdown, beta, correlation. Uses QuantStats + numpy |
| 6.3 | Implement forecasting models | ARIMA (statsmodels), GARCH (arch), Monte Carlo (numpy). Stubbed in MVP, activated post-MVP |
| 6.4 | Create TypeScript quant engine client | `apps/quant-engine/src/client.ts` — HTTP client to quant-python with retry, timeout, caching |
| 6.5 | Implement technical indicators | RSI(14), MACD, SMA(50/200), Bollinger Bands, volume analysis. Uses `pandas-ta` in Python or custom TS implementation |
| 6.6 | Create subscription-based recomputation | Quant engine listens to Redis pub/sub for data-update events → triggers recomputation for affected tickers |
| 6.7 | Implement protfolio-level risk aggregation | Combines position-level risk into portfolio VaR, contribution analysis, concentration metrics |
| 6.8 | Create signal generator | Evaluates rules (MVP: hardcoded defaults) against current state → generates Signal records |
| 6.9 | Create action recommendation generator | Interprets signals → produces ActionRecommendation with reasoning. Thresholds defined in config |
| 6.10 | Cache risk metrics in Redis | Quant results cached with TTL. Invalidated on new data or position changes |
| 6.11 | Wire quant engine to API | Portfolio risk endpoint reads from Redis cache (or triggers on-demand compute if stale) |
| 6.12 | Add quant tests | Mock market data, verify risk metrics against known values, verify signal generation |

**Assumptions**:
- Quant-python runs in Docker, reachable at `http://quant-python:5000`
- MVP uses reasonable defaults for all parameters (VaR confidence 95%/99%, Sharpe risk-free rate 5%, etc.)
- Monte Carlo uses 10,000 simulations, 252-day horizon
- Technical indicators computed on daily OHLCV data
- Signal rules are hardcoded in MVP (configurable rules engine is post-MVP)

### Phase 7: Frontend (days 17–22)

| Step | Task | Detail |
|------|------|--------|
| 7.1 | Setup Next.js 15 with App Router | `apps/web` — TypeScript-only, strict mode. Tailwind CSS config |
| 7.2 | Create shared UI components | Layout, Sidebar, Header, Loading states, Error boundaries |
| 7.3 | Install lightweight-charts | `bun add lightweight-charts` |
| 7.4 | Create auth pages | Login, Register, Reset password — using better-auth React client |
| 7.5 | Create dashboard page | Portfolio summary cards, day P&L sparkline, recent signals list, data freshness indicator |
| 7.6 | Create portfolio detail page | Position table with sortable columns, allocation pie chart, performance chart |
| 7.7 | Create risk analytics page | VaR gauge, risk metrics grid, correlation heatmap, contribution breakdown |
| 7.8 | Create actions/recommendations page | Action cards with confidence badges, reasoning expanders, quick-action buttons |
| 7.9 | Create watchlist pages | List view, detail with real-time prices, technical indicators table |
| 7.10 | Create journal pages | Entry list, new prediction form (structured), detail with outcome tracking |
| 7.11 | Create search page | Ticker search with debounce, results list |
| 7.12 | Create settings page | Profile, preferences, data source key management |
| 7.13 | Create landing page | Marketing page with product overview |
| 7.14 | Wire everything to Hono client | Type-safe API calls via `hc` from `hono/client` |
| 7.15 | Add WebSocket hooks | `useWebSocket` React hook for real-time price updates and alerts |
| 7.16 | Add E2E tests | Playwright smoke tests for critical flows (login, portfolio CRUD, journal) |

**Assumptions**:
- Fonts: Inter (UI) via next/font, JetBrains Mono (code/data) via next/font
- Charts: lightweight-charts for candlestick/OHLCV, hand-rolled SVG for pie/donut (or a small chart helper)
- Dark mode is default, light mode toggle via Tailwind `class` strategy and `next-themes`
- All data fetching uses React Server Components where possible, client components for interactive bits
- WebSocket connection established on authenticated page load, reconnects automatically

### Phase 8: Notification service (days 23–24)

| Step | Task | Detail |
|------|------|--------|
| 8.1 | Create notification service | Minimal Hono app with email (Resend/SMTP) and web push support |
| 8.2 | Create email templates | Transaction notification, risk alert, daily digest |
| 8.3 | Create web push handler | Subscribes to Redis pub/sub signal channel, pushes to connected clients |
| 8.4 | Create alert configuration | Per-user alert preferences stored in PostgreSQL |
| 8.5 | Create digest scheduler | Daily job computes portfolio summary and emails digest |
| 8.6 | Wire into Docker Compose | Add notification service container |
| 8.7 | Add notification tests | Mock email transport, verify alert generation |

### Phase 9: Landing page & docs (days 25–26)

| Step | Task | Detail |
|------|------|--------|
| 9.1 | Setup Fumadocs in `apps/docs` | Next.js app with Fumadocs MDX, search, OpenAPI plugin |
| 9.2 | Write getting-started guide | Installation, config, first portfolio |
| 9.3 | Write user guides | Portfolio management, watchlists, journal, risk dashboard |
| 9.4 | Generate API reference | OpenAPI schema from Hono Zod validators → Fumadocs OpenAPI pages |
| 9.5 | Write deployment guide | Docker Compose, Kubernetes, environment setup |
| 9.6 | Write architecture overview | Service boundaries, data flow, tech decisions |
| 9.7 | Polish landing page | Product marketing page at `apps/web/app/page.tsx` |
| 9.8 | Add contribution guide | `CONTRIBUTING.md` with setup, coding standards, PR process |

### Phase 10: Infrastructure & CI/CD (days 27–28)

| Step | Task | Detail |
|------|------|--------|
| 10.1 | Create GitHub Actions CI workflow | On PR: lint → typecheck → test → build on all packages |
| 10.2 | Create GitHub Actions CD workflow | On main merge: build images → push to registry → deploy staging |
| 10.3 | Create K8s manifests | Deployments, Services, ConfigMaps for all services |
| 10.4 | Create Helm chart | Parameterized deployment for staging/production environments |
| 10.5 | Create monitoring setup | Sentry (error tracking) + basic health check endpoints |
| 10.6 | Verify end-to-end | `docker compose up --build` → all services healthy → smoke test |

## Summary of user decisions (from Q&A)

| Question | Decision |
|----------|----------|
| Python bridge | FastAPI RPC-style microservice (quant-python, port 5000). No REST conventions, no Django. Minimal POST `/compute` + `/health` |
| Charting library | lightweight-charts (TradingView-style) |
| WebSocket port | Same port as REST (4000). Single ingress. Hono handles WS + HTTP on same port via `hono/bun` |
| MVP data source | yfinance (free, no API key). Adapter layer designed to absorb Polygon, Alpha Vantage, etc. in future |
| Pricing model | Personal project now. DB schema includes usage logging for future monetization |
| Ingestion worker model | Per-data-source (one worker per source type) |

## Key architectural notes

- **TimescaleDB with Prisma**: MarketData table is a hypertable created via raw SQL (Phase 5). Prisma cannot model hypertables natively.
- **No JavaScript files**: All configs (next.config.ts, tailwind.config.ts, postcss.config.ts) must be `.ts`.
- **Hono + Bun export convention**: Each service entry file exports `{ port: number, fetch: app.fetch }`. Bun reads this automatically.
- **better-auth + Prisma flow**: `npx auth@latest generate` → `npx prisma migrate dev`. Two-step. The auth CLI only generates schema, does NOT migrate.
- **Quant-python is a thin compute layer**: It receives JSON, processes, returns JSON. All orchestration is in TypeScript quant-engine.
- **Usage logging**: Every API request that could affect billing (portfolio count, position count, data source usage, computation requests) logs to a `UsageRecord` table. Schema includes `userId`, `action`, `quantity`, `metadata`, `timestamp`. No billing logic in MVP — just logging.
