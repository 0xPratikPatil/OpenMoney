import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { config } from '@openmoney/config';
import { globalRegistry } from '@openmoney/provider-core';
import { auth } from './lib/auth';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { initializeProviders } from './lib/provider-init';
import { ok } from './lib/response';

// Domain routers (OpenBB extension pattern)
import { equityRouter } from './routes/equity';
import { etfRouter } from './routes/etf';
import { forexRouter } from './routes/forex';
import { cryptoRouter } from './routes/crypto';
import { futuresRouter } from './routes/futures';
import { indexRouter } from './routes/index-router';
import { economicRouter } from './routes/economic';
import { searchRouter } from './routes/search';

// Unified query router
import { queryRouter } from './routes/query';

// Protected v1 routes
import { portfolios } from './routes/v1/portfolios';
import { positions } from './routes/v1/positions';
import { watchlists } from './routes/v1/watchlists';
import { journal } from './routes/v1/journal';
import { marketData } from './routes/v1/market-data';
import { search } from './routes/v1/search';
import { user } from './routes/v1/user';
import { signals } from './routes/v1/signals';

// WebSocket
import { wsHandler } from './routes/ws';

// Initialize provider system at startup (registers all providers into globalRegistry)
initializeProviders();

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('/api/*', cors({
  origin: config.api.corsOrigins,
  credentials: true,
}));

// Global error handler
app.onError(errorHandler);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (c) => {
  return c.json(ok({
    status: 'ok',
    version: '0.0.1',
    providers: globalRegistry.availableProviders,
    models: [...globalRegistry.getAll().values()].flatMap(
      (p) => Array.from(p.fetcherMap.keys()),
    ),
  }));
});

// ---------------------------------------------------------------------------
// Auth routes (better-auth)
// ---------------------------------------------------------------------------
app.all('/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// ---------------------------------------------------------------------------
// Provider market data routes (no auth required — bring your own key)
// Organized by domain following OpenBB extension pattern
// ---------------------------------------------------------------------------
app.route('/api/equity', equityRouter);
app.route('/api/etf', etfRouter);
app.route('/api/forex', forexRouter);
app.route('/api/crypto', cryptoRouter);
app.route('/api/futures', futuresRouter);
app.route('/api/index', indexRouter);
app.route('/api/economic', economicRouter);
app.route('/api/search', searchRouter);

// Unified provider query API
app.route('/', queryRouter);

// ---------------------------------------------------------------------------
// Protected API v1 routes (require authentication)
// ---------------------------------------------------------------------------
app.use('/api/v1/*', authMiddleware);

app.route('/api/v1', portfolios);
app.route('/api/v1', positions);
app.route('/api/v1', watchlists);
app.route('/api/v1', journal);
app.route('/api/v1', marketData);
app.route('/api/v1', search);
app.route('/api/v1', user);
app.route('/api/v1', signals);

export default {
  port: config.api.port,
  fetch: app.fetch,
  websocket: wsHandler,
};
