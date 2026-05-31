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

    const totalCostBasis = portfolio.positions.reduce((s: number, p: { costBasis: unknown }) => s + Number(p.costBasis), 0);
    const totalMarketValue = portfolio.positions.reduce((s: number, p: { marketValue: unknown }) => s + Number(p.marketValue ?? 0), 0);
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
    const data = c.req.valid('json') as { isDefault?: boolean; name: string; description?: string; currency?: string };
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
    const data = c.req.valid('json') as { isDefault?: boolean; name?: string; description?: string; currency?: string };
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

  // Portfolio history — daily value tracking
  .get('/:id/history', async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const portfolio = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!portfolio) return c.json({ success: false, error: 'Not found' }, 404);

    // Get daily aggregate from market_data joined with positions
    const rows = await prisma.$queryRaw<Array<{ date: string; value: number }>>`
      SELECT DATE(m.time) as date, SUM(p.quantity * CAST(m.close AS DECIMAL)) as value
      FROM market_data m
      JOIN "Position" p ON p.ticker = m.ticker
      WHERE p."portfolioId" = ${id} AND p."isOpen" = true
      GROUP BY DATE(m.time)
      ORDER BY DATE(m.time) DESC
      LIMIT 90
    `;
    return c.json({ success: true, data: rows.reverse() });
  })

  // Risk metrics
  .get('/:id/risk', async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
      include: { positions: { where: { isOpen: true } } },
    });
    if (!portfolio) return c.json({ success: false, error: 'Not found' }, 404);
    if (portfolio.positions.length === 0) {
      return c.json({ success: true, data: { portfolioVaR95: null, portfolioVaR99: null, sharpeRatio: null, sortinoRatio: null, maxDrawdown: null, beta: null, positionRiskContributions: [], asOfDate: new Date().toISOString() } });
    }

    // Compute daily returns from market_data
    const positionReturns: Record<string, number[]> = {};
    let totalMarketValue = 0;
    for (const pos of portfolio.positions) {
      totalMarketValue += Number(pos.marketValue ?? 0);
    }

    const riskFreeRate = 0.05;
    let allReturns: number[] = [];

    for (const pos of portfolio.positions) {
      const weight = Number(pos.marketValue ?? 0) / totalMarketValue;
      // Get daily closes from market_data
      const rows = await prisma.$queryRaw<Array<{ close: number }>>`
        SELECT close FROM market_data
        WHERE ticker = ${pos.ticker}
        ORDER BY time DESC LIMIT 90
      `;
      if (rows.length < 5) continue;
      const closes = rows.map(r => Number(r.close)).reverse();
      const dailyReturns: number[] = [];
      for (let i = 1; i < closes.length; i++) {
        const prev = closes[i - 1];
        const curr = closes[i];
        if (prev === undefined || curr === undefined) continue;
        dailyReturns.push((curr - prev) / prev);
      }
      if (allReturns.length === 0) {
        allReturns = dailyReturns.map(r => r * weight);
      } else {
        for (let i = 0; i < Math.min(allReturns.length, dailyReturns.length); i++) {
          const ar = allReturns[i];
          const dr = dailyReturns[i];
          if (ar !== undefined && dr !== undefined) {
            allReturns[i] = ar + dr * weight;
          }
        }
      }
      positionReturns[pos.ticker] = dailyReturns;
    }

    if (allReturns.length < 5) {
      return c.json({ success: true, data: { portfolioVaR95: null, portfolioVaR99: null, sharpeRatio: null, sortinoRatio: null, maxDrawdown: null, beta: null, positionRiskContributions: [], asOfDate: new Date().toISOString() } });
    }

    // Risk calculations
    const sorted = [...allReturns].sort((a, b) => a - b);
    const var95Idx = Math.floor(0.05 * sorted.length);
    const var99Idx = Math.floor(0.01 * sorted.length);
    const portfolioVaR95 = sorted[Math.max(0, var95Idx)] ?? 0;
    const portfolioVaR99 = sorted[Math.max(0, var99Idx)] ?? 0;

    const meanReturn = allReturns.reduce((s, r) => s + r, 0) / allReturns.length;
    const annualReturn = meanReturn * 252;
    const variance = allReturns.reduce((s, r) => s + (r - meanReturn) ** 2, 0) / (allReturns.length - 1);
    const annualVol = Math.sqrt(variance) * Math.sqrt(252);
    const sharpeRatio = annualVol > 0 ? (annualReturn - riskFreeRate) / annualVol : 0;

    const downsideVariance = allReturns.filter(r => r < 0).reduce((s, r) => s + r ** 2, 0) / (allReturns.filter(r => r < 0).length || 1);
    const downsideVol = Math.sqrt(downsideVariance) * Math.sqrt(252);
    const sortinoRatio = downsideVol > 0 ? (annualReturn - riskFreeRate) / downsideVol : 0;

    // Max drawdown
    let peak = allReturns[0] ?? 0;
    let maxDD = 0;
    for (const r of allReturns) {
      if (r > peak) peak = r;
      const dd = r - peak;
      if (dd < maxDD) maxDD = dd;
    }

    return c.json({
      success: true,
      data: {
        portfolioVaR95: Math.round(portfolioVaR95 * 10000) / 10000,
        portfolioVaR99: Math.round(portfolioVaR99 * 10000) / 10000,
        sharpeRatio: Math.round(sharpeRatio * 100) / 100,
        sortinoRatio: Math.round(sortinoRatio * 100) / 100,
        maxDrawdown: Math.round(maxDD * 10000) / 10000,
        beta: null,
        positionRiskContributions: Object.entries(positionReturns).map(([ticker]) => ({ ticker })),
        asOfDate: new Date().toISOString(),
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
  .post('/:id/positions', zValidator('json', CreatePositionSchema), async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const portfolio = await prisma.portfolio.findFirst({ where: { id, userId } });
    if (!portfolio) return c.json({ success: false, error: 'Portfolio not found' }, 404);
    const data = c.req.valid('json') as { ticker: string; name?: string; assetClass?: string; quantity: number; avgEntryPrice: number; openedAt?: string; notes?: string };
    const costBasis = data.quantity * data.avgEntryPrice;
    const position = await prisma.position.create({
      data: { portfolioId: id, ...data, costBasis, openedAt: data.openedAt ? new Date(data.openedAt) : new Date() },
    });
    await prisma.usageRecord.create({ data: { userId, action: 'position_added', quantity: 1 } });
    return c.json({ success: true, data: position }, 201);
  });

export { router as portfolios };
