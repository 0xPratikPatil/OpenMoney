# OpenMoney

> Open-source quantitative investment research and portfolio intelligence platform.
> Architecture inspired by [OpenBB Platform](https://github.com/OpenBB-finance/OpenBB) — ported to TypeScript/Bun/Hono.

## Overview

**OpenMoney** is an open-source quantitative investment research and portfolio intelligence platform that goes beyond data aggregation — it forecasts market scenarios, quantifies risk exposure across positions, and generates actionable recommendations (hold/cut/add/rebalance). Built for individual investors, quantitative analysts, and small-to-mid-size asset managers, OpenMoney combines real-time market data ingestion, a declarative strategy rule engine, portfolio analytics (VaR, Sharpe, drawdowns, factor exposure), and an investment journal that tracks prediction accuracy over time.

Unlike OpenBB (Python-only, data aggregation + AI workspace), Bloomberg Terminal ($24K/yr, consumption-only), and QuantConnect (cloud-only, code-only strategies), OpenMoney closes the loop: **Data → Forecast → Risk Assessment → Action → Journal → Learn**. It treats every investment decision as a testable hypothesis.

The architecture is directly inspired by OpenBB's proven plugin-based system — providers are interchangeable adapters, extensions are self-contained packages, and every API contract is typed via shared Zod schemas. The entire platform is **TypeScript-native** on Bun + Hono + Next.js.

## Problem statement

Investment professionals and serious retail investors currently juggle 3–5 disconnected tools:

- **OpenBB / Bloomberg / Reuters** for data and screening (no forecasting, no portfolio tracking)
- **QuantConnect / Backtrader** for backtesting (no live portfolio integration)
- **Portfolio Visualizer** for risk analytics (no API, no programmatic access)
- **Excel / Google Sheets** for position tracking (error-prone, no automation)
- **Notes apps** for investment journals (no prediction accuracy measurement)

No single platform combines **real-time portfolio tracking, deterministic strategy rules, risk forecasting, action recommendations, and journaling** in one system. Investors cannot answer: *"When I was 80% confident about this thesis, what was my actual accuracy? And based on today's risk metrics, should I hold, cut, or add?"*

OpenMoney solves this by creating a continuous intelligence loop that quantifies risk and recommends actions based on user-defined strategies, financial models, and portfolio context.

## Target users

| Persona | Technical level | Primary goal |
|---------|----------------|--------------|
| **Retail quant investor** | Intermediate (can configure YAML/UI rules) | Automate research, get position-level risk metrics, log and learn from trades |
| **Portfolio manager (small fund)** | Low–Intermediate | Daily risk dashboard, rebalancing signals, compliance-ready reporting |
| **Quantitative analyst** | High (TypeScript/Python) | Custom model integration, factor analysis, backtest new signals against live portfolio |
| **Financial content creator / educator** | Low–Intermediate | Demo strategies, track prediction accuracy, build transparent investment track records |
| **Solo 401k / IRA self-directed investor** | Low | Understand portfolio risk, get rebalance alerts, journal investment theses |

## Competitor analysis

| Competitor | What they do well | What they lack | Our advantage |
|------------|-------------------|----------------|---------------|
| **OpenBB** | 100+ data source integrations, AI Copilot, customizable dashboards, REST API + Python SDK, plugin-based provider architecture | No portfolio tracking (positions/cost basis/P&L), no strategy engine, no backtesting, no investment journal, Python-only stack | Forecasting engine + risk-aware action recommendations + prediction journal. TypeScript-native stack (Hono + Next.js). Same plugin architecture for Node.js ecosystem |
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

#### 3. Real-time market data ingestion (provider-based)

- **Description**: Automated pipeline that ingests market data from multiple interchangeable providers, normalizes it via a standard schema, and makes it available for analysis. Uses the **OpenBB-inspired provider adapter pattern**: every data source implements a common `OpenMoneyProvider` interface with the TET (Transform-Extract-Transform) lifecycle. Multiple providers can serve the same data type (e.g., `equity/historical` can be served by Polygon, FMP, or Alpha Vantage).
- **User story**: As a user, I want my portfolio positions to show live prices so that I always see current P&L without manual refreshing.
- **Acceptance criteria**:
  - Provider adapter interface: `query(params) → normalized data`
  - At least 1 primary provider (Polygon.io) with fallback chain
  - Real-time price updates via WebSocket for watched tickers
  - Daily EOD data batch for all tracked securities
  - Data quality checks: gap detection, staleness flags, anomaly detection
  - Rate-limit aware with automatic backoff
  - Users can configure provider priority order per data type
- **Technical notes**: Adapter pattern — `AbstractFetcher<Q, D>` base class, each provider implements `transformQuery()` → `extractData()` → `transformData()`. Standard schemas in `packages/schemas/`. TimescaleDB hypertables for time-series data. Redis Streams for buffering and backpressure.

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
- **Technical notes**: Computed server-side in the quant-engine service using TypeScript-native libraries (`nanuquant-ts`, `mathjs`, `simple-statistics`) with Python bridge (`Bun.spawn()`) for advanced models. Results cached in Redis, invalidated on new data or position changes.

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
  - Technical indicators: RSI(14), MACD, SMA(50/200) cross, volume spike (computed via `trading-signals`)
  - Quick link to create journal entry or add to portfolio
- **Technical notes**: Technical indicators computed in quant-engine using `trading-signals` (pure TypeScript). Watched tickers subscribe to WebSocket feed.

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

- **Description**: Visual and YAML-based editor for defining investment strategies as conditional rules.
- **User story**: As a quant, I want to define custom strategy rules so that the recommendation engine reflects my investment philosophy.
- **Acceptance criteria**:
  - Rule definition with conditions (price, P&L, technical indicators, risk metrics)
  - AND/OR/NOT nesting
  - Action assignment: hold/add/reduce/exit with confidence modifier
  - Backtest against historical data
  - Share/import rule templates
- **Technical notes**: Rules stored as JSON schema in PostgreSQL. Rule engine uses expression tree evaluation.

#### 2. Forecasting & prediction models

- **Description**: Statistical and ML-based price forecasting (short-term and medium-term) using models like ARIMA, GARCH, Monte Carlo simulation.
- **User story**: As a quant analyst, I want to see forecasted price ranges for my positions so that I can assess forward-looking risk.
- **Acceptance criteria**:
  - ARIMA/SARIMA short-term price forecast (5–30 days) with confidence intervals (via `arima` package)
  - GARCH volatility forecasting (via Python bridge + `garch` npm package)
  - Monte Carlo simulation for portfolio value distribution (10K paths, via `mathjs` matrix ops)
  - Forecast visualization (fan chart with confidence bands, via `lightweight-charts`)
  - Model accuracy tracking (compare forecast vs actual)
- **Technical notes**: Runs as batch jobs. Uses `arima` (TypeScript), Python bridge for complex GARCH, and `mathjs` + `@stdlib/stdlib` for numerical computing.

#### 3. Broker integration

- **Description**: Connect brokerage accounts (Alpaca, Interactive Brokers) for automatic portfolio synchronization and one-click trade execution from recommendations.
- **User story**: As a power user, I want to sync my broker positions automatically and execute recommended trades with one click.
- **Acceptance criteria**:
  - OAuth-based broker connection
  - Auto-sync positions and transactions
  - Trade execution from recommendation UI
  - Order status tracking
- **Technical notes**: Each broker implemented as an adapter using the same provider interface pattern. Paper trading mode for testing.

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
- **Mobile native app**: Web-first with responsive design. Native apps are post-MVP.

## Technical architecture

### Tech stack

| Layer | Technology | Version | Reason chosen |
|-------|-----------|---------|---------------|
| **Frontend** | Next.js (App Router) | 15.x | SSG + SSR, React Server Components, Fumadocs integration, TypeScript-native |
| **UI Components** | `@openmoney/ui` (custom) + shadcn/ui | latest | Self-owned design system package consumed by `openmoney-web`. Leverages shadcn/ui primitives (button, card, input, dialog, etc.) as foundational building blocks, with all components owned and themed within the monorepo. Future-ready for custom theming |
| **UI Styling** | Tailwind CSS | 4.x | Utility-first CSS, design tokens via CSS variables, dark mode support, container queries |
| **Backend API** | Hono | 4.x | Ultrafast, Web Standard API, first-class TypeScript, Bun-native, WebSocket support, Zod integration |
| **API Runtime** | Bun | 1.2+ | TypeScript without transpilation, native WebSocket, fastest JS runtime, bun:test |
| **Database** | PostgreSQL + TimescaleDB | 15+ / 2.x | Relational data (users, portfolios) + hypertables for time-series market data |
| **ORM** | Prisma | 6.x | Type-safe queries, auto-generated client, migrations, better-auth integration |
| **Auth** | better-auth | 1.6+ | Framework-agnostic, Prisma adapter, OAuth, 2FA, RBAC, open-source, self-hosted |
| **Cache / Real-time** | Redis | 7.x | Session store, rate limiting, pub/sub for WebSocket events, job queues |
| **Documentation** | Fumadocs | latest | Next.js-native, OpenAPI integration, MDX, full-text search, RSC |
| **Package manager** | Bun | 1.2+ | Workspaces (monorepo), faster installs, built-in test runner |
| **Language** | TypeScript | 5.x | Strict mode only. Zero `.js` files. Full monorepo type-checking via project references |
| **Data validation** | Zod | 3.x | TypeScript-first schema validation, Hono integration via `@hono/zod-validator`. Shared schemas in `packages/schemas` |
| **Message queue** | Redis Streams | — | Lightweight, no Kafka overhead for MVP, built into Redis |
| **Technical indicators** | `trading-signals` | 7.x | Pure TypeScript, actively maintained, 20+ indicators. Zero native dependencies |
| **Portfolio risk analytics** | `nanuquant-ts` / custom | 1.x | Zero-dependency TypeScript: Sharpe, Sortino, VaR, drawdown, risk parity |
| **Time-series / ARIMA** | `arima` | 0.2.x | C/C++ via Emscripten, ARIMA/SARIMA/SARIMAX/AutoARIMA in native Node.js |
| **Numerical computing** | `mathjs` + `ml-matrix` | 15.x / 6.x | Matrix ops, statistics, optimization, linear algebra |
| **Statistics / distributions** | `simple-statistics` + `@stdlib/stdlib` | 7.x / 0.3.x | Linear regression, distributions, hypothesis testing, special functions |
| **Charting (financial)** | `lightweight-charts` | 5.x | Industry standard for candlestick/financial charts. Canvas-based, zero deps, built by TradingView |
| **Charting (general)** | `d3fc` | 15.x | D3-based financial chart components for advanced visualizations |
| **Python bridge** | `Bun.spawn()` | — | JSON stdin/stdout protocol with Python for complex models (GARCH, QuantStats, statsmodels) |
| **Data provider SDKs** | `@polygon.io/client-js`, `yahoo-finance2`, etc. | latest | Official TypeScript SDKs for market data providers |
| **Containerization** | Docker / Docker Compose | latest | Local development and CI parity |
| **Orchestration** | Kubernetes (K3s for dev, EKS/GKE for prod) | — | Production deployment, auto-scaling ingestion workers |
| **CI/CD** | GitHub Actions | — | Monorepo CI, lint, typecheck, test, build, deploy |

### Architecture principles (inspired by OpenBB)

1. **Provider-based data abstraction** — Every data source is an interchangeable adapter implementing a standard interface. Users configure which provider serves each data type. Adding a new provider means writing one adapter class — no core changes needed. Modeled after OpenBB's `Provider` → `Fetcher` → TET pattern.

2. **Standard schemas with provider extensions** — Each data domain (e.g., `equity/historical`) has a **standard Zod schema** defining canonical fields. Providers extend these schemas with additional fields. All provider data conforms to the standard schema plus unique fields. This mirrors OpenBB's `standard_models/` + provider-specific model pattern.

3. **Multi-provider resolution** — When multiple providers serve the same data type (e.g., Polygon and Alpha Vantage both provide historical prices), the system uses user-configured provider priority. The request specifies `provider=polygon` (or falls back to the user's default). This mirrors OpenBB's `ProviderChoices` pattern — each command accepts a `provider` parameter.

4. **Plugin-based discovery** — Providers and extensions are self-describing packages within the monorepo. Adding a new `packages/providers/<name>/` with the correct export makes it available automatically. Inspired by OpenBB's entry point system.

5. **Command pattern for API routes** — Each API endpoint is a "command" with typed inputs (Zod schema), typed outputs (Zod schema), and a handler function. Commands enable automatic OpenAPI generation and type-safe clients. Inspired by OpenBB's `@router.command(model="...")` decorator.

6. **TET lifecycle** — Every data fetch follows: `transformQuery(params)` → `extractData(query, credentials)` → `transformData(raw)`. Direct port of OpenBB's `Fetcher[Q, D]` abstract class.

### API versioning strategy

API versions are **not** embedded in URL paths. Instead:
- **Package version** (`package.json`) communicates the API version
- **Content negotiation** via `Accept` header can be used for breaking changes
- **Backward compatibility** is maintained within major versions
- The OpenAPI spec document clearly states the version in its info block

This matches OpenBB's approach — there are no `/v1/` prefixes in their routes. Versioning is handled through package release management.

### Services breakdown

| Service | Responsibility | Tech | Port |
|---------|---------------|------|------|
| `openmoney-api` | Main Hono API server: routes, auth middleware, rate limiting, CORS, request validation. Provider-agnostic command dispatcher. This is the **primary integration point** — all services expose their functionality through this gateway | Hono + Bun | 4000 |
| `openmoney-web` | Next.js application: UI, SSR, SSG, RSC, user dashboard. Consumes the API | Next.js | 3000 |
| `openmoney-ingestion` | Market data pipeline: WebSocket listeners, REST pollers, data normalization, quality checks, rate limiting. Provider adapters run here | Hono + Bun + Redis | 4001 |
| `openmoney-quant` | Quant & risk engine: technical indicators, risk models, forecasting, rule engine. Uses `trading-signals`, `nanuquant-ts`, `mathjs`, Python bridge | Bun | 4002 |
| `openmoney-notify` | Notification service: email, web push, WebSocket alerts, daily digest | Hono + Bun | 4003 |
| `openmoney-docs` | Documentation site (Fumadocs) | Next.js | 3001 |
| `redis` | Cache, pub/sub, rate limiting, session store | Redis | 6379 |
| `db` | PostgreSQL + TimescaleDB | Postgres 15+ | 5432 |

Each service is designed to be **independently deployable** and **integrable**:
- Services communicate via HTTP/REST (synchronous) and Redis pub/sub (async)
- The API gateway (`openmoney-api`) can embed any service's functionality directly via shared packages
- For smaller deployments, all services can run in a single process using the shared package layer
- For larger deployments, services scale independently

### Provider system architecture (OpenBB-inspired)

```
packages/openmoney-providers/           ← All provider packages
├── openmoney-core/            ← Provider infrastructure (abstract interfaces, registry)
│   ├── src/
│   │   ├── abstract/
│   │   │   ├── abstract-fetcher.ts     ← AbstractFetcher<Q, D> — TET lifecycle
│   │   │   ├── abstract-provider.ts    ← AbstractProvider — provider descriptor
│   │   │   ├── data.ts                 ← Base Data model
│   │   │   └── query-params.ts         ← Base QueryParams model
│   │   ├── registry.ts                 ← ProviderRegistry — stores all providers
│   │   ├── registry-map.ts             ← RegistryMap — introspects fetcher types
│   │   ├── query-executor.ts           ← QueryExecutor — resolves provider+fetcher, dispatches
│   │   └── errors.ts                   ← ProviderError, EmptyDataError, UnauthorizedError
│   └── package.json
│
├── openmoney-polygon/         ← Polygon.io (primary real-time + historical)
│   ├── src/
│   │   ├── polygon-provider.ts         ← Provider registration
│   │   ├── models/
│   │   │   ├── equity-historical.ts    ← PolygonEquityHistoricalFetcher
│   │   │   ├── equity-quote.ts         ← PolygonEquityQuoteFetcher
│   │   │   └── ...
│   │   └── utils/
│   │       ├── api.ts                  ← HTTP helpers, URL builders
│   │       └── types.ts                ← Enums, constants
│   └── package.json
│
├── openmoney-yfinance/        ← Yahoo Finance (free fallback)
│   ├── src/
│   │   ├── yfinance-provider.ts
│   │   └── models/
│   └── package.json
│
├── openmoney-alphavantage/    ← Alpha Vantage (secondary REST)
│   ├── src/
│   │   ├── alphavantage-provider.ts
│   │   └── models/
│   └── package.json
│
├── openmoney-fmp/             ← Financial Modeling Prep (fundamentals)
│   ├── src/
│   │   ├── fmp-provider.ts
│   │   └── models/
│   └── package.json
│
└── openmoney-fred/            ← FRED (economic data)
    └── ...
```

**Provider registration** — each provider registers itself:

```typescript
// packages/openmoney-provider-polygon/src/polygon-provider.ts
import { AbstractProvider } from "@openmoney/provider-core";

export const polygonProvider = new AbstractProvider({
  name: "polygon",
  description: "Polygon.io provides real-time and historical market data.",
  website: "https://polygon.io",
  credentials: ["api_key"],
  fetcherMap: {                              // ← maps model names to fetcher classes
    "equity/historical": PolygonEquityHistoricalFetcher,
    "equity/quote": PolygonEquityQuoteFetcher,
    "forex/historical": PolygonForexHistoricalFetcher,
    // ...
  },
});
```

**Fetcher TET pattern** (port of OpenBB's `Fetcher[Q, D]`):

```typescript
// packages/openmoney-provider-polygon/src/models/equity-historical.ts
import { AbstractFetcher } from "@openmoney/provider-core";
import { z } from "zod";

// 1. Standard schema (from packages/openmoney-schemas)
import { EquityHistoricalQueryParams, EquityHistoricalData } from "@openmoney/schemas";

// 2. Provider-specific extensions (additional fields Polygon returns)
export const polygonEquityHistoricalData = EquityHistoricalData.extend({
  change: z.number().nullish(),
  changePercent: z.number().nullish(),
});

// 3. Fetcher with TET lifecycle
export class PolygonEquityHistoricalFetcher extends AbstractFetcher<
  typeof EquityHistoricalQueryParams,
  typeof polygonEquityHistoricalData
> {
  requireCredentials = true;

  // Step 1: Transform user params to provider-specific format
  async transformQuery(params: z.input<typeof EquityHistoricalQueryParams>) {
    return {
      ...params,
      startDate: params.startDate ?? subYears(new Date(), 1),
      endDate: params.endDate ?? new Date(),
      adjusted: params.adjusted ?? "true",
    };
  }

  // Step 2: Extract raw data from provider API
  async extractData(
    query: z.infer<typeof EquityHistoricalQueryParams>,
    credentials: Record<string, string>,
  ): Promise<unknown> {
    const url = buildPolygonUrl("/v2/aggs/ticker/{symbol}/range/1/day/...", query);
    return fetchPolygon(url, { apiKey: credentials["polygon_api_key"] });
  }

  // Step 3: Transform raw API response into standard Data model
  async transformData(raw: unknown): Promise<z.infer<typeof polygonEquityHistoricalData>[]> {
    const results = (raw as any).results ?? [];
    return results.map((item: any) => polygonEquityHistoricalData.parse({
      date: new Date(item.t),
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
      vwap: item.vw,
      change: item.c - item.pc,
      changePercent: (item.c - item.pc) / item.pc,
    }));
  }
}
```

### Multi-provider resolution

When multiple providers serve the same data type (e.g., `equity/historical`):

```typescript
// Provider interface merges all providers that serve the same model
interface ProviderChoices {
  provider: "polygon" | "fmp" | "alphavantage" | "yfinance";
}

// API route: GET /api/equity/historical
// Query param: provider=polygon (optional, defaults to user's configured preference)
// App will check: user preference → cache → preferred provider → fallback chain
```

**How it works:**

1. Each model name (e.g., `equity/historical`) has a **standard schema** in `packages/openmoney-schemas`
2. Multiple providers can register a fetcher for the same model name via their `fetcherMap`
3. The `ProviderRegistry` indexes by model name: `Map<modelName, Map<providerName, Fetcher>>`
4. API routes accept a `provider` query parameter — defaults to user's configured preference
5. The `QueryExecutor` resolves: provider+model → fetcher → execute TET pipeline
6. Fallback chain: if primary provider fails, the system tries the next configured fallback

```typescript
// packages/openmoney-provider-core/src/registry.ts
type FetcherMap = Map<string, Map<string, AbstractFetcher>>;
// "equity/historical" → {"polygon": PolygonFetcher, "fmp": FMPFetcher, "yfinance": YFinanceFetcher}

// packages/openmoney-provider-core/src/query-executor.ts
class QueryExecutor {
  async execute(modelName: string, provider: string, params: object, credentials: object) {
    const providerFetchers = this.registry.get(modelName, provider);
    return providerFetchers.fetchData(params, credentials);
  }
}
```

### Standard schemas (Zod, in `packages/openmoney-schemas`)

Models ported from OpenBB's `standard_models/` into TypeScript Zod schemas:

```
packages/openmoney-schemas/src/
├── index.ts
├── equity/
│   ├── equity-historical.ts     // symbol, startDate, endDate → date, open, high, low, close, volume, vwap
│   ├── equity-quote.ts          // symbol → price, change, changePercent, volume, bid, ask
│   ├── equity-screener.ts       // marketCapMin, priceMin, betaMax, etc.
│   ├── equity-info.ts           // company name, industry, sector, description, marketCap
│   ├── equity-search.ts         // query, isSymbol → symbol, name, exchange, type
│   ├── equity-peers.ts          // symbol → peers list
│   ├── equity-ownership.ts      // symbol → holder, shares, value, date
│   ├── equity-ftd.ts            // symbol → settlementDate, quantity, price
│   └── ...
├── etf/
│   ├── etf-historical.ts
│   ├── etf-info.ts
│   ├── etf-holdings.ts
│   ├── etf-search.ts
│   └── ...
├── forex/
│   ├── forex-historical.ts
│   ├── forex-pairs.ts
│   └── forex-snapshots.ts
├── crypto/
│   ├── crypto-historical.ts
│   └── crypto-search.ts
├── economic/
│   ├── fred-series.ts
│   ├── fred-search.ts
│   ├── economic-calendar.ts
│   ├── treasury-rates.ts
│   ├── yield-curve.ts
│   └── gdp.ts
├── fixedincome/
│   ├── treasury-prices.ts
│   ├── bond-prices.ts
│   └── bond-reference.ts
├── derivatives/
│   ├── options-chains.ts
│   ├── options-snapshots.ts
│   └── futures-curve.ts
├── fundamentals/
│   ├── income-statement.ts
│   ├── balance-sheet.ts
│   ├── cash-flow.ts
│   ├── financial-ratios.ts
│   ├── key-metrics.ts
│   ├── analyst-estimates.ts
│   ├── insider-trading.ts
│   ├── institutional-ownership.ts
│   └── earnings-call-transcript.ts
├── news/
│   ├── company-news.ts
│   └── world-news.ts
├── reference/
│   ├── symbol-map.ts
│   ├── cik-map.ts
│   └── index-constituents.ts
└── ...
```

Each schema file exports both `QueryParams` (Zod input schema) and `Data` (Zod output schema):

```typescript
// packages/openmoney-schemas/src/equity/equity-historical.ts
import { z } from "zod";

export const equityHistoricalQueryParams = z.object({
  symbol: z.string().transform((v) => v.toUpperCase()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  interval: z.enum(["1m", "5m", "15m", "30m", "1h", "4h", "1d"]).default("1d"),
});

export const equityHistoricalData = z.object({
  date: z.coerce.date(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().nullish(),
  vwap: z.number().nullish(),
});

export type EquityHistoricalQueryParams = z.input<typeof equityHistoricalQueryParams>;
export type EquityHistoricalData = z.output<typeof equityHistoricalData>;
```

### Data models (database)

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
  accounts      Account[]
  sessions      Session[]
  portfolios    Portfolio[]
  watchlists    Watchlist[]
  journalEntries JournalEntry[]
}
```

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
  name        String?
  assetClass  String @default("equity")
  quantity    Decimal
  avgEntryPrice Decimal
  currentPrice  Decimal?
  costBasis     Decimal
  marketValue   Decimal?
  unrealizedP&L Decimal?
  unrealizedP&LPercent Decimal?
  openedAt    DateTime
  closedAt    DateTime?
  isOpen      Boolean @default(true)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id])
  @@index([portfolioId, ticker])
  @@index([ticker])
  @@index([isOpen])
}
```

#### MarketData (TimescaleDB hypertable)

```
MarketData {
  time        DateTime
  ticker      String
  open        Decimal
  high        Decimal
  low         Decimal
  close       Decimal
  volume      Decimal?
  vwap        Decimal?
  interval    String         // "1m", "5m", "1h", "1d"
  source      String         // "polygon", "alphavantage", "yfinance"
  createdAt   DateTime @default(now())
}
@@hypertable("time", chunk_time_interval => '1 day')
@@compression(compress_for => '6 months')
@@index([ticker, time, interval])
@@index([time])
```

#### Signal

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
  metadata    Json?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  portfolio   Portfolio? @relation(fields: [portfolioId], references: [id])
  @@index([ticker, createdAt])
  @@index([portfolioId])
  @@index([type, createdAt])
}
```

#### Prediction (journal entry)

```
Prediction {
  id            String @id @default(cuid())
  title         String
  ticker        String?
  direction     String         // "bullish", "bearish", "neutral"
  thesis        String
  catalysts     String?
  timeframe     String         // "short_term", "medium_term", "long_term"
  confidence    Int            // 50–99
  expectedOutcome String?
  actualOutcome  String?       // "correct", "incorrect", "too_early", "too_late", "unresolved"
  outcomeDate   DateTime?
  outcomeNotes  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String
  user          User @relation(fields: [userId], references: [id])
  positionId    String?
  position      Position? @relation(fields: [positionId], references: [id])
  @@index([userId])
  @@index([userId, actualOutcome])
  @@index([ticker])
}
```

#### Watchlist + WatchlistItem

```
WatchlistItem {
  id          String @id @default(cuid())
  ticker      String
  note        String?
  addedAt     DateTime @default(now())
  watchlistId String
  watchlist   Watchlist @relation(fields: [watchlistId], references: [id])
}

Watchlist {
  id          String @id @default(cuid())
  name        String
  isDefault   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User @relation(fields: [userId], references: [id])
  items       WatchlistItem[]
}
```

#### StrategyRule (post-MVP)

```
StrategyRule {
  id          String @id @default(cuid())
  name        String
  description String?
  enabled     Boolean @default(true)
  conditions  Json
  actions     Json
  priority    Int @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User @relation(fields: [userId], references: [id])
}
```

### Provider credentials

```
ProviderCredential {
  id          String @id @default(cuid())
  provider    String         // "polygon", "fmp", "alphavantage", etc.
  label       String         // user-defined label for this credential set
  encryptedKey String        // encrypted API key
  isActive    Boolean @default(true)
  priority    Int @default(0)  // lower number = higher priority
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User @relation(fields: [userId], references: [id])
  @@unique([userId, provider, label])
}
```

### API overview

Routes are **not** version-prefixed. The `package.json` version communicates API compatibility. Breaking changes trigger a major version bump of the OpenMoney platform package.

#### Core portfolio management

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| ALL | `/api/auth/*` | better-auth routes (signup, login, OAuth, sessions, etc.) | Public / Cookie |

#### Portfolio routes (`/api/portfolio`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/portfolio` | List user portfolios | Required |
| POST | `/api/portfolio` | Create portfolio | Required |
| GET | `/api/portfolio/:id` | Portfolio detail with summary metrics | Required |
| PUT | `/api/portfolio/:id` | Update portfolio | Required |
| DELETE | `/api/portfolio/:id` | Delete portfolio | Required |
| GET | `/api/portfolio/:id/position` | List positions in portfolio | Required |
| POST | `/api/portfolio/:id/position` | Add position | Required |
| GET | `/api/portfolio/:id/risk` | Risk metrics for portfolio | Required |
| GET | `/api/portfolio/:id/recommendation` | Action recommendations | Required |
| GET | `/api/portfolio/:id/history` | Portfolio value over time | Required |

#### Position routes (`/api/position`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| PUT | `/api/position/:id` | Update position (edit, close) | Required |
| DELETE | `/api/position/:id` | Delete position | Required |

#### Market data routes (`/api/equity`, `/api/forex`, `/api/crypto`, etc.)

These routes accept a `provider` query parameter. If omitted, the user's default provider for that data type is used.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/equity/quote` | Real-time quote for tickers | Required |
| GET | `/api/equity/historical` | Historical OHLCV data | Required |
| GET | `/api/equity/search` | Ticker search | Required |
| GET | `/api/equity/profile` | Company profile/info | Required |
| GET | `/api/equity/screener` | Screen equities by criteria | Required |
| GET | `/api/equity/peers` | Get peer companies | Required |
| GET | `/api/equity/ownership` | Institutional ownership | Required |
| GET | `/api/equity/insider-trading` | Insider trading activity | Required |
| GET | `/api/forex/historical` | Forex historical data | Required |
| GET | `/api/forex/pairs` | Available currency pairs | Required |
| GET | `/api/crypto/historical` | Crypto historical data | Required |
| GET | `/api/crypto/search` | Crypto symbol search | Required |

#### Economic data routes (`/api/economic`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/economic/fred-series` | FRED time-series data | Required |
| GET | `/api/economic/fred-search` | Search FRED series | Required |
| GET | `/api/economic/treasury-rates` | Treasury yield rates | Required |
| GET | `/api/economic/yield-curve` | Yield curve data | Required |
| GET | `/api/economic/calendar` | Economic event calendar | Required |
| GET | `/api/economic/gdp` | GDP data | Required |

#### Fundamentas routes (`/api/fundamental`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/fundamental/income-statement` | Income statement | Required |
| GET | `/api/fundamental/balance-sheet` | Balance sheet | Required |
| GET | `/api/fundamental/cash-flow` | Cash flow statement | Required |
| GET | `/api/fundamental/financial-ratios` | Financial ratios | Required |
| GET | `/api/fundamental/key-metrics` | Key financial metrics | Required |
| GET | `/api/fundamental/analyst-estimates` | Analyst estimates | Required |
| GET | `/api/fundamental/earnings-transcript` | Earnings call transcripts | Required |
| GET | `/api/fundamental/dividends` | Historical dividends | Required |
| GET | `/api/fundamental/splits` | Stock split history | Required |

#### Watchlist routes (`/api/watchlist`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/watchlist` | List watchlists | Required |
| POST | `/api/watchlist` | Create watchlist | Required |
| GET | `/api/watchlist/:id` | Watchlist detail with tickers | Required |
| PUT | `/api/watchlist/:id` | Update watchlist | Required |
| DELETE | `/api/watchlist/:id` | Delete watchlist | Required |
| POST | `/api/watchlist/:id/item` | Add ticker to watchlist | Required |
| DELETE | `/api/watchlist/:id/item/:itemId` | Remove ticker from watchlist | Required |

#### Journal routes (`/api/journal`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/journal` | List journal entries | Required |
| POST | `/api/journal` | Create prediction entry | Required |
| GET | `/api/journal/:id` | Get journal entry | Required |
| PUT | `/api/journal/:id` | Update entry (add outcome) | Required |
| DELETE | `/api/journal/:id` | Delete entry | Required |
| GET | `/api/journal/stats` | Prediction accuracy statistics | Required |

#### Signal routes (`/api/signal`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/signal` | Recent signals for user | Required |
| GET | `/api/signal/:id` | Signal detail | Required |

#### Provider management routes (`/api/provider`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/provider` | List available providers and their coverage | Required |
| GET | `/api/provider/:name` | Provider details and supported models | Required |
| PUT | `/api/provider/:name/credential` | Set API credentials for a provider | Required |
| DELETE | `/api/provider/:name/credential/:id` | Remove stored credential | Required |
| PUT | `/api/provider/preference` | Set provider priority order per data type | Required |

#### User routes (`/api/user`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/user/profile` | Get user profile | Required |
| PUT | `/api/user/profile` | Update profile | Required |

#### WebSocket routes

| Path | Description | Auth |
|------|-------------|------|
| `/ws/market-data` | Real-time market data WebSocket | Required |
| `/ws/alert` | Real-time alerts WebSocket | Required |

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
  - better-auth manages authentication (sessions, OAuth, CSRF)
  - All API endpoints require authentication except auth routes and docs
  - Rate limiting per-user (100 req/min default for API, configurable)
  - HTTPS everywhere (TLS 1.3)
  - Data at rest: encrypted storage, app-level encryption for API keys
  - User-provided data source keys encrypted at rest via better-auth secrets
- **Availability**:
  - Target 99.5% uptime
  - Graceful degradation: stale cached data shown with freshness indicator
  - Automatic failover between data providers (primary → secondary → fallback)
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
| `/portfolio/[id]/recommendation` | Recommendations | Actionable signals with explanations | Yes |
| `/position/[id]` | Position detail | P&L chart, risk metrics, related signals, journal | Yes |
| `/watchlist` | Watchlists | All watchlists with real-time prices | Yes |
| `/watchlist/[id]` | Watchlist detail | Tickers with indicators, sortable table | Yes |
| `/journal` | Journal | Prediction entries, accuracy dashboard | Yes |
| `/journal/new` | New prediction | Structured journal entry form | Yes |
| `/journal/[id]` | Journal detail | Entry view with outcome tracking | Yes |
| `/search` | Market search | Ticker search with details | Yes |
| `/settings` | Settings | Profile, preferences, data source keys | Yes |
| `/settings/provider` | Data providers | Manage provider credentials, priority, coverage | Yes |
| `/settings/profile` | Profile | Personal information, preferences | Yes |
| `/docs` | Documentation | Fumadocs documentation site | No |
| `/docs/*` | Doc pages | Individual doc pages | No |

### UI/UX requirements

- **Design style**: Modern, data-dense, dark-mode-first with light mode support. Clean typography, generous use of charts (`lightweight-charts` for candlestick, `d3fc` for advanced), card-based layout.
- **Theme**: Dark mode default with light mode toggle. Accent color: Indigo (#4F46E5). Supporting palette for risk levels (green/yellow/red).
- **Typography**: Inter (UI), JetBrains Mono (data/monospace). Tailwind CSS for styling.
- **Mobile**: Responsive but not mobile-first. Optimized for desktop 1280px+. Phone view is informational only.
- **Key user flows**:
  1. **Daily check**: Sign in → Dashboard (overview, VaR, day P&L, top signals) → Drill into positions → Check recommendations
  2. **New investment**: Search ticker → Add to watchlist → Research → Add position → Write journal entry with thesis
  3. **Risk review**: Portfolio → Risk tab → Review VaR breakdown → Check position contributions → Adjust positions based on recommendations
  4. **Journal review**: Journal → View accuracy dashboard → Filter predictions → Add outcomes to resolved entries

### Component breakdown

All reusable UI components live in `packages/openmoney-ui/`. The `openmoney-web` app imports and composes them into pages. This ensures the design system is a single source of truth that other potential surfaces (future mobile app, embeddable widgets, etc.) can consume.

**Base primitives** (shadcn/ui, in `packages/openmoney-ui/src/components/ui/`):
- `Button`, `Input`, `Label`, `Card`, `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`, `Select`, `Tabs`, `Table`, `Badge`, `Avatar`, `Separator`, `Skeleton`, `Toast`, `Switch`, `Checkbox`, `RadioGroup`, `Calendar`

**Domain-specific components** (custom, in `packages/openmoney-ui/src/components/`):
- `Layout` (App shell with sidebar navigation, header with search + notifications + avatar)
- `Sidebar` (Navigation links, collapsed/expanded, portfolio switcher)
- `PortfolioSummary` (Value, P&L, allocation pie, period selector)
- `PositionTable` (Sortable table with ticker, quantity, price, P&L, risk indicators)
- `RiskGauge` (Visual risk indicator: VaR, drawdown)
- `RiskMetricsCard` (Key risk metric with historical sparkline)
- `ActionCard` (Recommendation with confidence badge, reasoning, action button)
- `SignalTimeline` (Chronological list of signals and alerts)
- `PriceChart` (Interactive OHLCV/line chart — using `lightweight-charts`)
- `AllocationPie` (D3-based pie chart with asset class breakdown)
- `CorrelationMatrix` (Heatmap of position correlations)
- `WatchlistTable` (Tickers with price, change, RSI, volume)
- `JournalForm` (Structured form: thesis, catalysts, timeframe, confidence)
- `JournalCard` (Prediction entry with outcome badge, timeline)
- `AccuracyDashboard` (Calibration curve, Brier score, accuracy by confidence)
- `SearchBar` (Ticker auto-complete with debounced API search)
- `NotificationBell` (Alert indicator with dropdown list)
- `DataFreshnessIndicator` (Shows age of last data update)
- `ProviderConfigPanel` (Configure provider API keys, set priority order)

## Infrastructure

### Environments

- **Local**: Docker Compose full stack (Next.js, Hono API, Postgres+TimescaleDB, Redis, ingestion workers)
- **Development**: Same as local, developers run `docker compose up` + `bun run dev`
- **Staging**: Kubernetes (K3s or EKS), mirrors production config, uses sandboxed data sources
- **Production**: Kubernetes (EKS or GKE), managed Postgres (RDS with TimescaleDB extension), ElastiCache Redis

### CI/CD requirements

- **On PR (each push)**:
  - `bun run lint` — ESLint + Prettier
  - `bun run typecheck` — TypeScript strict mode check across full monorepo
  - `bun run test` — Unit + integration tests (bun:test)
  - Build check: `bun run build` (Next.js + Hono)
  - Prisma: `npx prisma validate` + `npx prisma generate`
- **On merge to main**:
  - All PR checks
  - Build Docker images for all services
  - Push to container registry
  - Deploy to staging (helm upgrade or kubectl apply)
  - Run E2E tests against staging
- **On release tag (v*)**:
  - All main checks
  - Deploy to production with blue/green strategy
  - Run smoke tests against production
  - Notify on Slack/email

### Secrets and config

| Variable | Description | Service | Source |
|----------|-------------|---------|--------|
| `BETTER_AUTH_SECRET` | Auth signing secret | openmoney-api | Vault |
| `BETTER_AUTH_URL` | Auth base URL | openmoney-api | Env |
| `DATABASE_URL` | PostgreSQL connection string | openmoney-api, openmoney-quant | Vault |
| `REDIS_URL` | Redis connection string | all services | Vault |
| `SESSION_SECRET` | Session encryption key | openmoney-api | Vault |
| `NEXT_PUBLIC_API_URL` | Public API URL | openmoney-web | Env |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | openmoney-web | Env |
| `SMTP_HOST` / `SMTP_PORT` | Email server | openmoney-notify | Vault |
| `SMTP_USER` / `SMTP_PASS` | Email credentials | openmoney-notify | Vault |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth | openmoney-api | Vault |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Google OAuth | openmoney-api | Vault |
| `SENTRY_DSN` | Error tracking | all | Vault |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry endpoint | all | Env |

## Data ingestion pipeline architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INGESTION PIPELINE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   External Sources                    Workers                        │
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
│                                    │ (OpenBB TET: extract │       │
│                                    │  → transform step)   │       │
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

1. **Provider adapter pattern**: Each data source implements the `AbstractProvider` / `AbstractFetcher` interface. Providers are hot-swappable. Direct port of OpenBB's `Provider` → `Fetcher` pattern.

2. **Source hierarchy**: Polygon.io (primary WS + REST) → FMP (secondary REST for fundamentals) → Alpha Vantage (tertiary REST) → yfinance (free fallback). Users configure their own priority chain. Automatic failover on failure.

3. **Quality gates**: Before data enters TimescaleDB, the normalizer checks: gap detection, staleness, anomaly (>5 std dev), source consistency cross-reference.

4. **Backpressure**: Redis Streams buffer incoming data. Workers consume at their own pace. If queues grow too large, older data is aggregated into 1m bars before insertion.

5. **Data retention**: Raw tick data → 1 week. 1m bars → 6 months. 1h bars → 2 years. Daily bars → permanent. TimescaleDB compression (90% space savings) after 6 months.

## Quant engine architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          QUANT ENGINE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────┐   ┌──────────────────┐   ┌───────────────────┐  │
│   │ Tech Indicators   │   │ Risk Models      │   │ Forecasting       │  │
│   │ (trading-signals) │   │ (nanuquant-ts)   │   │                   │  │
│   │                  │   │                  │   │ - ARIMA (arima)   │  │
│   │ - RSI(14)       │   │ - VaR (hist)     │   │ - GARCH (bridge)  │  │
│   │ - MACD          │   │ - VaR (param)    │   │ - Monte Carlo     │  │
│   │ - SMA(50/200)   │   │ - CVaR           │   │   (mathjs)        │  │
│   │ - Bollinger     │   │ - Sharpe/Sortino │   │                   │  │
│   │ - Volume        │   │ - Max DD         │   └───────────────────┘  │
│   └──────────────────┘   │ - Beta/Correlation│                        │
│                          │ - Component VaR  │   ┌───────────────────┐  │
│   ┌──────────────────┐   └──────────────────┘   │ Signal Generator   │  │
│   │ Portfolio Stats  │                          │                    │  │
│   │ - Day/Total P&L │   ┌──────────────────┐   │ Rules → Action    │  │
│   │ - Allocation    │   │ Recompute        │   │ Thresholds → Alert│  │
│   │ - Returns       │   │ Scheduler        │   │ Forecasts → Signal│  │
│   └──────────────────┘   │ (event-driven)  │   └───────────────────┘  │
│                          │                 │                          │
│   ┌──────────────────┐   │ - On new data   │                          │
│   │ Prediction       │   │ - Daily cycle   │                          │
│   │ Tracker          │   │ - On demand     │                          │
│   │ - Brier score   │   └──────────────────┘                          │
│   │ - Calibration   │                                                 │
│   │ - Accuracy %    │                                                 │
│   └──────────────────┘                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Model execution**: The quant engine is event-driven. When new data arrives (via Redis pub/sub), it:
1. Recomputes technical indicators for affected tickers (via `trading-signals`)
2. Recalculates portfolio risk metrics (VaR, Sharpe, etc. via `nanuquant-ts`)
3. Evaluates rule conditions against new state
4. Generates signals (recommendations, alerts)
5. Pushes results to Redis cache and notifies connected clients via WebSocket

**Python bridge**: For models requiring Python libraries (statsmodels, arch, QuantStats):
- **MVP**: `Bun.spawn(["python3", "-c", script])` with JSON stdin/stdout
- **Post-MVP**: Optional Python FastAPI microservice for production deployments requiring higher throughput

## Monorepo structure

```
openmoney/
├── apps/                             ← Deployable applications
│   ├── openmoney-api/                ← Hono API gateway
│   │   ├── src/
│   │   │   ├── routes/               ← Route handlers (grouped by domain)
│   │   │   │   ├── portfolio.ts
│   │   │   │   ├── position.ts
│   │   │   │   ├── equity.ts         ← Delegates to provider system
│   │   │   │   ├── forex.ts
│   │   │   │   ├── crypto.ts
│   │   │   │   ├── economic.ts
│   │   │   │   ├── fundamental.ts
│   │   │   │   ├── watchlist.ts
│   │   │   │   ├── journal.ts
│   │   │   │   ├── signal.ts
│   │   │   │   ├── provider.ts       ← Provider management
│   │   │   │   ├── user.ts
│   │   │   │   └── auth.ts
│   │   │   ├── middleware/           ← Auth, CORS, rate limit, provider injection
│   │   │   ├── lib/                  ← Server utilities
│   │   │   └── config/              ← App configuration
│   │   └── package.json
│   │
│   ├── openmoney-web/                ← Next.js frontend
│   │   ├── app/                      ← App Router pages
│   │   ├── components/               ← Shared UI components
│   │   ├── lib/                      ← Client utilities
│   │   └── package.json
│   │
│   ├── openmoney-ingestion/          ← Market data ingestion workers
│   │   ├── src/
│   │   │   ├── workers/             ← WS listeners, REST pollers
│   │   │   └── normalizer/          ← Data quality & normalization
│   │   └── package.json
│   │
│   ├── openmoney-quant/              ← Quant & risk engine
│   │   ├── src/
│   │   │   ├── indicators/          ← trading-signals wrappers
│   │   │   ├── models/              ← Risk & forecasting models
│   │   │   ├── rules/               ← Strategy rule engine
│   │   │   ├── signals/             ← Signal generator
│   │   │   └── python-bridge/       ← Python subprocess scripts
│   │   └── package.json
│   │
│   ├── openmoney-notify/             ← Notification service
│   │   ├── src/
│   │   │   ├── channels/            ← Email, web push, WebSocket
│   │   │   └── templates/
│   │   └── package.json
│   │
│   └── openmoney-docs/               ← Fumadocs documentation site
│       └── package.json
│
├── packages/                          ← Shared libraries (the "platform")
│   ├── openmoney-ui/                  ← Design system & shared UI components
│   │   ├── src/
│   │   │   ├── components/            ← Reusable React components (shadcn/ui primitives + custom)
│   │   │   │   ├── ui/               ← shadcn/ui base components (button, input, card, etc.)
│   │   │   │   ├── data/             ← Data-dense components (tables, charts, grids)
│   │   │   │   ├── layout/           ← Layout components (sidebar, header, shell)
│   │   │   │   └── forms/            ← Form components (select, autocomplete, date picker)
│   │   │   ├── hooks/                ← Shared React hooks
│   │   │   ├── lib/                  ← UI utilities (cn(), formatters, validators)
│   │   │   ├── tokens/              ← Design tokens (colors, spacing, typography)
│   │   │   └── tailwind/            ← Tailwind plugins & presets
│   │   ├── tailwind.config.ts        ← Tailwind preset for consuming apps
│   │   ├── postcss.config.ts
│   │   ├── globals.css               ← Base styles, CSS variables, dark mode
│   │   └── package.json
│   │
│   ├── openmoney-core/               ← Core framework: Router, CommandRunner, middlewares
│   │   ├── src/
│   │   │   ├── router.ts             ← Router class (inspired by OpenBB Router)
│   │   │   ├── command-runner.ts     ← Command execution pipeline
│   │   │   ├── query.ts              ← Query dispatcher → provider system
│   │   │   ├── obbject.ts            ← OpenMoneyResult wrapper
│   │   │   └── middleware/
│   │   └── package.json
│   │
│   ├── openmoney-provider-core/      ← Provider infrastructure
│   │   ├── src/
│   │   │   ├── abstract/
│   │   │   │   ├── abstract-provider.ts
│   │   │   │   ├── abstract-fetcher.ts
│   │   │   │   ├── data.ts
│   │   │   │   └── query-params.ts
│   │   │   ├── registry.ts
│   │   │   ├── registry-map.ts
│   │   │   ├── query-executor.ts
│   │   │   └── errors.ts
│   │   └── package.json
│   │
│   ├── openmoney-schemas/            ← Zod schemas (standard data models)
│   │   ├── src/
│   │   │   ├── equity/
│   │   │   ├── forex/
│   │   │   ├── crypto/
│   │   │   ├── economic/
│   │   │   ├── fixedincome/
│   │   │   ├── derivatives/
│   │   │   ├── fundamentals/
│   │   │   ├── news/
│   │   │   └── reference/
│   │   └── package.json
│   │
│   ├── openmoney-database/           ← Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── openmoney-config/             ← Shared configuration
│   │   └── src/
│   │
│   ├── openmoney-provider-polygon/   ← Polygon.io provider adapter
│   │   ├── src/
│   │   │   ├── polygon-provider.ts
│   │   │   ├── models/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── openmoney-provider-yfinance/  ← Yahoo Finance provider
│   │   └── ...
│   │
│   ├── openmoney-provider-fmp/       ← Financial Modeling Prep provider
│   │   └── ...
│   │
│   └── openmoney-provider-fred/      ← FRED economic data provider
│       └── ...
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── Dockerfile.ingestion
│   ├── Dockerfile.quant
│   └── compose.yml
│
├── kubernetes/
│   ├── api-gateway.yaml
│   ├── web-frontend.yaml
│   ├── ingestion.yaml
│   └── quant-engine.yaml
│
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
│
├── reference/                        ← OpenBB Python codebase (for architecture reference)
├── specs.md                          ← This file
├── package.json                      ← Root workspace config
├── bun.lock
├── tsconfig.base.json                ← Shared TS strict mode config
└── README.md
```

## Open questions

1. **Provider credential storage**: Should credentials be stored in the `ProviderCredential` database table (encrypted at rest) or delegated entirely to better-auth's secret store? **Recommendation**: better-auth's secret management is simpler for MVP, but a dedicated `ProviderCredential` table gives us more flexibility for multiple credential sets per provider.

2. **Provider fallback logic**: When a provider fails, should the system automatically fall back to the next provider and cache the result? Or should it surface the error and let the user retry? **Recommendation**: Automatic fallback with a `provider` field on the response indicating which provider served the data.

3. **Python bridge scaling**: `Bun.spawn()` works for MVP but may be slow under load. Consider a dedicated Python sidecar microservice (FastAPI) for production deployments.

4. **Extensibility for non-monorepo users**: Should third-party developers be able to write external provider packages (installed via npm) that the ProviderRegistry discovers at runtime? This would require a plugin discovery mechanism similar to OpenBB's entry points. **MVP**: Monorepo-only providers. **Post-MVP**: npm plugin discovery via a `openmoney-provider` keyword convention.

5. **Error handling standardization**: OpenBB uses `OpenBBError`, `EmptyDataError`, `UnauthorizedError`, `OpenBBWarning`, and `OpenBBErrorResponse` Pydantic model for API errors. Should we adopt a similar hierarchy? **Recommendation**: Yes — `OpenMoneyError(BaseError)`, `EmptyDataError(OpenMoneyError)`, `ProviderAuthError(OpenMoneyError)`.

## Assumptions made

1. **User has existing broker accounts**: We assume users already have brokerage accounts elsewhere. We do not build a brokerage.
2. **Bring-your-own data API keys**: MVP requires users to configure their own data source API keys. OpenMoney does not bundle or resell market data. This matches OpenBB's model.
3. **Desktop-first usage**: Users will primarily access OpenMoney from a desktop browser during market hours.
4. **US markets initially**: MVP focuses on US equities and ETFs. International markets, crypto, forex, and fixed income are post-MVP.
5. **Daily computation cycle**: Risk metrics and recommendations are computed on a daily cycle and on-demand. Real-time updates are for prices and P&L only.
6. **Single-user focus**: MVP is designed for individual users. Team/advisor features are post-MVP.
7. **No regulatory compliance burden**: OpenMoney provides analytical tools and recommendations. It does not execute trades, hold funds, or function as a broker-dealer.
8. **TypeScript strict mode throughout**: Full strict mode with `strictNullChecks`, `noImplicitAny`, `exactOptionalPropertyTypes`.
9. **Bun as primary runtime**: All local development, testing, and production API serving uses Bun.
10. **Provider architecture is a direct port of OpenBB**: The `AbstractFetcher` TET pattern, `ProviderRegistry`, `ProviderInterface`, `QueryExecutor`, and standard models are modeled on OpenBB's proven architecture. Always consult the `reference/` folder when implementing provider infrastructure.
11. **TypeScript-first quant models**: 70% of quant models run in native TypeScript. Python bridge reserved for models with no viable TypeScript equivalent.
12. **Reference codebase in `reference/`**: The `reference/` folder contains the full OpenBB platform codebase. Every pattern decision is validated against this reference. Before implementing any provider, fetcher, router, registry, or extension infrastructure, consult the reference codebase for the proven pattern.
