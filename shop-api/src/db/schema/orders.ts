import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { products } from './catalog.js';
import { createdAt, id, publicId, updatedAt } from './columns.js';
import { users } from './users.js';

export const ORDER_STATUSES = ['new', 'shipped', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = sqliteTable(
  'orders',
  {
    id: id(),
    uuid: publicId(),
    /** Human-readable order number, e.g. ORD-0001. */
    number: text().notNull().unique(),
    userId: integer()
      .notNull()
      .references(() => users.id),
    status: text({ enum: ORDER_STATUSES }).notNull().default('new'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('orders_user_idx').on(t.userId), index('orders_status_idx').on(t.status)],
);

export const orderLines = sqliteTable(
  'order_lines',
  {
    orderId: integer()
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer()
      .notNull()
      .references(() => products.id),
    quantity: integer().notNull(),
    /** Price snapshot at the time of ordering. Does not follow later price changes. */
    unitPriceCents: integer().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.orderId, t.productId] }),
    check('order_lines_quantity_positive', sql`${t.quantity} > 0`),
  ],
);
