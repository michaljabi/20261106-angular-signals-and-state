import { z } from 'zod';
import { ROLES } from '../../db/schema/index.js';
import { PageQuery } from '../../shared/pagination.js';

export const UsersQuery = PageQuery.extend({
  role: z.enum(ROLES).optional(),
});
export type UsersQuery = z.infer<typeof UsersQuery>;

export const ChangeRoleBody = z.object({
  role: z.enum(ROLES),
});
