import { mkdirSync } from 'node:fs';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { openDatabase } from './db/client.js';
import { seedDatabase } from './db/seed.js';
import { users } from './db/schema/index.js';

const env = loadEnv();
mkdirSync('data', { recursive: true });
const { db, client } = await openDatabase(env.dbUrl);

// First start on a fresh machine: fill the empty database with seed data.
if ((await db.$count(users)) === 0) {
  console.log('Empty database: seeding…');
  await seedDatabase(db);
}

const { app } = createApp({ db, env });
const server = app.listen(env.port, () => {
  console.log(
    `shop-api on http://localhost:${env.port}/api  (dev tools: ${env.devTools ? 'on' : 'off'})`,
  );
});

function shutdown() {
  server.close(() => {
    client.close();
    process.exit(0);
  });
  // SSE connections stay open; do not wait for them forever.
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
