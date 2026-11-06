/**
 * Front-end models of the catalog. Components use these, never the API DTOs:
 * if the API changes, only the mappers (data-access/catalog.mappers.ts) change.
 * Lives in `util` (not data-access) so presentational `ui` components may use the types too.
 */
export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  /** Integer USD cents. Display with the `price` pipe. */
  priceCents: number;
  stock: number;
  category: Category;
}

export const PRODUCT_SORTS = ['name', '-name', 'price', '-price', 'newest'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const SORT_LABELS: Record<ProductSort, string> = {
  name: 'Name A–Z',
  '-name': 'Name Z–A',
  price: 'Price: low → high',
  '-price': 'Price: high → low',
  newest: 'Newest',
};

export const isProductSort = (value: string): value is ProductSort =>
  (PRODUCT_SORTS as readonly string[]).includes(value);

/** Query of `GET /api/products`. Empty values are left out of the URL. */
export interface ProductsQuery {
  q: string;
  category: string | null;
  sort: ProductSort;
  page: number;
  pageSize: number;
}

/** An article that mentions a product (link to `/articles/:slug`). */
export interface ArticleRef {
  slug: string;
  title: string;
  excerpt: string;
}

/** Payload of the `stock.changed` server event. */
export interface StockChange {
  productId: string;
  stock: number;
}
