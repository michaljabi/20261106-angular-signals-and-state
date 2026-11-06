/**
 * Backoffice models = shop-api DTOs as the staff screens see them.
 * They live in `util` (the lowest layer) so both `ui` (badges) and `data-access` can use them.
 * Money is always integer cents.
 */

// ── Catalog ──────────────────────────────────────────────────────────────────

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
  priceCents: number;
  stock: number;
  category: Category;
}

/** `POST /api/products` body. */
export interface NewProduct {
  sku: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  categoryId: string;
}

/** `GET /api/products/sku-available` response. */
export interface SkuAvailability {
  sku: string;
  available: boolean;
}

export interface ProductsQuery {
  q: string;
  page: number;
  pageSize: number;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export const ORDER_STATUSES = ['new', 'shipped', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface UserRef {
  id: string;
  name: string;
}

export interface OrderLine {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  /** Price snapshot from the moment of ordering. */
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  buyer: UserRef;
  lines: OrderLine[];
  totalCents: number;
}

export interface OrdersQuery {
  /** `null` = all statuses. */
  status: OrderStatus | null;
  page: number;
  pageSize: number;
}
