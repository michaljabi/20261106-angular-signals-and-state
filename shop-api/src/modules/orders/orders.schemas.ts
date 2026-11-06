import { z } from 'zod';
import { ORDER_STATUSES } from '../../db/schema/index.js';
import { PageQuery } from '../../shared/pagination.js';

export const OrdersQuery = PageQuery.extend({
  status: z.enum(ORDER_STATUSES).optional(),
});
export type OrdersQuery = z.infer<typeof OrdersQuery>;

export const PlaceOrderBody = z.object({
  lines: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1, 'An order needs at least one line.')
    .max(50)
    .refine(
      (lines) => new Set(lines.map((l) => l.productId)).size === lines.length,
      'Each product may appear only once. Increase the quantity instead.',
    ),
});
export type PlaceOrderBody = z.infer<typeof PlaceOrderBody>;
