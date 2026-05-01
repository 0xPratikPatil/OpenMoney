import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@openmoney/database';
import { CreatePortfolioSchema, UpdatePortfolioSchema, CreatePositionSchema } from '@openmoney/shared/schemas';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/portfolios')

  // List all portfolios
  .get('/', async (c) => {
    const userId = c.get('userId');
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { _count: { select: { positions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return c.json({ success: true, data: portfolios });
  })

  // Get single portfolio with positions
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
      include: {
        positions: {
          where: { isOpen: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!portfolio) return c.json({ success: false, error: 'Not found' }, 404);

    const totalCostBasis = portfolio.positions.reduce((s, p) => s + Number(p.costBasis), 0);
    const totalMarketValue = portfolio.positions.reduce((s, p) => s + Number(p.marketValue ?? 0), 0);
    const totalReturn = totalMarketValue - totalCostBasis;

    return c.json({
      success: true,
      data: {
        ...portfolio,
        summary: {
          totalValue: totalMarketValue,
          totalCostBasis,
          totalReturn,
          totalReturnPercent: totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0,
          positionCount: portfolio.positions.length,
        },
      },
    });
  })

  // Create portfolio
  .post('/', zValidator('json', CreatePortfolioSchema), async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    if (data.isDefault) {
      await prisma.portfolio.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    const portfolio = await prisma.portfolio.create({ data: { ...data, userId } });
    return c.json({ success: true, data: portfolio }, 201);
  })

  // Update portfolio
  .put('/:id', zValidator('json', UpdatePortfolioSchema), async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const data = c.req.valid('json');
    const existing = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
    if (data.isDefault) {
      await prisma.portfolio.updateMany({ where: { userId, isDefault: true, id: { not: id } }, data: { isDefault: false } });
    }
    const portfolio = await prisma.portfolio.update({ where: { id }, data });
    return c.json({ success: true, data: portfolio });
  })

  // Delete portfolio
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const existing = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
    await prisma.portfolio.delete({ where: { id } });
    return c.json({ success: true, data: null });
  })

  // Portfolio history (placeholder)
  .get('/:id/history', async (c) => {
    return c.json({ success: true, data: [] });
  })

  // Risk metrics (placeholder — Phase 6)
  .get('/:id/risk', async (c) => {
    return c.json({
      success: true,
      data: {
        portfolioVaR95: null, portfolioVaR99: null, sharpeRatio: null,
        sortinoRatio: null, maxDrawdown: null, beta: null,
        positionRiskContributions: [], asOfDate: new Date().toISOString(),
      },
    });
  })

  // Action recommendations (signals)
  .get('/:id/actions', async (c) => {
    const signals = await prisma.signal.findMany({
      where: { portfolioId: c.req.param('id') },
      orderBy: { createdAt: 'desc' }, take: 20,
    });
    return c.json({ success: true, data: signals });
  })

  // List positions in portfolio
  .get('/:id/positions', async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const portfolio = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!portfolio) return c.json({ success: false, error: 'Not found' }, 404);
    const positions = await prisma.position.findMany({
      where: { portfolioId: id },
      orderBy: { createdAt: 'desc' },
    });
    return c.json({ success: true, data: positions });
  })

  // Add position to portfolio
  .post('/:id/positions', zValidator('json', CreatePositionSchema.omit({ portfolioId: true })), async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const portfolio = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!portfolio) return c.json({ success: false, error: 'Portfolio not found' }, 404);
    const data = c.req.valid('json');
    const costBasis = data.quantity * data.avgEntryPrice;
    const position = await prisma.position.create({
      data: { portfolioId: id, ...data, costBasis, openedAt: data.openedAt ? new Date(data.openedAt) : new Date() },
    });
    await prisma.usageRecord.create({ data: { userId, action: 'position_added', quantity: 1 } });
    return c.json({ success: true, data: position }, 201);
  });

export { router as portfolios };
