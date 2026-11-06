import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { products } from './catalog.js';
import { createdAt, id, publicId, timestamp, updatedAt } from './columns.js';

/**
 * The shop owner's buying guides. Read-only over the API: they come from the seed
 * and change with a release, so the frontend can prerender them (SSG).
 */
export const articles = sqliteTable('articles', {
  id: id(),
  uuid: publicId(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  excerpt: text().notNull(),
  /** Markdown. */
  body: text().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  publishedAt: timestamp().notNull(),
});

/** Many-to-many: products mentioned in an article. */
export const articleProducts = sqliteTable(
  'article_products',
  {
    articleId: integer()
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    productId: integer()
      .notNull()
      .references(() => products.id),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.productId] }),
    index('article_products_product_idx').on(t.productId),
  ],
);
