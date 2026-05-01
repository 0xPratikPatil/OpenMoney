# Project: OpenMoney

## Overview

OpenMoney is an open-source quantitative investment research and portfolio intelligence platform that goes beyond data aggregation — it forecasts market scenarios, quantifies risk exposure across positions, and generates actionable recommendations (hold/cut/add/rebalance). Built for individual investors, quantitative analysts, and small-to-mid-size asset managers, OpenMoney combines real-time market data ingestion, a declarative strategy rule engine, portfolio analytics (VaR, Sharpe, drawdowns, factor exposure), and an investment journal that tracks prediction accuracy over time.

Unlike OpenBB (data aggregation + AI workspace) and Bloomberg Terminal (consumption-only), OpenMoney closes the loop: **Data → Forecast → Risk Assessment → Action → Journal → Learn**. It treats every investment decision as a testable hypothesis.

## Problem statement

Investment professionals and serious retail investors currently juggle 3–5 disconnected tools:

- OpenBB / Bloomberg / Reuters for data and screening (no forecasting, no portfolio tracking)
- QuantConnect / Backtrader for backtesting (no live portfolio integration)
- Portfolio Visualizer for risk analytics (no API, no programmatic access)
- Excel / Google Sheets for position tracking (error-prone, no automation)
- Notes apps for investment journals (no prediction accuracy measurement)

No single platform combines **real-time portfolio tracking, deterministic strategy rules, risk forecasting, action recommendations, and journaling** in one system. Investors cannot answer: *"When I was 80% confident about this thesis, what was my actual accuracy? And based on today's risk metrics, should I hold, cut, or add?"*

OpenMoney solves this by creating a continuous intelligence loop that quantifies risk and recommends actions based on user-defined strategies, financial models, and portfolio context.

## Target users

| Persona | Technical level | Primary goal |
|---------|----------------|--------------|
| **Retail quant investor** | Intermediate (can configure YAML/UI rules) | Automate research, get position-level risk metrics, log and learn from trades |
| **Portfolio manager (small fund)** | Low–Intermediate | Daily risk dashboard, rebalancing signals, compliance-ready reporting |
| **Quantitative analyst** | High (Python/TypeScript) | Custom model integration, factor analysis, backtest new signals against live portfolio |
| **Financial content creator / educator** | Low–Intermediate | Demo strategies, track prediction accuracy, build transparent investment track records |
| **Solo 401k / IRA self-directed investor** | Low | Understand portfolio risk, get rebalance alerts, journal investment theses |

## Competitor analysis

| Competitor | What they do well | What they lack | Our advantage |
|------------|-------------------|----------------|---------------|
| **OpenBB** | 100+ data source integrations, AI Copilot, customizable dashboards, REST API + Python SDK | No portfolio tracking (positions/cost basis/P&L), no strategy engine, no backtesting, no investment journal, Python-only stack | Forecasting engine + risk-aware action recommendations + prediction journal. TypeScript-native stack (Hono + Next.js) |
| **Bloomberg Terminal** | Unmatched data coverage, Excel integration, chat, terminal ecosystem | $24K/yr/user, no API for programmatic backtesting, no portfolio optimization, 1980s UI, cannot integrate custom models | Open-source, API-first, programmable strategy engine, modern UX, fraction of the cost |
| **Portfolio Visualizer** | Best-in-class portfolio analytics (MVO, risk parity, Monte Carlo), efficient frontier visualization | No API, no strategy engine, no real-time data, no programmatic access, SaaS-only | Open API, real-time recomputation, deterministic rule engine, can be self-hosted |
| **QuantConnect (LEAN)** | Cloud backtesting, multi-asset, 20+ broker integrations, 40+ alt data vendors | Cloud-only (no self-host), strategy-as-code only (no declarative rules), no portfolio-level risk decomposition | Declarative YAML/UI rule builder, portfolio-level risk analytics, self-hostable, journaling |
| **Backtrader** | Local backtesting, flexible sizer framework, 122+ built-in indicators, live trading | Python-only, no portfolio tracking UI, no risk analytics dashboard, no journal, no real-time data pipeline | Full-stack application (not just library), real-time pipeline, visual dashboards, prediction tracking |

## Features

### Core features (MVP)

#### 1. Authentication & user management

- **Description**: Full authentication system with email/password, social OAuth (Google, GitHub), session management, and profile management.
- **User story**: As a user, I want to sign up with email or OAuth so that I can securely access my portfolio and data.
- **Acceptance criteria**:
  - Email/password signup with verification
  - Google and GitHub OAuth sign-in
  - Session persistence across browser restarts
  - Profile page (name, email, avatar, preferences)
  - Password reset flow
  - Multi-device session management
- **Technical notes**: Uses better-auth with Prisma adapter and PostgreSQL. better-auth handles OAuth, session cookies, CSRF protection. Rate limiting built-in.

#### 2. Portfolio management

- **Description**: Create and manage investment portfolios with positions, cost basis tracking, and real-time P&L.
- **User story**: As a user, I want to add positions to my portfolio so that I can track my holdings and their performance.
- **Acceptance criteria**:
  - Create/rename/delete portfolios
  - Add positions: ticker, quantity, entry price, date, notes
  - Edit/close positions
  - View portfolio summary: total value, day P&L, total P&L, allocation pie
  - Manual entry via UI (initially; CSV import post-MVP)
- **Technical notes**: Positions stored in PostgreSQL via Prisma. Real-time market data from ingestion pipeline enriches positions with current price.

#### 3. Real-time market data ingestion

