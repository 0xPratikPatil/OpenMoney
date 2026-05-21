import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { config } from '@openmoney/config';
import { globalRegistry } from '@openmoney/provider-core';
import { auth } from './lib/auth';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limiter';
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
import { wsHandler, startLiveQuotePoller } from './routes/ws';

// Initialize provider system at startup (registers all providers into globalRegistry)
initializeProviders();

// Start live quote poller for WebSocket subscribers
startLiveQuotePoller();

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('/api/*', cors({
  origin: config.api.corsOrigins,
  credentials: true,
}));

// Rate limiting (anonymous: 60/min, authenticated: 300/min)
app.use('/api/*', rateLimiter);

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

// Unified provider query + discovery API
app.route('/api', queryRouter);

// ---------------------------------------------------------------------------
// Protected routes (require authentication)
// ---------------------------------------------------------------------------
app.use('/api/portfolios/*', authMiddleware);
app.use('/api/positions/*', authMiddleware);
app.use('/api/watchlists/*', authMiddleware);
app.use('/api/journal/*', authMiddleware);
app.use('/api/user/*', authMiddleware);
app.use('/api/signals/*', authMiddleware);

app.route('/api', portfolios);
app.route('/api', positions);
app.route('/api', watchlists);
app.route('/api', journal);
app.route('/api', marketData);
app.route('/api', search);
app.route('/api', user);
app.route('/api', signals);

export default {
  port: config.api.port,
  fetch: app.fetch,
  websocket: wsHandler,
};
