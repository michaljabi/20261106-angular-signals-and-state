import { integer, text } from 'drizzle-orm/sqlite-core';
import { v7 as uuidv7 } from 'uuid';

/** Internal key. Used for joins and foreign keys. Never leaves the API. */
export const id = () => integer().primaryKey({ autoIncrement: true });

/** Public key (UUID v7, time-ordered). The only id the API exposes. */
export const publicId = () =>
  text()
    .notNull()
    .unique()
    .$defaultFn(() => uuidv7());

/** Unix epoch in ms, mapped to `Date` by Drizzle. */
export const timestamp = () => integer({ mode: 'timestamp_ms' });

export const createdAt = () =>
  timestamp()
    .notNull()
    .$defaultFn(() => new Date());

export const updatedAt = () =>
  timestamp()
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());
