import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { ServerEvents } from '../../../shared/data-access';
import { PageHeader, Pager, PricePipe, ProblemAlert } from '../../../shared/ui';
import { ProblemDetails, toProblem } from '../../../shared/util';
import { OrdersApi } from '../data-access';
import { FilterPills, FilterOption, OrderStatusBadge } from '../ui';
// import {  } from '../ui/filter-pills';
import { Order, OrderStatus } from '../util';

const PAGE_SIZE = 10;

type StatusFilter = OrderStatus | 'all';

const STATUS_OPTIONS: readonly FilterOption<StatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

@Component({
  selector: 'app-orders-page',
  imports: [DatePipe, FilterPills, OrderStatusBadge, PageHeader, Pager, PricePipe, ProblemAlert],
  templateUrl: './orders-page.html',
})
export class OrdersPage {
  private readonly api = inject(OrdersApi);

  protected readonly statusOptions = STATUS_OPTIONS;

  // ── UI state ──
  protected readonly status = signal<StatusFilter>('new');
  /** Back to page 1 when the filter changes. */
  protected readonly page = linkedSignal({ source: this.status, computation: () => 1 });
  protected readonly busyId = signal<string | null>(null);
  protected readonly actionProblem = signal<ProblemDetails | null>(null);

  // ── Server state ──
  protected readonly orders = this.api.list(() => {
    const status = this.status();
    return { status: status === 'all' ? null : status, page: this.page(), pageSize: PAGE_SIZE };
  });
  protected readonly loadProblem = computed(() => {
    const error = this.orders.error();
    return error ? toProblem(error) : null;
  });

  constructor() {
    // A buyer ordered / someone shipped or cancelled → this page may be out of date.
    // `reload()` keeps showing the old rows while it fetches (status 'reloading').
    const events = inject(ServerEvents);
    merge(events.on('order.created'), events.on('order.status-changed'))
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.orders.reload());
  }

  protected ship(order: Order): Promise<void> {
    return this.run(order, () => this.api.ship(order.id));
  }

  protected cancel(order: Order): Promise<void> {
    if (!confirm(`Cancel ${order.number}? The stock goes back to the shelf.`)) {
      return Promise.resolve();
    }
    return this.run(order, () => this.api.cancel(order.id));
  }

  /**
   * Pessimistic update: wait for the API (it owns the state machine and the stock),
   * then re-fetch, because the order may no longer match the current filter.
   */
  private async run(order: Order, action: () => Promise<Order>): Promise<void> {
    this.busyId.set(order.id);
    this.actionProblem.set(null);
    try {
      await action();
      this.orders.reload();
    } catch (error) {
      this.actionProblem.set(toProblem(error));
    } finally {
      this.busyId.set(null);
    }
  }
}
