import cookieParser from 'cookie-parser';
import express from 'express';
import type { Env } from './config/env.js';
import type { Db } from './db/client.js';
import { createArticlesRouter } from './modules/articles/articles.routes.js';
import { createAuthModule } from './modules/auth/auth.routes.js';
import { createCatalogModule } from './modules/catalog/catalog.routes.js';
import { createDevRouter } from './modules/dev/dev.routes.js';
import { createEventsRouter } from './modules/events/events.routes.js';
import { createOrdersRouter } from './modules/orders/orders.routes.js';
import { createUsersRouter } from './modules/users/users.routes.js';
import type { AppContext } from './shared/context.js';
import { EventBus } from './shared/events.js';
import { devFlags } from './shared/middleware/dev-flags.js';
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler.js';
import { requestLogger } from './shared/middleware/request-logger.js';

/**
 * Builds the Express app. A factory (not a module-level singleton) so tests
 * can create an app per test file with their own database.
 */
export function createApp(deps: { db: Db; env: Env; events?: EventBus }) {
  const ctx: AppContext = { db: deps.db, env: deps.env, events: deps.events ?? new EventBus() };
  const app = express();

  app.disable('x-powered-by');
  app.set('etag', false); // no automatic ETags: caching is not a topic of this API
  if (ctx.env.nodeEnv === 'development') app.use(requestLogger);
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  const auth = createAuthModule(ctx);
  const catalog = createCatalogModule(ctx);

  const api = express.Router();
  api.use(auth.session);
  if (ctx.env.devTools) api.use(devFlags);

  api.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  api.use('/auth', auth.router);
  api.use('/users', createUsersRouter(ctx));
  api.use('/categories', catalog.categories);
  api.use('/products', catalog.products);
  api.use('/orders', createOrdersRouter(ctx, catalog.repo));
  api.use('/articles', createArticlesRouter(ctx));
  api.use('/events', createEventsRouter(ctx));
  if (ctx.env.devTools) api.use('/dev', createDevRouter(ctx));

  app.use('/api', api);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, events: ctx.events };
}
