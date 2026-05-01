import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@openmoney/database';
import { UpdateProfileSchema } from '@openmoney/shared/schemas';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/user')

  // Get current user profile
  .get('/profile', async (c) => {
    const userId = c.get('userId');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, emailVerified: true, image: true, createdAt: true, updatedAt: true } });
    return c.json({ success: true, data: user });
  })

  // Update profile
  .put('/profile', zValidator('json', UpdateProfileSchema), async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    const user = await prisma.user.update({ where: { id: userId }, data, select: { id: true, name: true, email: true, image: true } });
    return c.json({ success: true, data: user });
  })

  // Get user preferences
  .get('/preferences', async (c) => {
    return c.json({ success: true, data: { theme: 'dark', riskFreeRate: 5, benchmarkTicker: 'SPY', emailNotifications: true } });
  });

export { router as user };
