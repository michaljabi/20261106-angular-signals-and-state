import { z } from 'zod';

export const LoginBody = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});
export type LoginBody = z.infer<typeof LoginBody>;
