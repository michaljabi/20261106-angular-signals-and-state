import { z } from 'zod';
import { PageQuery } from '../../shared/pagination.js';

export const PRODUCT_SORTS = ['name', '-name', 'price', '-price', 'newest'] as const;

export const ProductsQuery = PageQuery.extend({
  /** Category slug, e.g. `monitors`. */
  category: z.string().min(1).max(60).optional(),
  /** Free-text search in name and SKU. */
  q: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(PRODUCT_SORTS).default('name'),
});
export type ProductsQuery = z.infer<typeof ProductsQuery>;

export const Sku = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}-\d{4}$/, 'SKU must look like KB-0001.');

export const SkuQuery = z.object({ sku: Sku });

export const CreateProductBody = z.object({
  sku: Sku,
  name: z.string().trim().min(2).max(120),
  /** Optional: generated from the name when missing. */
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, digits and dashes.')
    .max(120)
    .optional(),
  description: z.string().trim().max(2000).default(''),
  priceCents: z.number().int().min(0).max(10_000_000),
  stock: z.number().int().min(0).max(100_000).default(0),
  categoryId: z.uuid(),
});
export type CreateProductBody = z.infer<typeof CreateProductBody>;

export const UpdateProductBody = CreateProductBody.pick({
  name: true,
  description: true,
  priceCents: true,
  categoryId: true,
})
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Send at least one field to change.');
export type UpdateProductBody = z.infer<typeof UpdateProductBody>;

export const StockBody = z.object({
  /** +5 = delivery arrived, -2 = damaged items. Stock never goes below 0. */
  delta: z
    .number()
    .int()
    .min(-100_000)
    .max(100_000)
    .refine((d) => d !== 0, 'Delta must not be 0.'),
});
