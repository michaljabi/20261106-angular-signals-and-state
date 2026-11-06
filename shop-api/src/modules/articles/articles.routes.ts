import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../../shared/context.js';
import { NotFoundError } from '../../shared/errors.js';
import { SlugParam } from '../../shared/http.js';
import { PageQuery } from '../../shared/pagination.js';
import { toArticleDto, toArticleSummaryDto } from './articles.mapper.js';
import { ArticlesRepository } from './articles.repository.js';

const ArticlesQuery = PageQuery.extend({
  /** Product slug: only articles that mention this product. */
  product: z.string().min(1).max(120).optional(),
});

/**
 * Read-only, public. Articles = the shop owner's guides from the seed (no editing API):
 * content that changes with a release → a natural SSG (prerender) source for the frontend.
 * Small enough that routes talk to the repository directly (no service/controller layer).
 */
export function createArticlesRouter(ctx: AppContext) {
  const repo = new ArticlesRepository(ctx.db);
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const query = ArticlesQuery.parse(req.query);
    const { items, total } = await repo.list(query);
    res.json({
      items: items.map(toArticleSummaryDto),
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  });

  router.get('/:slug', async (req: Request, res: Response) => {
    const { slug } = SlugParam.parse(req.params);
    const article = await repo.findBySlug(slug);
    if (!article) throw new NotFoundError('Article');
    res.json(toArticleDto(article));
  });

  return router;
}
