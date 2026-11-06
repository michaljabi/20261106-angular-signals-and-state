import type { categories, products } from '../../db/schema/index.js';

type CategoryRow = typeof categories.$inferSelect;
type ProductRow = typeof products.$inferSelect;

export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
}

export interface ProductDto {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  /** USD cents. Format in the UI (e.g. Angular `currency` pipe after /100). */
  priceCents: number;
  stock: number;
  category: CategoryDto;
}

export const toCategoryDto = (c: CategoryRow): CategoryDto => ({
  id: c.uuid,
  slug: c.slug,
  name: c.name,
});

export const toProductDto = (p: ProductRow & { category: CategoryRow }): ProductDto => ({
  id: p.uuid,
  sku: p.sku,
  slug: p.slug,
  name: p.name,
  description: p.description,
  priceCents: p.priceCents,
  stock: p.stock,
  category: toCategoryDto(p.category),
});