- **Description**: Automated pipeline that ingests market data from multiple sources, normalizes it, and makes it available for analysis. Supports both real-time (WebSocket) and batch (REST pollers) modes.
- **User story**: As a user, I want my portfolio positions to show live prices so that I always see current P&L without manual refreshing.
- **Acceptance criteria**:
  - Ingestion from at least 1 primary provider (Polygon.io or Alpha Vantage) with automatic fallback to yfinance
  - Real-time price updates via WebSocket for watched tickers
  - Daily EOD data batch for all tracked securities
  - Data quality checks: gap detection, staleness flags, anomaly detection
  - Rate-limit aware with automatic backoff
- **Technical notes**: Adapter pattern (`DataAdapter` base class → `PolygonAdapter`, `YFinanceAdapter`, `AlphaVantageAdapter`). TimescaleDB hypertables for time-series data. Redis Streams for buffering and backpressure.

#### 4. Risk analytics dashboard

- **Description**: Portfolio-level and position-level risk metrics computed daily and on-demand. Includes VaR (95%/99%), CVaR, Sharpe ratio, Sortino ratio, max drawdown, beta, correlation matrix, and concentration risk.
- **User story**: As a portfolio manager, I want to see my portfolio's risk exposure so that I can make informed decisions about position sizing and hedging.
- **Acceptance criteria**:
  - Portfolio VaR (95%, 99%) with 1-day and 1-week horizons
  - Position-level risk contribution (marginal VaR, component VaR)
  - Sharpe and Sortino ratios (1m, 3m, 6m, 1y, all-time)
  - Max drawdown with peak-to-trough dates
  - Beta vs. S&P 500 and vs. user-selected benchmark
  - Correlation matrix of top holdings
  - Sector and asset-class concentration charts
  - Historical VaR backtest (did actual losses exceed VaR?)
- **Technical notes**: Computed server-side in the quant-engine service. Uses QuantStats and custom risk models. Results cached in Redis, invalidated on new data or position changes.

#### 5. Action recommendations engine

- **Description**: Rule-based and model-driven recommendations for portfolio actions: hold, add, reduce, exit, hedge, or rebalance. Based on risk metrics, position context, and user-defined strategy rules.
- **User story**: As a user, I want to see actionable insights about my positions so that I know when to cut losses, take profits, or adjust exposure.
- **Acceptance criteria**:
  - Per-position recommendation: Hold / Add / Reduce / Exit with confidence score and reasoning
  - Portfolio-level rebalancing signal when allocation drifts beyond threshold
  - Risk-based alerts: position exceeding VaR limit, concentration warning, drawdown trigger
  - Explanations for each recommendation (e.g., "Reducing X because it exceeds 15% of portfolio and VaR contribution is 22%")
  - Recommendations refresh daily on new data and on-demand after position changes
- **Technical notes**: Rule engine uses a declarative configuration (YAML/JSON) for strategy definitions. Each rule evaluates against current state and risk metrics. Results are logged for backtesting the recommendation system itself.

#### 6. Investment journal with prediction tracking

- **Description**: Structured journal for logging investment theses, predictions with confidence levels, and post-mortem analysis of accuracy. Measures user's prediction calibration over time.
- **User story**: As an investor, I want to log my reasoning for each trade and track my prediction accuracy so that I can improve my decision-making.
- **Acceptance criteria**:
  - Create journal entries linked to positions or watchlist items
  - Structured fields: thesis, catalysts, timeframe, confidence (50–99%), expected outcome
  - Follow-up entries for outcome tracking (correct/incorrect/too early/too late)
  - Prediction accuracy dashboard: calibration curve, accuracy by confidence bracket, Brier score
  - Export journal as PDF or CSV
- **Technical notes**: Stored in PostgreSQL. Calibration metrics computed server-side. Unique to OpenMoney — no competitor offers prediction tracking.

#### 7. Watchlist & market screener

- **Description**: Create and manage watchlists with real-time price updates, basic technical indicators (RSI, MACD, SMA crossovers), and key fundamental data.
- **User story**: As an investor, I want to monitor securities I'm interested in and see basic signals so that I can identify entry opportunities.
- **Acceptance criteria**:
  - Create/rename/delete watchlists
  - Add tickers with auto-complete search
  - Real-time price column with % change
  - Sortable by any column
  - Technical indicators: RSI(14), MACD, SMA(50/200) cross, volume spike
  - Quick link to create journal entry or add to portfolio
- **Technical notes**: Technical indicators computed in quant-engine using TA-Lib bindings or `pandas-ta`. Watched tickers subscribe to WebSocket feed.

#### 8. Documentation site

- **Description**: Public-facing documentation site with API reference, user guides, architecture overview, and contribution guidelines.
- **User story**: As a developer, I want to find API documentation and integration guides so that I can build on top of OpenMoney.
- **Acceptance criteria**:
  - Getting started guide
  - API reference (auto-generated from OpenAPI spec)
  - User guides for portfolios, watchlists, journal
  - Deployment guide
  - Contribution guidelines
  - Full-text search
- **Technical notes**: Built with Fumadocs on Next.js, auto-generates API docs from Hono's Zod validation schemas via OpenAPI integration.

### Extended features (post-MVP)

#### 1. Declarative strategy builder

