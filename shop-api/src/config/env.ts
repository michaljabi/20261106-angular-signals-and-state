import { z } from 'zod';

// Load .env if present (Node >= 21.7). Real environment variables win.
try {
  process.loadEnvFile();
} catch {
  // no .env file: defaults below apply
}

const booleanString = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_URL: z.string().default('file:./data/shop.db'),
  DEV_TOOLS: booleanString.optional(),
  SESSION_TTL_HOURS: z.coerce
    .number()
    .positive()
    .default(24 * 7),
  COOKIE_SECURE: booleanString.default(false),
});

export type Env = {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  dbUrl: string;
  /** `?_delay`, `?_fail` and `POST /api/dev/reset`. Never on in production. */
  devTools: boolean;
  sessionTtlMs: number;
  cookieSecure: boolean;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const e = EnvSchema.parse(source);
  return {
    nodeEnv: e.NODE_ENV,
    port: e.PORT,
    dbUrl: e.DB_URL,
    devTools: e.NODE_ENV !== 'production' && (e.DEV_TOOLS ?? true),
    sessionTtlMs: e.SESSION_TTL_HOURS * 60 * 60 * 1000,
    cookieSecure: e.COOKIE_SECURE,
  };
}
