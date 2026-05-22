# Spec: provider-frontend-wire

Scope: feature

# Provider-Frontend Integration Spec

## Current State (Audit Findings)

### Architecture

```
HTTP Request → Hono route → Zod validation → executeProviderQuery()
  → QueryExecutor → ProviderRegistry → AbstractProvider → fetcherMap
    → AbstractFetcher.fetchData() → TET pipeline → ApiResponse<T>
```

### Critical Issues Found

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | Only 14/33 providers registered | **Critical** | 19 data sources unavailable |
| 2 | Domain routes can't pass credentials | **Critical** | `?provider=fmp` always fails |
| 3 | Frontend uses MOCK_INDICES | **Critical** | Dashboard/markets show fake data |
| 4 | Frontend API client uses `/api/v1/*` for market data | **Critical** | Points at wrong routes |
| 5 | Response envelope fragmented (ApiResponse vs OBBject) | High | Inconsistent API surface |
| 6 | RequestId split between middleware and response body | Medium | Distributed tracing broken |
| 7 | No rate limiting on public endpoints | High | Abuse vector |
| 8 | No provider-default-per-user | Medium | Hardcoded "yfinance" fallback |
| 9 | No real-time market data (WebSocket) | Medium | No live updates |
| 10 | QueryExecutor instantiated per router | Low | Unnecessary allocation |

### Provider Status Matrix

**Registered (14):** yfinance, fmp, alphavantage, polygon, sec, tmx, cboe, deribit, ecb, finviz, government_us, nasdaq, fred

**Unregistered (19):** benzinga, biztoc, bls, cftc, congress_gov, econdb, eia, famafrench, federal_reserve, finra, imf, intrinio, multpl, oecd, seeking_alpha, stockgrid, tiingo, tradier, tradingeconomics, wsj

## Target Architecture

### API Path Pattern (enforced)

```
✅ /api/equity/quote?symbol=AAPL&provider=fmp
✅ /api/equity/historical?symbol=AAPL&provider=yfinance
✅ /api/providers                         — registry listing
✅ /api/providers/:name                   — provider details
✅ /api/ws/market                         — WebSocket streaming

❌ /api/v1/equity/quote                   — NO version in path
❌ /api/v1/market-data/quote              — NO v1 anywhere
```

### Response Envelope (standardized to OBBject)

```typescript
// OBBject<T> — the ONE response format for ALL provider queries
interface OBBject<T> {
  results: T;
  metadata: {
    provider: string;
    model: string;
    timestamp: string;
    requestId: string;       // SAME as X-Request-Id header
    duration: number;         // ms
  };
}
```

### Credential Flow (fixed)

```
1. User stores provider keys in DB (settings page)
2. API reads keys from DB per-user, per-request
3. Domain routes thread credentials from authenticated user
4. Public routes use env-fallback for anonymous queries
5. QueryExecutor filters to required keys per model
```

## Implementation Steps

### Step 1: Register All Providers

**File:** `apps/api/src/lib/provider-init.ts`

Add imports + registration for all 19 unregistered providers. Pattern:

```typescript
import { xyzProvider } from "@openmoney/providers/xyz";
globalRegistry.register(xyzProvider);
```

### Step 2: Standardize Response to OBBject

**Files:** `apps/api/src/lib/response.ts`, all route files

- Replace `ApiResponse<T>` / `ApiError` with `OBBject<T>` 
- Thread `requestId` from middleware context into response body
- Remove `ApiResponse`/`ApiError` types from frontend `api.ts`
- All routes return `OBBject<T>` or appropriate HTTP error

### Step 3: Fix Credential Flow

**Files:** `apps/api/src/routes/helpers.ts`, all domain routers

- Add `getUserCredentials(userId, provider)` helper
- Thread credentials from authenticated session for domain routes
- Add env-var fallback for public routes
- Store credentials in `provider_credentials` DB table

### Step 4: Fix Frontend API Client

**File:** `apps/web/src/lib/api.ts`