- **Description**: Visual and YAML-based editor for defining investment strategies as conditional rules. Example: "IF position P&L < -10% AND RSI < 30, THEN hold with high confidence."
- **User story**: As a quant, I want to define custom strategy rules so that the recommendation engine reflects my investment philosophy.
- **Acceptance criteria**:
  - Rule definition with conditions (price, P&L, technical indicators, risk metrics)
  - AND/OR/NOT nesting
  - Action assignment: hold/add/reduce/exit with confidence modifier
  - Backtest against historical data
  - Share/import rule templates
- **Technical notes**: Rules stored as JSON schema in PostgreSQL. Rule engine uses expression tree evaluation.

#### 2. Forecasting & prediction models

- **Description**: Statistical and ML-based price forecasting (short-term and medium-term) using models like ARIMA, GARCH, Monte Carlo simulation. Results incorporate into risk metrics and recommendations.
- **User story**: As a quant analyst, I want to see forecasted price ranges for my positions so that I can assess forward-looking risk.
- **Acceptance criteria**:
  - ARIMA/SARIMA short-term price forecast (5–30 days) with confidence intervals
  - GARCH volatility forecasting
  - Monte Carlo simulation for portfolio value distribution (10K paths)
  - Forecast visualization (fan chart with confidence bands)
  - Model accuracy tracking (compare forecast vs actual)
- **Technical notes**: Runs as batch jobs. Uses `statsmodels` (ARIMA), `arch` (GARCH), numpy (Monte Carlo). Results stored in PostgreSQL, cached in Redis.

#### 3. Broker integration

- **Description**: Connect brokerage accounts (Alpaca, Interactive Brokers, Robinhood) for automatic portfolio synchronization and one-click trade execution from recommendations.
- **User story**: As a power user, I want to sync my broker positions automatically and execute recommended trades with one click.
- **Acceptance criteria**:
  - OAuth-based broker connection
  - Auto-sync positions and transactions
  - Trade execution from recommendation UI
  - Order status tracking
- **Technical notes**: Each broker implemented as an adapter. Paper trading mode for testing.

#### 4. Alert system

- **Description**: Configurable alerts for price movements, risk threshold breaches, strategy signals, and data quality issues.
- **User story**: As a user, I want to be notified when my portfolio hits a risk threshold so that I can take action quickly.
- **Acceptance criteria**:
  - Push notifications (web, email, optionally mobile)
  - Configurable triggers: price level, % change, VaR breach, drawdown, RSI level
  - Daily digest email
  - Alert history log
- **Technical notes**: Uses Redis pub/sub for real-time alert evaluation. Email via Resend or similar. Web push via WebSocket.

#### 5. Team/collaboration features

- **Description**: Shared portfolios, read-only views for advisors/managers, comment threads on positions, and team-wide performance reporting.
- **Technical notes**: RBAC via better-auth organizations plugin. Row-level security in Prisma.

### Out of scope

- **Order execution gateway**: We will not build a full brokerage or order routing system. We integrate with existing brokers via their APIs.
- **Crypto exchange integration**: Post-MVP consideration. Focus on equities, ETFs, and macro data first.
- **Tax optimization**: No tax-loss harvesting or tax-aware position sizing in MVP.
- **Social trading / copy trading**: Explicitly excluded. This is a personal analytical tool, not a social network.
- **Direct market access (DMA)**: We provide signals and recommendations, not direct exchange connectivity.
- **Regulatory reporting (SEC, MiFID)**: Considered post-MVP for institutional users.
- **Mobile native app**: Web-first with responsive design. Native apps are post-MVP.

## Technical architecture

### Tech stack

| Layer | Technology | Version | Reason chosen |
|-------|-----------|---------|---------------|
| **Frontend** | Next.js (App Router) | 15.x | SSG + SSR, React Server Components, Fumadocs integration, TypeScript-native |
| **Backend API** | Hono | 4.x | Ultrafast, Web Standard API, first-class TypeScript, Bun-native, WebSocket support, Zod integration |
| **API Runtime** | Bun | 1.2+ | TypeScript without transpilation, native WebSocket, fastest JS runtime, bun:test |
| **Database** | PostgreSQL + TimescaleDB | 15+ / 2.x | Relational data (users, portfolios) + hypertables for time-series market data |
| **ORM** | Prisma | 6.x | Type-safe queries, auto-generated client, migrations, better-auth integration |
| **Auth** | better-auth | 1.6+ | Framework-agnostic, Prisma adapter, OAuth, 2FA, RBAC, open-source, self-hosted |
| **Cache / Real-time** | Redis | 7.x | Session store, rate limiting, pub/sub for WebSocket events, job queues |
| **Documentation** | Fumadocs | latest | Next.js-native, OpenAPI integration, MDX, full-text search, RSC |
| **Package manager** | Bun | 1.2+ | Workspaces (monorepo), faster installs, built-in test runner |
| **Language** | TypeScript | 5.x | Strict mode only, no JavaScript files anywhere in the codebase |
| **Data validation** | Zod | 3.x | TypeScript-first schema validation, Hono integration via `@hono/zod-validator` |
| **Message queue** | Redis Streams | — | Lightweight, no Kafka overhead for MVP, built into Redis |
| **Quant/ML runtime** | Pyodide (server-side WASM) or Python microservice | — | For statsmodels, arch, numpy, QuantStats. Evaluate: Python microservice vs Pyodide in Bun |
| **Containerization** | Docker / Docker Compose | latest | Local development and CI parity |
| **Orchestration** | Kubernetes (K3s for dev, EKS/GKE for prod) | — | Production deployment, auto-scaling ingestion workers |
| **CI/CD** | GitHub Actions | — | Monorepo CI, lint, typecheck, test, build, deploy |

