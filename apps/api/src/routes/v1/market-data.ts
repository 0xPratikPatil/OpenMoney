import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@openmoney/database';
import { MarketDataQuerySchema } from '@openmoney/shared/schemas';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/market-data')

  // Get current market data for ticker (reads from in-memory cache or DB)
  .get('/:ticker', async (c) => {
    const ticker = c.req.param('ticker').toUpperCase();
    const latest = await prisma.$queryRaw<Array<{ time: Date; close: number; volume: number }>>`
      SELECT time, close, volume FROM market_data
      WHERE ticker = ${ticker}
      ORDER BY time DESC LIMIT 1
    `;

    if (!latest.length) {
      return c.json({ success: true, data: null, meta: { note: 'No data available. Data ingestion must be running.' } });
    }

    const row = latest[0]!;

    return c.json({
      success: true,
      data: {
        ticker,
        price: row.close,
        volume: row.volume,
        timestamp: row.time.toISOString(),
      },
    });
  })

  // Get historical market data
  .get('/:ticker/history', zValidator('query', MarketDataQuerySchema), async (c) => {
    const ticker = c.req.param('ticker').toUpperCase();
    const query = c.req.valid('query');

    const rows = await prisma.$queryRaw<Array<{
      bucket: Date; open: number; high: number; low: number; close: number; volume: number | null;
    }>>`
      SELECT
        time_bucket('1 day', time) as bucket,
        FIRST(open, time) as open,
        MAX(high) as high,
        MIN(low) as low,
        LAST(close, time) as close,
        SUM(volume) as volume
      FROM market_data
      WHERE ticker = ${ticker}
        AND time >= NOW() - INTERVAL '90 days'
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT ${query.limit}
    `;

    return c.json({
      success: true,
      data: rows.map((r: { bucket: { toISOString: () => string }; open: unknown; high: unknown; low: unknown; close: unknown; volume: unknown }) => ({
        time: r.bucket.toISOString(),
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
        volume: r.volume,
      })),
    });
  })

  // Subscribe to real-time updates (stub — WebSocket handles this)
  .post('/:ticker/subscribe', async (c) => {
    return c.json({ success: true, data: { ticker: c.req.param('ticker').toUpperCase(), subscribed: true } });
  });

export { router as marketData };
