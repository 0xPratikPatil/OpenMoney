import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@openmoney/database';
import { CreatePredictionSchema, UpdatePredictionSchema } from '@openmoney/shared/schemas';
import type { AuthVariables } from '../../middleware/auth';

type Bindings = { Variables: AuthVariables };

const router = new Hono<Bindings>()
  .basePath('/journal')

  // List journal entries
  .get('/', async (c) => {
    const userId = c.get('userId');
    const status = c.req.query('status');
    const where: Record<string, unknown> = { userId };
    if (status === 'resolved') where.actualOutcome = { not: null };
    if (status === 'unresolved') where.actualOutcome = null;

    const entries = await prisma.prediction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return c.json({ success: true, data: entries });
  })

  // Create prediction
  .post('/', zValidator('json', CreatePredictionSchema), async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    const prediction = await prisma.prediction.create({
      data: { ...data, userId, ticker: data.ticker?.toUpperCase() },
    });
    await prisma.usageRecord.create({ data: { userId, action: 'prediction_created', quantity: 1 } });
    return c.json({ success: true, data: prediction }, 201);
  })

  // Get single prediction
  .get('/:id', async (c) => {
    const entry = await prisma.prediction.findFirst({
      where: { id: c.req.param('id'), userId: c.get('userId') },
    });
    if (!entry) return c.json({ success: false, error: 'Not found' }, 404);
    return c.json({ success: true, data: entry });
  })

  // Update prediction (add outcome)
  .put('/:id', zValidator('json', UpdatePredictionSchema), async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const data = c.req.valid('json');
    const existing = await prisma.prediction.findFirst({ where: { id, userId } });
    if (!existing) return c.json({ success: false, error: 'Not found' }, 404);
    const prediction = await prisma.prediction.update({
      where: { id },
      data: { ...data, outcomeDate: data.outcomeDate ? new Date(data.outcomeDate) : new Date() },
    });
    return c.json({ success: true, data: prediction });
  })

  // Prediction accuracy stats
  .get('/stats', async (c) => {
    const userId = c.get('userId');
    const resolved = await prisma.prediction.findMany({
      where: { userId, actualOutcome: { not: null } },
    });

    const total = resolved.length;
    const correct = resolved.filter((p: { actualOutcome: string | null }) => p.actualOutcome === 'correct').length;
    const incorrect = resolved.filter((p: { actualOutcome: string | null }) => p.actualOutcome === 'incorrect').length;
    const accuracy = total > 0 ? correct / total : 0;

    // Calibration by confidence bracket
    const brackets: Record<string, { total: number; correct: number }> = {};
    for (const p of resolved) {
      const bracket = `${Math.floor(p.confidence / 10) * 10}-${Math.floor(p.confidence / 10) * 10 + 9}`;
      if (!brackets[bracket]) brackets[bracket] = { total: 0, correct: 0 };
      brackets[bracket].total++;
      if (p.actualOutcome === 'correct') brackets[bracket].correct++;
    }

    // Brier score (simplified: (accuracy - confidence/100)^2 averaged)
    const brierScore = resolved.length > 0
      ? resolved.reduce((sum: number, p: { confidence: number; actualOutcome: string | null }) => {
          const expected = p.confidence / 100;
          const outcome = p.actualOutcome === 'correct' ? 1 : 0;
          return sum + (outcome - expected) ** 2;
        }, 0) / resolved.length
      : 0;

    return c.json({
      success: true,
      data: {
        total,
        resolved: total,
        correct,
        incorrect,
        unresolved: await prisma.prediction.count({ where: { userId, actualOutcome: null } }),
        accuracy,
        brierScore,
        calibration: Object.entries(brackets).map(([bracket, data]) => ({
          bracket,
          count: data.total,
          accuracy: data.total > 0 ? data.correct / data.total : 0,
        })),
      },
    });
  });

export { router as journal };