### Services breakdown

| Service | Responsibility | Tech | Port |
|---------|---------------|------|------|
| `api-gateway` | Main Hono API server: routes, auth middleware, rate limiting, CORS, request validation | Hono + Bun | 4000 |
| `web-frontend` | Next.js application: UI, SSR, SSG, RSC, user dashboard | Next.js | 3000 |
| `ingestion-service` | Market data pipeline: WebSocket listeners, REST pollers, data normalization, quality checks, rate limiting | Hono + Bun + Redis | 4001 |
| `quant-engine` | Risk metrics, technical indicators, portfolio optimization, forecasting models, recommendation rules | Bun (Python microservice for ML) | 4002 |
| `notification-service` | Email, web push, WebSocket alerts, daily digest | Hono + Bun | 4003 |
| `docs` | Documentation site (Fumadocs) | Next.js | 3001 |
| `redis` | Cache, pub/sub, rate limiting, session store | Redis | 6379 |
| `db` | PostgreSQL + TimescaleDB | Postgres 15+ | 5432 |

### Data models

#### User (managed by better-auth)

```
User {
  id            String @id @default(cuid())
  name          String?
  email         String? @unique
  emailVerified Boolean @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  portfolios    Portfolio[]
  watchlists    Watchlist[]
  journalEntries JournalEntry[]
}
```

*Note: Better-auth generates the User, Account, Session, and Verification models. Additional app-specific models are defined alongside.*

#### Portfolio

```
Portfolio {
  id          String @id @default(cuid())
  name        String
  description String?
  currency    String @default("USD")
  isDefault   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  userId      String
  user        User @relation(fields: [userId], references: [id])
  positions   Position[]
  transactions Transaction[]
}
```

#### Position

```
Position {
  id          String @id @default(cuid())
  ticker      String
  name        String?          // Company name (denormalized for display)
  assetClass  String @default("equity")  // equity, etf, crypto, forex, fixed_income, commodity
  quantity    Decimal
  avgEntryPrice Decimal
  currentPrice  Decimal?
  costBasis     Decimal        // quantity * avgEntryPrice
  marketValue   Decimal?       // quantity * currentPrice
  unrealizedP&L Decimal?
  unrealizedP&LPercent Decimal?
  openedAt    DateTime
  closedAt    DateTime?
  isOpen      Boolean @default(true)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id])
}

// Indexes
@@index([portfolioId, ticker])
@@index([ticker])
@@index([isOpen])
```

#### MarketData (TimescaleDB hypertable)

```
MarketData {
  time        DateTime       // NOT @default(now()) — using source timestamp
  ticker      String
  open        Decimal
  high        Decimal
  low         Decimal
  close       Decimal
  volume      Decimal?
  vwap        Decimal?
  interval    String         // "1m", "5m", "1h", "1d"
  source      String         // "polygon", "alpha_vantage", "yfinance"
  createdAt   DateTime @default(now())
}

// Hypertable configuration
@@hypertable("time", chunk_time_interval => '1 day')
@@compression(compress_for => '6 months')
@@index([ticker, time, interval])
@@index([time])
```

#### Signal (output from quant engine)

```
Signal {
  id          String @id @default(cuid())
  ticker      String
  portfolioId String?
  type        String         // "recommendation", "alert", "forecast"
  action      String?        // "hold", "add", "reduce", "exit", "rebalance", "hedge"
  confidence  Decimal?       // 0–1
  title       String
  description String
  metadata    Json?          // Additional context (model outputs, rule matches)
  expiresAt   DateTime?
  createdAt   DateTime @default(now())

  // Relations
  portfolio   Portfolio? @relation(fields: [portfolioId], references: [id])
}

@@index([ticker, createdAt])
@@index([portfolioId])
@@index([type, createdAt])
```

#### Prediction (journal entry)

```
Prediction {
  id          String @id @default(cuid())
  title       String
  ticker      String?
  direction   String         // "bullish", "bearish", "neutral"
  thesis      String
  catalysts   String?
  timeframe   String         // "short_term" (<1mo), "medium_term" (1-6mo), "long_term" (>6mo)
  confidence  Int            // 50–99
  expectedOutcome String?
  actualOutcome  String?     // "correct", "incorrect", "too_early", "too_late", "unresolved"
  outcomeDate  DateTime?
  outcomeNotes String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  userId      String
  user        User @relation(fields: [userId], references: [id])
  positionId  String?
  position    Position? @relation(fields: [positionId], references: [id])
}

@@index([userId])
@@index([userId, actualOutcome])
@@index([ticker])
```

#### WatchlistItem

```
WatchlistItem {
  id          String @id @default(cuid())
  ticker      String
  note        String?
  addedAt     DateTime @default(now())

  // Relations
  watchlistId String
  watchlist   Watchlist @relation(fields: [watchlistId], references: [id])
}

Watchlist {
  id          String @id @default(cuid())
  name        String
  isDefault   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  userId      String
  user        User @relation(fields: [userId], references: [id])
  items       WatchlistItem[]
}
```

#### StrategyRule (post-MVP, schema ready)

```
StrategyRule {
  id          String @id @default(cuid())
  name        String
  description String?
  enabled     Boolean @default(true)
  conditions  Json     // Rule conditions tree (JSON schema)
  actions     Json     // Actions to take when conditions are met
  priority    Int @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  userId      String
  user        User @relation(fields: [userId], references: [id])
}
```

### API overview

