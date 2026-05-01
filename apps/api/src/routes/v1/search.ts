import { Hono } from 'hono';
import { prisma } from '@openmoney/database';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/search')

  // Ticker search (uses yfinance in ingestion service, returns cached results)
  .get('/tickers', async (c) => {
    const q = c.req.query('q');
    if (!q || q.length < 1) {
      return c.json({ success: true, data: [] });
    }

    // Check for exact ticker match in watchlists or positions
    const userId = c.get('userId');
    const query = q.toUpperCase();

    const [positions, watchlistItems] = await Promise.all([
      prisma.position.findMany({ where: { portfolio: { userId }, ticker: { contains: query } }, select: { ticker: true, name: true }, distinct: ['ticker'], take: 5 }),
      prisma.watchlistItem.findMany({ where: { watchlist: { userId }, ticker: { contains: query } }, select: { ticker: true }, distinct: ['ticker'], take: 5 }),
    ]);

    const results = new Map<string, { ticker: string; name: string | null }>();
    for (const p of positions) results.set(p.ticker, { ticker: p.ticker, name: p.name });
    for (const w of watchlistItems) if (!results.has(w.ticker)) results.set(w.ticker, { ticker: w.ticker, name: null });

    return c.json({ success: true, data: Array.from(results.values()) });
  });

export { router as search };
