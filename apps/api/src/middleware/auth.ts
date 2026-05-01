import type { Context, Next } from 'hono';
import { auth } from '../lib/auth';

export interface AuthVariables {
  userId: string;
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    c.set('userId', session.user.id);
    await next();
  } catch {
    return c.json({ success: false, error: 'Authentication failed' }, 401);
  }
}
