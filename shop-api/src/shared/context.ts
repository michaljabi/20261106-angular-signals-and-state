import type { Env } from '../config/env.js';
import type { Db } from '../db/client.js';
import type { Role } from '../db/schema/index.js';
import type { EventBus } from './events.js';

/** Everything a module needs to wire itself up. Passed explicitly (no global singletons). */
export interface AppContext {
  db: Db;
  env: Env;
  events: EventBus;
}

/** The logged-in user, resolved from the session cookie. */
export interface AuthUser {
  id: number;
  uuid: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
