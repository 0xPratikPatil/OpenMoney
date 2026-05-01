import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const router = new Hono()
  .basePath('/api/v1');

// Example: typed GET
router.get('/example', (c) => {
  return c.json({ message: 'Hello from v1' });
});

// Example: typed POST with Zod validation
router.post('/example',
  zValidator('json', z.object({
    name: z.string(),
  })),
  (c) => {
    const data = c.req.valid('json');
    return c.json({ received: data }, 201);
  },
);

export { router as exampleRouter };
