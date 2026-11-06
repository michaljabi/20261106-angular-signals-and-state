import { mkdirSync } from 'node:fs';
import { loadEnv } from '../config/env.js';
import { openDatabase } from './client.js';

// `pnpm db:migrate`: applies pending migrations from ./drizzle (openDatabase does it).
const env = loadEnv();
mkdirSync('data', { recursive: true });
const { client } = await openDatabase(env.dbUrl);
console.log(`Migrations applied to ${env.dbUrl}`);
client.close();
