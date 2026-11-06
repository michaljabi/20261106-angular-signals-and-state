import { Router } from 'express';
import type { AppContext } from '../../shared/context.js';
import { requireRole } from '../../shared/middleware/auth.js';
import type { CatalogRepository } from '../catalog/catalog.repository.js';
import { OrdersController } from './orders.controller.js';
import { OrdersRepository } from './orders.repository.js';
import { OrdersService } from './orders.service.js';

export function createOrdersRouter(ctx: AppContext, catalog: CatalogRepository) {
  const service = new OrdersService(ctx.db, new OrdersRepository(ctx.db), catalog, ctx.events);
  const controller = new OrdersController(service);
  const staff = requireRole('stock-manager', 'admin');

  const router = Router();
  router.get('/', requireRole('buyer', 'stock-manager', 'admin'), controller.list);
  router.get('/:id', requireRole('buyer', 'stock-manager', 'admin'), controller.get);
  router.post('/', requireRole('buyer'), controller.place);
  router.post('/:id/ship', staff, controller.ship);
  router.post('/:id/cancel', requireRole('buyer', 'stock-manager', 'admin'), controller.cancel);
  return router;
}
