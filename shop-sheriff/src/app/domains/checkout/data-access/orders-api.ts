import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Page } from '../../../shared/util';
import { CartLine, Order, OrderStatus } from '../util';

/** Shape the API sends (shop-api orders.mapper.ts). Private to data-access. */
interface OrderDto {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  buyer: { id: string; name: string };
  lines: {
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
  totalCents: number;
}

/** The buyer is always "me" on these pages, so the FE model drops it. */
const toOrder = ({ id, number, status, createdAt, lines, totalCents }: OrderDto): Order => ({
  id,
  number,
  status,
  createdAt,
  lines: lines.map((l) => ({ ...l })),
  totalCents,
});

/** Read: `GET /api/orders?page&pageSize` (buyers get only their own). Server state → httpResource. */
export function myOrdersResource(page: () => number, pageSize = 10) {
  return httpResource(() => ({ url: '/api/orders', params: { page: page(), pageSize } }), {
    // raw JSON is `unknown`: we trust the contract here (validate with zod in production)
    parse: (raw: unknown): Page<Order> => {
      const p = raw as Page<OrderDto>;
      return { ...p, items: p.items.map(toOrder) };
    },
  });
}

/**
 * Writes (commands) go through HttpClient and return a Promise:
 * the caller awaits the result, there is no `.subscribe()` in components.
 */
@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);

  /** `POST /api/orders`. All or nothing: 409 when one product is short (see toStockConflict). */
  async place(lines: readonly CartLine[]): Promise<Order> {
    const body = { lines: lines.map(({ productId, quantity }) => ({ productId, quantity })) };
    return toOrder(await firstValueFrom(this.http.post<OrderDto>('/api/orders', body)));
  }

  /** `POST /api/orders/:id/cancel`. Only `new` orders (else 409). Stock goes back. */
  async cancel(orderId: string): Promise<Order> {
    const url = `/api/orders/${encodeURIComponent(orderId)}/cancel`;
    return toOrder(await firstValueFrom(this.http.post<OrderDto>(url, null)));
  }
}
