import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, id, publicId, timestamp, updatedAt } from './columns.js';

export const categories = sqliteTable('categories', {
  id: id(),
  uuid: publicId(),
  slug: text().notNull().unique(),
  name: text().notNull(),
});

export const products = sqliteTable(
  'products',
  {
    id: id(),
    uuid: publicId(),
    sku: text().notNull().unique(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    description: text().notNull().default(''),
    /** Money as integer cents (USD). Never floats. */
    priceCents: integer().notNull(),
    stock: integer().notNull().default(0),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    /** Soft delete: old order lines keep pointing at the product. */
    deletedAt: timestamp(),
  },
  (t) => [
    index('products_category_idx').on(t.categoryId),
    check('products_stock_non_negative', sql`${t.stock} >= 0`),
    check('products_price_non_negative', sql`${t.priceCents} >= 0`),
  ],
);
