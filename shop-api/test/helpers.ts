import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { afterAll } from 'vitest';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { openDatabase } from '../src/db/client.js';
import { seedDatabase } from '../src/db/seed.js';

export const PASSWORD = 'Shop!2026';
export const USERS = {
  admin: 'anna@shop.test',
  stockManager: 'tomek@shop.test',
  buyer: 'jan@shop.test',
  buyer2: 'ola@shop.test',
} as const;

/**
 * Integration-test setup: a real app on a real (temporary) SQLite file, seeded.
 * A temp file, not `:memory:`: libsql opens a new connection for transactions,
 * and every `:memory:` connection is a separate, empty database.
 */
export async function createTestApp() {
  const file = join(tmpdir(), `shop-api-test-${uuidv7()}.db`);
  const env = { ...loadEnv({ NODE_ENV: 'test' }), dbUrl: `file:${file}` };
  const { db, client } = await openDatabase(env.dbUrl);
  await seedDatabase(db);
  const { app, events } = createApp({ db, env });

  afterAll(() => {
    client.close();
    for (const suffix of ['', '-wal', '-shm']) {
      try {
        rmSync(file + suffix, { force: true });
      } catch {
        // Windows may still hold the file for a moment. It lives in the OS temp dir: harmless.
      }
    }
  });

  /** A supertest agent keeps cookies, like a browser. */
  async function loginAs(email: string) {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email, password: PASSWORD }).expect(200);
    return agent;
  }

  return { app, db, events, loginAs, reset: () => seedDatabase(db) };
}

export async function productBySku(app: Parameters<typeof request>[0], sku: string) {
  const res = await request(app).get('/api/products').query({ q: sku }).expect(200);
  const product = res.body.items.find((p: { sku: string }) => p.sku === sku);
  if (!product) throw new Error(`No product ${sku}`);
  return product as { id: string; sku: string; stock: number; priceCents: number };
}
