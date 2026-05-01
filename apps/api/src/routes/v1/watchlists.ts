import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@openmoney/database';
import { CreateWatchlistSchema, AddWatchlistItemSchema } from '@openmoney/shared/schemas';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/watchlists')

  // List all watchlists
  .get('/', async (c) => {
    const userId = c.get('userId');
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return c.json({ success: true, data: watchlists });
  })

  // Create watchlist
  .post('/', zValidator('json', CreateWatchlistSchema), async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    const watchlist = await prisma.watchlist.create({ data: { ...data, userId } });
    return c.json({ success: true, data: watchlist }, 201);
  })

  // Get single watchlist
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const watchlist = await prisma.watchlist.findFirst({
      where: { id: c.req.param('id'), userId },
      include: { items: { orderBy: { addedAt: 'desc' } } },
    });
    if (!watchlist) return c.json({ success: false, error: 'Not found' }, 404);
    return c.json({ success: true, data: watchlist });
  })

  // Add item to watchlist
  .post('/:id/items', zValidator('json', AddWatchlistItemSchema), async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const watchlist = await prisma.watchlist.findFirst({ where: { id, userId } });
    if (!watchlist) return c.json({ success: false, error: 'Watchlist not found' }, 404);
    const data = c.req.valid('json');
    const item = await prisma.watchlistItem.create({ data: { watchlistId: id, ...data } });
    return c.json({ success: true, data: item }, 201);
  })

  // Remove item from watchlist
  .delete('/:id/items/:itemId', async (c) => {
    const userId = c.get('userId');
    const watchlist = await prisma.watchlist.findFirst({ where: { id: c.req.param('id'), userId } });
    if (!watchlist) return c.json({ success: false, error: 'Watchlist not found' }, 404);
    await prisma.watchlistItem.delete({ where: { id: c.req.param('itemId') } });
    return c.json({ success: true, data: null });
  })

  // Delete watchlist
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const watchlist = await prisma.watchlist.findFirst({ where: { id: c.req.param('id'), userId } });
    if (!watchlist) return c.json({ success: false, error: 'Not found' }, 404);
    await prisma.watchlist.delete({ where: { id: c.req.param('id') } });
    return c.json({ success: true, data: null });
  });

export { router as watchlists };
