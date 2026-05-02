import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@openmoney/database';
import { UpdatePositionSchema } from '@openmoney/shared/schemas';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/positions')

  // List all positions (optionally filter by portfolioId)
  .get('/', async (c) => {
    const userId = c.get('userId');
    const portfolios = await prisma.portfolio.findMany({ where: { userId }, select: { id: true } });
    const portfolioIds = portfolios.map((p: { id: string }) => p.id);
    const isOpen = c.req.query('isOpen') !== 'false';
    const positions = await prisma.position.findMany({
      where: { portfolioId: { in: portfolioIds }, isOpen },
      include: { portfolio: { select: { name: true, currency: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return c.json({ success: true, data: positions });
  })

  // Get single position
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const position = await prisma.position.findFirst({ where: { id: c.req.param('id'), portfolio: { userId } } });
    if (!position) return c.json({ success: false, error: 'Not found' }, 404);
    return c.json({ success: true, data: position });
  })

  // Update position
  .put('/:id', zValidator('json', UpdatePositionSchema), async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const data = c.req.valid('json');
    const existing = await prisma.position.findFirst({ where: { id, portfolio: { userId } } });
    if (!existing) return c.json({ success: false, error: 'Not found' }, 404);

    const updateData: Record<string, unknown> = {};
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.avgEntryPrice !== undefined) { updateData.avgEntryPrice = data.avgEntryPrice; updateData.costBasis = data.quantity! * data.avgEntryPrice; }
    if ('currentPrice' in data) updateData.currentPrice = (data as { currentPrice?: number }).currentPrice;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.isOpen !== undefined) updateData.isOpen = data.isOpen;
    if (data.isOpen === false) updateData.closedAt = new Date();
    if (data.closedAt !== undefined) updateData.closedAt = new Date(data.closedAt);

    const position = await prisma.position.update({ where: { id }, data: updateData });
    return c.json({ success: true, data: position });
  })

  // Delete position
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const existing = await prisma.position.findFirst({ where: { id: c.req.param('id'), portfolio: { userId } } });
    if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
    await prisma.position.delete({ where: { id: c.req.param('id') } });
    return c.json({ success: true, data: null });
  });

export { router as positions };
