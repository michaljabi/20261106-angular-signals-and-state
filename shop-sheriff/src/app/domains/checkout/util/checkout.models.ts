/*
 * Front-end models of checkout. In `util` so presentational `ui` components can use them.
 * Checkout must not import catalog (Sheriff rule), so it describes the product it needs itself.
 */

/** What the cart needs from a product. Catalog's `Product` fits this shape structurally. */
export interface CartProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  priceCents: number;
  stock: number;
}

/** Client state: one line of the cart. `stock` = last known available stock. */
export interface CartLine {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  stock: number;
}

export type OrderStatus = 'new' | 'shipped' | 'cancelled';

export interface OrderLine {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  /** Price snapshot at the time of ordering (cents), not today's price. */
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  /** ISO date-time. */
  createdAt: string;
  lines: OrderLine[];
  totalCents: number;
}

/** 409 from `POST /api/orders`: one product is short. */
export interface StockConflict {
  productId: string;
  sku: string;
  requested: number;
  available: number;
}
