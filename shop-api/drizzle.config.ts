import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  // relations.ts too, so Drizzle Studio can follow relations (generate ignores them)
  schema: ['./src/db/schema/index.ts', './src/db/relations.ts'],
  out: './drizzle',
  casing: 'snake_case',
  // Used by `pnpm db:studio` (Drizzle Studio). Same default as src/config/env.ts.
  dbCredentials: { url: process.env.DB_URL ?? 'file:./data/shop.db' },
});
