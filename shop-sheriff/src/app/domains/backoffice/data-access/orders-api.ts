import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Page } from '../../../shared/util';
import { Order, OrdersQuery } from '../util';

/** All orders of all buyers (staff view). */
@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);

  /** Call in an injection context. Re-fetches when `query()` changes. */
  list(query: () => OrdersQuery): HttpResourceRef<Page<Order> | undefined> {
    return httpResource<Page<Order>>(() => {
      const { status, page, pageSize } = query();
      return { url: '/api/orders', params: { page, pageSize, ...(status ? { status } : {}) } };
    });
  }

  /** Action endpoints (not `PATCH {status}`): the API owns the state machine. */
  ship(id: string): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`/api/orders/${id}/ship`, null));
  }

  /** Releases the reserved stock. */
  cancel(id: string): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`/api/orders/${id}/cancel`, null));
  }
}
