import { Router, type Request, type Response } from 'express';
import type { AppContext } from '../../shared/context.js';
import { canSee } from '../../shared/events.js';

/**
 * GET /api/events: Server-Sent Events stream (text/event-stream).
 * Browser: `new EventSource('/api/events', { withCredentials: true })`.
 * Each event: `event: <type>` + `data: <json>`. Filtered by the viewer's role.
 */
export function createEventsRouter(ctx: AppContext) {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const viewer = req.user ? { uuid: req.user.uuid, role: req.user.role } : null;

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    res.write(`retry: 3000\n`);
    res.write(`event: hello\ndata: ${JSON.stringify({ viewer })}\n\n`);

    const unsubscribe = ctx.events.subscribe((event) => {
      if (canSee(event, viewer)) {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
      }
    });
    // Comment line every 25 s keeps proxies from closing an idle connection.
    const keepAlive = setInterval(() => res.write(`: ping\n\n`), 25_000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
    });
  });

  return router;
}
