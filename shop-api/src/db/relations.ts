import { relations } from 'drizzle-orm';
import {
  articleProducts,
  articles,
  categories,
  orderLines,
  orders,
  products,
  sessions,
  users,
} from './schema/index.js';

// Relations power the relational query API: db.query.x.findMany({ with: { ... } }).
// They do not change the database (foreign keys live in the schema).

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  orders: many(orders),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  orderLines: many(orderLines),
  articleLinks: many(articleProducts),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { fields: [orders.userId], references: [users.id] }),
  lines: many(orderLines),
}));

export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  order: one(orders, { fields: [orderLines.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderLines.productId], references: [products.id] }),
}));

export const articlesRelations = relations(articles, ({ many }) => ({
  productLinks: many(articleProducts),
}));

export const articleProductsRelations = relations(articleProducts, ({ one }) => ({
  article: one(articles, { fields: [articleProducts.articleId], references: [articles.id] }),
  product: one(products, { fields: [articleProducts.productId], references: [products.id] }),
}));
