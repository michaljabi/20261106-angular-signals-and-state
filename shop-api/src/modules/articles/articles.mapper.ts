import type { articleProducts, articles, products } from '../../db/schema/index.js';

type ArticleRow = typeof articles.$inferSelect;
type WithProducts = ArticleRow & {
  productLinks: (typeof articleProducts.$inferSelect & { product: typeof products.$inferSelect })[];
};

export interface ArticleSummaryDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
}

export interface ProductRefDto {
  id: string;
  sku: string;
  slug: string;
  name: string;
  priceCents: number;
  stock: number;
}

export interface ArticleDto extends ArticleSummaryDto {
  body: string;
  products: ProductRefDto[];
}

export const toArticleSummaryDto = (a: ArticleRow): ArticleSummaryDto => ({
  id: a.uuid,
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  publishedAt: a.publishedAt.toISOString(),
  updatedAt: a.updatedAt.toISOString(),
});

export const toArticleDto = (a: WithProducts): ArticleDto => ({
  ...toArticleSummaryDto(a),
  body: a.body,
  products: a.productLinks
    .map((l) => l.product)
    .filter((p) => p.deletedAt === null) // removed products disappear from articles
    .map((p) => ({
      id: p.uuid,
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
      stock: p.stock,
    })),
});
