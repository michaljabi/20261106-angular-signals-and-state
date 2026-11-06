import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, id, publicId, timestamp } from './columns.js';

export const ROLES = ['buyer', 'admin', 'stock-manager'] as const;
export type Role = (typeof ROLES)[number];

export const users = sqliteTable('users', {
  id: id(),
  uuid: publicId(),
  email: text().notNull().unique(),
  name: text().notNull(),
  role: text({ enum: ROLES }).notNull(),
  passwordHash: text().notNull(),
  createdAt: createdAt(),
  /** Soft delete: order history keeps pointing at the user. */
  deletedAt: timestamp(),
});

/** Server-side sessions. The cookie holds a random token; only its SHA-256 hash is stored. */
export const sessions = sqliteTable(
  'sessions',
  {
    id: id(),
    tokenHash: text().notNull().unique(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    expiresAt: timestamp().notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);
