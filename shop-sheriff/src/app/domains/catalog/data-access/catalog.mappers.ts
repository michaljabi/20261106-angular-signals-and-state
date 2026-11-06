import { Page } from '../../../shared/util';
import { ArticleRef, Category, Product, StockChange } from '../util';

/** Shapes the API sends (shop-api catalog.mapper.ts). Private to data-access. */
interface CategoryDto {
  id: string;
  slug: string;
  name: string;
}

interface ProductDto {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  category: CategoryDto;
}

interface ArticleSummaryDto {
  slug: string;
  title: string;
  excerpt: string;
}

/*
 * `httpResource` hands `parse` an `unknown` (raw JSON). We trust the API contract and cast;
 * in production, validate here (e.g. a zod schema) so bad data fails at the boundary.
 */

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id,
  slug: dto.slug,
  name: dto.name,
});

export const toProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  sku: dto.sku,
  slug: dto.slug,
  name: dto.name,
  description: dto.description,
  priceCents: dto.priceCents,
  stock: dto.stock,
  category: toCategory(dto.category),
});

export const parseCategories = (raw: unknown): Category[] => (raw as CategoryDto[]).map(toCategory);

export const parseProduct = (raw: unknown): Product => toProduct(raw as ProductDto);

export const parseProductPage = (raw: unknown): Page<Product> => {
  const page = raw as Page<ProductDto>;
  return { ...page, items: page.items.map(toProduct) };
};

export const parseArticleRefs = (raw: unknown): ArticleRef[] =>
  (raw as Page<ArticleSummaryDto>).items.map(({ slug, title, excerpt }) => ({
    slug,
    title,
    excerpt,
  }));

/** Immutable update: a new object only for the product that changed. */
export const withStock = (product: Product, change: StockChange): Product =>
  product.id === change.productId ? { ...product, stock: change.stock } : product;
