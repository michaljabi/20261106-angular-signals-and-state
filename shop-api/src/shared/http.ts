import { z } from 'zod';

/** Route params: every `:id` in the API is a public UUID. */
export const IdParam = z.object({ id: z.uuid() });
export const SlugParam = z.object({ slug: z.string().min(1).max(200) });
