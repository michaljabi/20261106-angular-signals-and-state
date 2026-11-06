import { mkdirSync } from 'node:fs';
import { loadEnv } from '../src/config/env.js';
import { openDatabase } from '../src/db/client.js';
import { seedDatabase } from '../src/db/seed.js';

// `pnpm db:seed`: migrate (if needed), wipe all data, insert seed/db.json.
const env = loadEnv();
mkdirSync('data', { recursive: true });
const { db, client } = await openDatabase(env.dbUrl);
await seedDatabase(db);
console.log(`Seeded ${env.dbUrl} from seed/db.json`);
client.close();
