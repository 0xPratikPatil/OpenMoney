import { Hono } from 'hono';
import { config } from '@openmoney/config';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok', service: 'notification', version: '0.0.1' }));

console.log(`[notification] Starting on port ${config.notification?.port || 4003}`);
console.log(`[notification] Mode: ${config.app.nodeEnv}`);

export default {
  port: config.notification?.port || 4003,
  fetch: app.fetch,
};
