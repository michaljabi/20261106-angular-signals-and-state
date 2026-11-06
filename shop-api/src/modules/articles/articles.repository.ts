import { count, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { articleProducts, articles, products } from '../../db/schema/index.js';
import { offsetOf, type PageQuery } from '../../shared/pagination.js';

export interface ArticlesQuery extends PageQuery {
  /** Product slug: only articles that mention this product. */
  product?: string;
}

export class ArticlesRepository {
  constructor(private readonly db: Db) {}

  async list(query: ArticlesQuery) {
    const where = query.product
      ? // Articles that link to the product with this slug.
        inArray(
          articles.id,
          this.db
            .select({ id: articleProducts.articleId })
            .from(articleProducts)
            .innerJoin(products, eq(articleProducts.productId, products.id))
            .where(eq(products.slug, query.product)),
        )
      : undefined;
    const [items, [totalRow]] = await Promise.all([
      this.db.query.articles.findMany({
        where,
        orderBy: [desc(articles.publishedAt), desc(articles.id)],
        limit: query.pageSize,
        offset: offsetOf(query),
      }),
      this.db.select({ total: count() }).from(articles).where(where),
    ]);
    return { items, total: totalRow?.total ?? 0 };
  }

  findBySlug(slug: string) {
    return this.db.query.articles.findFirst({
      where: eq(articles.slug, slug),
      with: { productLinks: { with: { product: true } } },
    });
  }
}
