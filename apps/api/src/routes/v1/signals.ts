import { Hono } from 'hono';
import { prisma } from '@openmoney/database';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/signals')

  // Get recent signals for user
  .get('/', async (c) => {
    const userId = c.get('userId');
    const portfolios = await prisma.portfolio.findMany({ where: { userId }, select: { id: true } });
    const portfolioIds = portfolios.map((p) => p.id);

    const signals = await prisma.signal.findMany({
      where: { portfolioId: { in: portfolioIds } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return c.json({ success: true, data: signals });
  });

export { router as signals };
