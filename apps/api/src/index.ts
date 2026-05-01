import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { config } from '@openmoney/config';
import { auth } from './lib/auth';
import { authMiddleware } from './middleware/auth';
import { portfolios } from './routes/v1/portfolios';
import { positions } from './routes/v1/positions';
import { watchlists } from './routes/v1/watchlists';
import { journal } from './routes/v1/journal';
import { marketData } from './routes/v1/market-data';
import { search } from './routes/v1/search';
import { user } from './routes/v1/user';
import { signals } from './routes/v1/signals';
import { wsHandler } from './routes/ws';

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('/api/*', cors({
  origin: config.api.corsOrigins,
  credentials: true,
}));

app.get('/health', (c) => {
  return c.json({ status: 'ok', version: '0.1.0', timestamp: new Date().toISOString() });
});

// Auth routes (better-auth)
app.all('/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

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