- Remove all `/api/v1/` path prefixes
- Add typed market data methods:
  - `api.market.quote(symbol, provider?)` → `GET /api/equity/quote`
  - `api.market.historical(symbol, opts)` → `GET /api/equity/historical`
  - `api.market.search(query)` → `GET /api/search`
  - `api.market.providers.list()` → `GET /api/providers`
- Add Hono RPC client for type-safe calls
- Export generated types from shared schemas

### Step 5: Replace Mock Data with Live API

**Files:** `apps/web/src/app/(authenticated)/dashboard/page.tsx`, `markets/page.tsx`

- Remove `MOCK_INDICES` constant
- Fetch real quotes from `/api/equity/quote` for S&P 500, NASDAQ, DOW
- Add loading skeletons for data freshness
- Show `DataFreshnessIndicator` component
- Add error states with retry button

### Step 6: Provider Registry UI (shadcn-inspired)

**New files:** `apps/web/src/app/(authenticated)/providers/`

- Registry listing page showing all 33 providers
- Search/filter by data type (equity, etf, forex, crypto, futures, economic)
- Each provider card shows: name, description, model count, status
- Click provider → detail page with available models
- Add API key management per provider
- Use shadcn/ui `Command` (cmdk) for search, `Card` for layout, `Badge` for status

### Step 7: Real-Time WebSocket Streaming

**Files:** `apps/api/src/routes/ws.ts` (enhance), new frontend hook

- WebSocket endpoint: `ws://localhost:4000/api/ws/market`
- Subscribe/unsubscribe to tickers
- Push quote updates every N seconds
- Frontend hook: `useMarketStream(symbols[])` → reactive state
- Auto-reconnect with exponential backoff

### Step 8: Rate Limiting

**File:** `apps/api/src/middleware/rate-limiter.ts`

- Token bucket per IP for public endpoints
- 60 req/min for anonymous, 300 req/min for authenticated
- 429 response with `Retry-After` header

### Step 9: Per-User Provider Defaults

**Files:** Settings page, `helpers.ts`

- Add `defaultProvider` to user settings
- Read in `createProviderQueryHandler` instead of hardcoded DEFAULT_PROVIDER
- Add provider preference per data type (e.g., "equity/quote" → "fmp")

### Step 10: Hono RPC Client

**New file:** `packages/shared/src/client/`

- Auto-generate typed client from Hono route types
- Share between frontend and any consumers
- Type-safe: `client.equity.quote.$get({ query: { symbol: "AAPL" } })`

## Data Models

### Provider Registry Response

```typescript
interface ProviderInfo {
  name: string;
  description: string;
  category: string;           // "equity" | "etf" | "forex" | "crypto" | "economic" | "news"
  modelCount: number;
  models: {
    name: string;             // "equity/quote"
    description: string;
    queryParams: Record<string, unknown>;  // Zod JSON schema
    dataSchema: Record<string, unknown>;   // Zod JSON schema
    requireCredentials: boolean;
  }[];
  credentials: string[];      // ["api_key"] or []
}
```

### Credential Storage

```prisma
model ProviderCredential {
  id        String   @id @default(cuid())
  userId    String
  provider  String
  keyName   String    // "api_key", "secret", "token"
  value     String    // encrypted
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, provider, keyName])
}
```

## Verification Criteria

- [ ] All 33 providers registered and discoverable via `/api/providers`
- [ ] Dashboard shows live market data (S&P 500, NASDAQ, DOW from yfinance)
- [ ] Markets page shows real data from provider queries
- [ ] Credential flow works: store key → query with that provider → get data
- [ ] `?provider=fmp` works on domain routes with stored credentials
- [ ] Response envelope is OBBject for all provider queries
- [ ] `X-Request-Id` header matches `metadata.requestId` in response
- [ ] Provider registry UI shows all 33 providers with search/filter
- [ ] Rate limiting returns 429 after threshold
- [ ] No `/api/v1/` paths anywhere in the codebase