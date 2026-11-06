import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from '../src/config/env.js';
import { openDatabase } from '../src/db/client.js';
import { seedDatabase } from '../src/db/seed.js';

// `pnpm db:reset`: delete the database file → migrate → seed. Stop `pnpm dev` first.
// (While the API runs, use `POST /api/dev/reset` instead.)
const env = loadEnv();
if (env.dbUrl.startsWith('file:') && !env.dbUrl.includes(':memory:')) {
  const file = resolve(env.dbUrl.slice('file:'.length));
  for (const suffix of ['', '-wal', '-shm']) rmSync(file + suffix, { force: true });
}
mkdirSync('data', { recursive: true });
const { db, client } = await openDatabase(env.dbUrl);
await seedDatabase(db);
console.log(`Reset ${env.dbUrl}: fresh schema + seed data`);
client.close();
