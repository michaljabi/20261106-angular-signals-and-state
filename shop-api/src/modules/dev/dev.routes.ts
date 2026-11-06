import { Router } from 'express';
import { seedDatabase } from '../../db/seed.js';
import type { AppContext } from '../../shared/context.js';

/** Dev-only endpoints. Mounted only when DEV_TOOLS is on (never in production). */
export function createDevRouter(ctx: AppContext) {
  const router = Router();

  /** Restore the seed data: every exercise can start from the same state. */
  router.post('/reset', async (_req, res) => {
    await seedDatabase(ctx.db);
    res.status(204).end();
  });

  return router;
}