#### API Gateway (Hono, port 4000)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| ALL | `/api/auth/*` | better-auth routes (signup, login, OAuth, sessions, etc.) | Public / Cookie |
| GET | `/api/v1/portfolios` | List user portfolios | Required |
| POST | `/api/v1/portfolios` | Create portfolio | Required |
| GET | `/api/v1/portfolios/:id` | Portfolio detail with summary metrics | Required |
| PUT | `/api/v1/portfolios/:id` | Update portfolio | Required |
| DELETE | `/api/v1/portfolios/:id` | Delete portfolio | Required |
| GET | `/api/v1/portfolios/:id/positions` | List positions in portfolio | Required |
| POST | `/api/v1/portfolios/:id/positions` | Add position | Required |
| PUT | `/api/v1/positions/:id` | Update position (edit, close) | Required |
| DELETE | `/api/v1/positions/:id` | Delete position | Required |
| GET | `/api/v1/portfolios/:id/risk` | Risk metrics for portfolio | Required |
| GET | `/api/v1/portfolios/:id/actions` | Action recommendations | Required |
| GET | `/api/v1/portfolios/:id/history` | Portfolio value over time | Required |
| GET | `/api/v1/market-data/:ticker` | Current market data for ticker | Required |
| GET | `/api/v1/market-data/:ticker/history` | Historical market data | Required |
| POST | `/api/v1/market-data/:ticker/subscribe` | Subscribe to real-time updates | Required |
| GET | `/api/v1/watchlists` | List watchlists | Required |
| POST | `/api/v1/watchlists` | Create watchlist | Required |
| POST | `/api/v1/watchlists/:id/items` | Add ticker to watchlist | Required |
| DELETE | `/api/v1/watchlists/:id/items/:itemId` | Remove ticker | Required |
| GET | `/api/v1/journal` | List journal entries | Required |
| POST | `/api/v1/journal` | Create prediction entry | Required |
| PUT | `/api/v1/journal/:id` | Update entry (add outcome) | Required |
| GET | `/api/v1/journal/stats` | Prediction accuracy stats | Required |
| GET | `/api/v1/search/tickers?q=` | Ticker auto-complete search | Required |
| GET | `/api/v1/signals` | Recent signals for user | Required |
| GET | `/api/v1/user/profile` | Get user profile | Required |
| PUT | `/api/v1/user/profile` | Update profile | Required |
| WS | `/ws/market-data` | Real-time market data WebSocket | Required |
| WS | `/ws/alerts` | Real-time alerts WebSocket | Required |

### Non-functional requirements

- **Performance**:
  - API response time < 100ms (p95) for portfolio and position reads
  - Dashboard load < 500ms (with cached risk metrics)
  - Market data ingestion latency < 1s from source to UI (real-time feed)
  - Daily risk metrics computed within 2 minutes of EOD data arrival
- **Scalability**:
  - Support 1,000 concurrent users in MVP (single Hono instance)
  - Horizontally scalable ingestion workers (Redis Streams partitions)
  - Timeline: 10K users within 6 months, 100K within 18 months
- **Security**:
  - Better-auth manages authentication (sessions, OAuth, CSRF)
  - All API endpoints require authentication except auth routes and docs
  - Rate limiting per-user (100 req/min default for API, configurable)
  - HTTPS everywhere (TLS 1.3)
  - Data at rest: encrypted storage (RDS encryption, app-level encryption for API keys)
  - API key management: user-provided data source keys encrypted at rest
- **Availability**:
  - Target 99.5% uptime
  - Graceful degradation: stale cached data shown with freshness indicator
  - Automatic failover between data sources (Polygon → Alpha Vantage → yfinance)
  - Stateless API servers (session state in Redis)

## Frontend

### Pages and routes

| Route | Page | Description | Auth required |
|-------|------|-------------|---------------|
| `/` | Landing | Marketing page, product overview | No |
| `/auth/login` | Login | Email/password and OAuth sign-in | No |
| `/auth/register` | Register | Create account | No |
| `/auth/reset-password` | Reset password | Password reset flow | No |
| `/dashboard` | Dashboard | Portfolio overview, key metrics, recent signals | Yes |
| `/portfolio/[id]` | Portfolio detail | Positions table, allocation, performance charts | Yes |
| `/portfolio/[id]/risk` | Risk analytics | VaR, Sharpe, drawdown, correlation, concentration | Yes |
| `/portfolio/[id]/actions` | Recommendations | Actionable signals with explanations | Yes |
| `/positions/[id]` | Position detail | P&L chart, risk metrics, related signals, journal | Yes |
| `/watchlists` | Watchlists | All watchlists with real-time prices | Yes |
| `/watchlist/[id]` | Watchlist detail | Tickers with indicators, sortable table | Yes |
| `/journal` | Journal | Prediction entries, accuracy dashboard | Yes |
| `/journal/new` | New prediction | Structured journal entry form | Yes |
| `/journal/[id]` | Journal detail | Entry view with outcome tracking | Yes |
| `/search` | Market search | Ticker search with details | Yes |
| `/settings` | Settings | Profile, preferences, data source keys | Yes |
| `/settings/integrations` | Integrations | Broker connections, API keys | Yes |
| `/docs` | Documentation | Fumadocs documentation site | No |
| `/docs/*` | Doc pages | Individual doc pages | No |

### UI/UX requirements

