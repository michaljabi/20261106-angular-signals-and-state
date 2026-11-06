/** Product as `GET /api/products` returns it (only the fields we use). */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  category: { slug: string; name: string };
}

/** Paged list from shop-api. */
export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}
