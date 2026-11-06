import { Router, type RequestHandler } from 'express';
import type { AppContext } from '../../shared/context.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { AuthController, SESSION_COOKIE } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';

export function createAuthModule(ctx: AppContext) {
  const repo = new AuthRepository(ctx.db);
  const service = new AuthService(repo, ctx.env.sessionTtlMs);
  const controller = new AuthController(service, { secure: ctx.env.cookieSecure });

  const router = Router();
  router.post('/login', controller.login);
  router.post('/logout', controller.logout);
  router.get('/me', requireAuth, controller.me);

  /** Global middleware: resolves `req.user` from the session cookie (if any). */
  const session: RequestHandler = async (req, _res, next) => {
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token === 'string' && token.length > 0) {
      req.user = await service.userForToken(token);
    }
    next();
  };

  return { router, session };
}
