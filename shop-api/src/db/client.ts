import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { fileURLToPath } from 'node:url';
import * as relations from './relations.js';
import * as tables from './schema/index.js';

/**
 * The ONLY file that knows which SQLite driver is used (libsql).
 * To switch drivers later (e.g. node:sqlite once Drizzle 1.0 is stable), change this file only.
 */

export const schema = { ...tables, ...relations };

export function createDb(url: string) {
  const client: Client = createClient({ url });
  const db = drizzle(client, { schema, casing: 'snake_case' });
  return { db, client };
}

export type Db = ReturnType<typeof createDb>['db'];
/** A transaction handle has the same query API as `db`. */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
/** Repositories accept either the db or a running transaction. */
export type DbOrTx = Db | Tx;

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

/** Opens the database, enables foreign keys and applies pending migrations. */
export async function openDatabase(url: string) {
  const { db, client } = createDb(url);
  await client.execute('PRAGMA foreign_keys = ON');
  await client.execute('PRAGMA journal_mode = WAL');
  await migrate(db, { migrationsFolder });
  return { db, client };
}