- **Design style**: Modern, data-dense, dark-mode-first with light mode support. Think Bloomberg terminal meets Linear. Clean typography, generous use of charts (Recharts / ECharts), glassmorphism for cards.
- **Theme**: Dark mode default with light mode toggle. Accent color: Indigo (#4F46E5). Supporting palette for risk levels (green/yellow/red).
- **Typography**: Inter (UI), JetBrains Mono (data/monospace). Tailwind CSS for styling.
- **Mobile**: Responsive but not mobile-first. Optimized for desktop 1280px+. Tablet acceptable. Phone view is informational only (read positions, check alerts).
- **Key user flows**:
  1. **Daily check**: Sign in → Dashboard (overview, VaR, day P&L, top signals) → Drill into positions → Check recommendations
  2. **New investment**: Search ticker → Add to watchlist → Research → Add position → Write journal entry with thesis
  3. **Risk review**: Portfolio → Risk tab → Review VaR breakdown → Check position contributions → Adjust positions based on recommendations
  4. **Journal review**: Journal → View accuracy dashboard → Filter predictions → Add outcomes to resolved entries

### Component breakdown

- `Layout` (App shell with sidebar navigation, header with search + notifications + avatar)
- `Sidebar` (Navigation links, collapsed/expanded, portfolio switcher)
- `PortfolioSummary` (Value, P&L, allocation pie, period selector)
- `PositionTable` (Sortable table with ticker, quantity, price, P&L, risk indicators)
- `RiskGauge` (Visual risk indicator: VaR, drawdown)
- `RiskMetricsCard` (Key risk metric with historical sparkline)
- `ActionCard` (Recommendation with confidence badge, reasoning, action button)
- `SignalTimeline` (Chronological list of signals and alerts)
- `PriceChart` (Interactive OHLCV/line chart with indicators overlay)
- `AllocationPie` (D3/ECharts pie chart with asset class breakdown)
- `CorrelationMatrix` (Heatmap of position correlations)
- `WatchlistTable` (Tickers with price, change, RSI, volume)
- `JournalForm` (Structured form: thesis, catalysts, timeframe, confidence)
- `JournalCard` (Prediction entry with outcome badge, timeline)
- `AccuracyDashboard` (Calibration curve, Brier score, accuracy by confidence)
- `SearchBar` (Ticker auto-complete with debounced API search)
- `NotificationBell` (Alert indicator with dropdown list)
- `DataFreshnessIndicator` (Shows age of last data update, stale/current state)

## Infrastructure

### Environments

- **Local**: Docker Compose full stack (Next.js, Hono API, Postgres+TimescaleDB, Redis, ingestion workers)
- **Development**: Same as local, developers run `docker compose up` + `bun run dev`
- **Staging**: Kubernetes (K3s or EKS), mirrors production config, uses sandboxed data sources
- **Production**: Kubernetes (EKS or GKE), managed Postgres (RDS with TimescaleDB extension), ElastiCache Redis

### CI/CD requirements

- **On PR (each push)**:
  - `bun run lint` — ESLint + Prettier
  - `bun run typecheck` — TypeScript strict mode check
  - `bun run test` — Unit + integration tests (bun:test)
  - Build check: `bun run build` (Next.js + Hono)
  - Prisma: `npx prisma validate` + `npx prisma generate`
- **On merge to main**:
  - All PR checks
  - Build Docker images for all services
  - Push to container registry
  - Deploy to staging (helm upgrade or kubectl apply)
  - Run E2E tests against staging
- **On release tag (v*)**
  - All main checks
  - Deploy to production with blue/green strategy
  - Run smoke tests against production
  - Notify on Slack/email

### Secrets and config

| Variable | Description | Service | Source |
|----------|-------------|---------|--------|
| `BETTER_AUTH_SECRET` | Auth signing secret | api-gateway | Vault |
| `BETTER_AUTH_URL` | Auth base URL | api-gateway | Env |
| `DATABASE_URL` | PostgreSQL connection string | api-gateway, quant-engine | Vault |
| `REDIS_URL` | Redis connection string | api-gateway, ingestion, quant | Vault |
| `POLYGON_API_KEY` | Polygon.io API key | ingestion | Vault |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | ingestion | Vault |
| `JWT_SECRET` | JWT signing secret (if needed) | api-gateway | Vault |
| `SESSION_SECRET` | Session encryption key | api-gateway | Vault |
| `NEXT_PUBLIC_API_URL` | Public API URL | web-frontend | Env |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | web-frontend | Env |
| `SMTP_HOST` / `SMTP_PORT` | Email server | notification | Vault |
| `SMTP_USER` / `SMTP_PASS` | Email credentials | notification | Vault |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth | api-gateway | Vault |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Google OAuth | api-gateway | Vault |
| `SENTRY_DSN` | Error tracking | all | Vault |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry endpoint | all | Env |

## Data ingestion pipeline architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INGESTION PIPELINE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   External Sources                    Hono Ingestion Workers         │
│   ┌────────────┐                    ┌──────────────────────┐       │
│   │ Polygon.io ├──WebSocket────────►│ WS Listener          │       │
│   │ (primary)  │                    │  (per ticker group)  │       │
│   └────────────┘                    └──────┬───────────────┘       │
│                                           │                        │
│   ┌────────────┐                    ┌──────▼───────────────┐       │
│   │Alpha Vantage├──REST (poll)──────►│ REST Poller          │       │
│   │(secondary) │                    │  (scheduled jobs)    │       │
│   └────────────┘                    └──────┬───────────────┘       │
│                                           │                        │
│   ┌────────────┐                    ┌──────▼───────────────┐       │
│   │ yfinance   ├──REST (fallback)──►│ Fallback Adapter     │       │
│   │ (free)     │                    │  (rate-limit aware)  │       │
│   └────────────┘                    └──────┬───────────────┘       │
│                                           │                        │
│   ┌────────────┐                    ┌──────▼───────────────┐       │
│   │ FRED       ├──REST (macro)─────►│ Macro Poller         │       │
│   │ (economic) │                    │  (daily)             │       │
│   └────────────┘                    └──────┬───────────────┘       │
│                                           │                        │
│                                    ┌──────▼───────────────┐       │
│                                    │ Redis Streams        │       │
│                                    │ (backpressure buffer)│       │
│                                    └──────┬───────────────┘       │
│                                           │                        │
│                                    ┌──────▼───────────────┐       │
│                                    │ Data Normalizer      │       │
│                                    │ - Standard schema    │       │
│                                    │ - Gap detection      │       │
│                                    │ - Anomaly flags      │       │
│                                    └──────┬───────────────┘       │
│                                           │                        │
│                                    ┌──────▼───────────────┐       │
│                                    │ TimescaleDB          │       │
│                                    │ (hypertable insert)  │       │
│                                    └──────┬───────────────┘       │
│                                           │                        │
│                                    ┌──────▼───────────────┐       │
│                                    │ Post-Ingestion Hook  │       │
│                                    │ → Invalidate caches  │       │
│                                    │ → Trigger quant eval │       │
│                                    │ → Push via WebSocket │       │
│                                    └──────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

1. **Adapter pattern**: Each data source implements `DataAdapter` interface with methods for `fetchRealtime(ws)`, `fetchHistory(ticker, from, to)`, `fetchEOD(ticker, date)`, `healthCheck()`.
2. **Source hierarchy**: Polygon.io (primary WS + REST) → Alpha Vantage (secondary REST) → yfinance (free fallback). Automatic fallback on failure.
3. **Quality gates**: Before data enters TimescaleDB, the normalizer checks: gap detection (missing trading days flagged), staleness (price older than expected), anomaly (>5 std dev move triggers review flag), source consistency (cross-reference across sources).
4. **Backpressure**: Redis Streams buffer incoming data. Workers consume at their own pace. If queues grow too large, older data is aggregated into 1m bars before insertion.
5. **Data retention**: Raw tick data → 1 week. 1m bars → 6 months. 1h bars → 2 years. Daily bars → permanent. TimescaleDB compression (90% space savings) after 6 months.

## Quant engine architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          QUANT ENGINE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐   ┌──────────────┐   ┌─────────────────────────┐    │
│   │ Tech Indicators│   │ Risk Models  │   │ Forecasting Models     │    │
│   │              │   │              │   │                        │    │
│   │ - RSI(14)   │   │ - VaR (hist) │   │ - ARIMA/SARIMA         │    │
│   │ - MACD      │   │ - VaR (param)│   │ - GARCH volatility     │    │
│   │ - SMA(50/200)│   │ - CVaR      │   │ - Monte Carlo (10K)    │    │
│   │ - Bollinger  │   │ - Sharpe    │   │ - Linear regression    │    │
│   │ - Volume     │   │ - Sortino   │   │                        │    │
│   │              │   │ - Max DD    │   └─────────────────────────┘    │
│   └──────────────┘   │ - Beta      │                                  │
│                      │ - Correlation│                                  │
│   ┌──────────────┐   │ - Component │   ┌─────────────────────────┐    │
│   │ Portfolio    │   │   VaR       │   │ Signal Generator        │    │
│   │ Stats        │   └──────────────┘   │                        │    │
│   │ - Day P&L   │                       │ Rules (YAML/UI)  ──►  │    │
│   │ - Total P&L │   ┌──────────────┐   │ Risk thresholds ──►  │    │
│   │ - Allocation│   │ Recomputation│   │ Model forecasts ──►  │    │
│   │ - Returns   │   │ Scheduler   │   │ Portfolio state ──►  │    │
│   └──────────────┘   │              │   │                        │    │
│                      │ - On new data│   │ → Action with reason   │    │
│                      │ - Periodic   │   └─────────────────────────┘    │
│                      │   (daily)    │                                  │
│   ┌──────────────┐   │ - On demand  │                                  │
│   │ Prediction   │   └──────────────┘                                  │
│   │ Tracker      │                                                     │
│   │ - Brier score│                                                     │
│   │ - Calibration│                                                     │
│   │ - Accuracy%  │                                                     │
│   └──────────────┘                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Model execution**: The quant engine is event-driven. When new data arrives (via Redis pub/sub), it:
1. Recomputes technical indicators for affected tickers
2. Recalculates portfolio risk metrics (VaR, Sharpe, etc.)
3. Evaluates rule conditions against new state
4. Generates signals (recommendations, alerts)
5. Pushes results to Redis cache and notifies connected clients via WebSocket

**Python microservice bridge**: For models requiring Python libraries (statsmodels, arch, numpy, QuantStats), the quant engine can either:
- **Option A (MVP)**: Spawn Python processes via Bun's `Bun.spawn()`, passing JSON input, receiving JSON output
- **Option B (post-MVP)**: Deploy a lightweight Python FastAPI microservice that the quant engine calls via HTTP/gRPC
- **Option C (experimental)**: Run Pyodide in Bun for in-process Python WASM execution

## Monorepo structure

```
openmoney/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── app/                  # App Router pages
│   │   ├── components/           # Shared UI components
│   │   ├── lib/                  # Client utilities
│   │   └── public/               # Static assets
│   ├── api/                      # Hono API server (gateway)
│   │   ├── src/
│   │   │   ├── routes/           # Route handlers (v1)
│   │   │   ├── middleware/       # Auth, CORS, rate limit
│   │   │   ├── lib/              # Shared server utilities
│   │   │   └── config/          # App configuration
│   │   └── index.ts              # Entry point
│   ├── ingestion/                # Data ingestion workers
│   │   ├── src/
│   │   │   ├── adapters/         # Data source adapters
│   │   │   ├── normalizer/       # Data quality & normalization
│   │   │   └── config/
│   │   └── index.ts
│   ├── quant-engine/            # Quant & risk engine
│   │   ├── src/
│   │   │   ├── indicators/       # Technical indicators
│   │   │   ├── models/           # Risk & forecasting models
│   │   │   ├── rules/            # Strategy rule engine
│   │   │   └── signals/          # Signal generator
│   │   └── index.ts
│   ├── notification/            # Notification service
│   │   ├── src/
│   │   │   ├── channels/        # Email, web push, WebSocket
│   │   │   └── templates/
│   │   └── index.ts
│   └── docs/                    # Fumadocs documentation
│       ├── content/             # MDX documentation files
│       ├── public/
│       └── source.config.ts
├── packages/
│   ├── shared/                  # Shared TypeScript types & utils
│   │   ├── src/
│   │   │   ├── schemas/         # Zod schemas (shared API contracts)
│   │   │   ├── types/           # TypeScript types
│   │   │   └── utils/           # Shared utilities
│   │   └── package.json
│   ├── database/                # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── config/                  # Shared configuration
│       └── src/
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── Dockerfile.ingestion
│   ├── Dockerfile.quant
│   └── compose.yml              # Local development stack
├── kubernetes/                  # K8s manifests
│   ├── api-gateway.yaml
│   ├── web-frontend.yaml
│   ├── ingestion.yaml
│   └── quant-engine.yaml
├── .github/
│   └── workflows/
│       ├── ci.yml               # PR checks
│       └── deploy.yml           # CD pipeline
├── specs.md                     # This file
├── package.json                 # Root workspace config
├── bun.lock
├── tsconfig.base.json           # Shared TS config
└── README.md
```

## Open questions

1. **Python bridge**: Should the quant engine use `Bun.spawn()` for Python subprocesses (simpler) or a separate Python FastAPI microservice (more scalable)? Decision impacts deployment complexity.
2. **Data source bundling**: Should OpenMoney bundle a free Polygon.io API key into deployments (and absorb cost up to a limit) or require users to bring their own API keys from day one? OpenBB uses bring-your-own.
3. **TimescaleDB vs QuestDB**: TimescaleDB (PostgreSQL extension, good for 1–100M rows, easy ORM integration) vs QuestDB (columnar, faster for huge datasets). MVP = TimescaleDB for Prisma compatibility.
4. **Realtime WebSocket strategy**: Should the Hono API handle both REST and WebSocket on the same port, or separate ports for WS (e.g., 4001)? Same-port is simpler for deployment (single ingress).
5. **Charting library**: Recharts (React-native, simpler) vs ECharts (more powerful, better financial charts) vs lightweight-charts (TradingView-style, specialized for financial). TradingView-like candlestick charts are a strong UX requirement.
6. **Pricing model**: Open-source core (AGPL?) with paid cloud? Self-hosted free forever? Community edition with usage limits like OpenBB?
7. **Data ingestion concurrency**: Should ingestion workers be per-data-source (separate processes, easier scaling) or per-ticker (finer parallelism, more complex)?
8. **MVP data sources**: Which single data source for MVP? Polygon.io ($29/mo starter, 15-year history, SIP-compliant) requires paid subscription. Alpha Vantage (free tier 5 req/min) is very limited. yfinance (free, but no SLA, occasional gaps).

## Assumptions made

1. **User has existing broker accounts**: We assume users already have brokerage accounts elsewhere. We do not build a brokerage. We sync positions via manual entry (MVP) and broker API (post-MVP).
2. **Bring-your-own data API keys**: MVP requires users to configure their own data source API keys. OpenMoney does not bundle or resell market data. This is the OpenBB model.
3. **Desktop-first usage**: Users will primarily access OpenMoney from a desktop browser during market hours. Mobile responsiveness is provided but is not the primary UX focus.
4. **US markets initially**: MVP focuses on US equities and ETFs. International markets, crypto, forex, and fixed income are post-MVP.
5. **Daily computation cycle**: Risk metrics and recommendations are computed on a daily cycle (after market close) and on-demand when users modify portfolios. Real-time updates are for prices and P&L only.
6. **Single-user focus**: MVP is designed for individual users. Team/advisor features are post-MVP. better-auth organizations plugin supports this evolution.
7. **No regulatory compliance burden**: OpenMoney provides analytical tools and recommendations. It does not execute trades (post-MVP broker integrations are user-initiated). It does not hold funds. Therefore it is not a broker-dealer or investment advisor for regulatory purposes.
8. **TypeScript strict mode throughout**: The entire codebase enforces strict TypeScript with strictNullChecks, noImplicitAny, exactOptionalPropertyTypes. No `any` types except where required by third-party libraries.
9. **Bun as primary runtime**: All local development, testing, and production API serving uses Bun. Node.js compatibility is maintained for edge cases but Bun features (native TS, Bun.serve, bun:test) are the default.
10. **Modules follow Clean Architecture**: Each service layer is split into `routes → controllers → services → repositories` with dependency injection via Hono middleware. Prisma client is instantiated once and injected via context.
