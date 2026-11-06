import { Router } from 'express';
import type { AppContext } from '../../shared/context.js';
import { requireRole } from '../../shared/middleware/auth.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

export function createUsersRouter(ctx: AppContext) {
  const controller = new UsersController(new UsersService(new UsersRepository(ctx.db)));

  const router = Router();
  router.use(requireRole('admin'));
  router.get('/', controller.list);
  router.patch('/:id/role', controller.changeRole);
  router.delete('/:id', controller.remove);
  return router;
}
