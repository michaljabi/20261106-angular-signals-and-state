import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { ServerEvents } from '../../../shared/data-access';
import { PageHeader, Pager, PricePipe, ProblemAlert } from '../../../shared/ui';
import { ProblemDetails, toProblem } from '../../../shared/util';
import { OrdersApi, myOrdersResource } from '../data-access';
import { OrderStatusBadge } from '../ui';
import { Order } from '../util';

const PAGE_SIZE = 10;

/** Smart component: the buyer's orders (server state) + UI state (page, expanded row). */
@Component({
  selector: 'app-my-orders-page',
  imports: [DatePipe, PageHeader, Pager, PricePipe, ProblemAlert, OrderStatusBadge],
  templateUrl: './my-orders-page.html',
})
export class MyOrdersPage {
  private readonly api = inject(OrdersApi);

  /** `?placed=ORD-0042` after checkout (router input binding). */
  readonly placed = input<string>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly page = signal(1);
  /** Server state: refetches when `page` changes. */
  protected readonly orders = myOrdersResource(this.page, PAGE_SIZE);
  protected readonly loadProblem = computed(() => {
    const error = this.orders.error();
    return error ? toProblem(error) : null;
  });

  // UI state: plain local signals.
  protected readonly expandedId = signal<string | null>(null);
  protected readonly cancellingId = signal<string | null>(null);
  protected readonly problem = signal<ProblemDetails | null>(null);

  constructor() {
    // Staff shipped/cancelled an order, or I placed one in another tab → refetch the page.
    const events = inject(ServerEvents);
    merge(events.on('order.status-changed'), events.on('order.created'))
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.orders.reload());
  }

  protected toggle(orderId: string): void {
    this.expandedId.update((id) => (id === orderId ? null : orderId));
  }

  protected async cancel(order: Order): Promise<void> {
    this.cancellingId.set(order.id);
    this.problem.set(null);
    try {
      const updated = await this.api.cancel(order.id);
      // Put the server's answer straight into the resource: no extra GET needed.
      this.orders.update(
        (page) =>
          page && { ...page, items: page.items.map((o) => (o.id === updated.id ? updated : o)) },
      );
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.cancellingId.set(null);
    }
  }
}
