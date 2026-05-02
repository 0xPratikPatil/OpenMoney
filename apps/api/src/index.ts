import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { config } from '@openmoney/config';
import { globalRegistry } from '@openmoney/provider-core';
import { auth } from './lib/auth';
import { authMiddleware } from './middleware/auth';
import { initializeProviders } from './lib/provider-init';
import { ok } from './lib/response';
import { portfolios } from './routes/v1/portfolios';
import { positions } from './routes/v1/positions';
import { watchlists } from './routes/v1/watchlists';
import { journal } from './routes/v1/journal';
import { marketData } from './routes/v1/market-data';
import { search } from './routes/v1/search';
import { user } from './routes/v1/user';
import { signals } from './routes/v1/signals';
import { wsHandler } from './routes/ws';
import { marketData as providerMarketData, providerRoutes } from './routes/market-data';
import { queryRouter } from './routes/query';

// Initialize provider system at startup (registers all providers into globalRegistry)
initializeProviders();

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('/api/*', cors({
  origin: config.api.corsOrigins,
  credentials: true,
}));

// Health check — includes provider system info
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

// Auth routes (better-auth)
app.all('/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// Provider market data routes (bring-your-own-key, no auth required)
app.route('/', providerMarketData);
app.route('/', providerRoutes);

// Unified query API (bring-your-own-key, no auth required)
app.route('/', queryRouter);

// Protected API v1 routes
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
