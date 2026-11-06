import { Router } from 'express';
import type { AppContext } from '../../shared/context.js';
import { requireRole } from '../../shared/middleware/auth.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogRepository } from './catalog.repository.js';
import { CatalogService } from './catalog.service.js';

export function createCatalogModule(ctx: AppContext) {
  const repo = new CatalogRepository(ctx.db);
  const controller = new CatalogController(new CatalogService(repo, ctx.events));
  const staff = requireRole('stock-manager', 'admin');

  const categories = Router();
  categories.get('/', controller.categories);

  const products = Router();
  products.get('/', controller.list);
  // Before '/:slug', otherwise "sku-available" would be read as a slug.
  products.get('/sku-available', staff, controller.skuAvailable);
  products.get('/:slug', controller.bySlug);
  products.post('/', staff, controller.create);
  products.patch('/:id', staff, controller.update);
  products.patch('/:id/stock', staff, controller.adjustStock);
  products.delete('/:id', requireRole('admin'), controller.remove);

  // The repository is shared with modules that change stock or link products inside their own transactions.
  return { categories, products, repo };
}
