import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '../util';

const COLOURS: Record<OrderStatus, string> = {
  new: 'primary',
  shipped: 'success',
  cancelled: 'secondary',
};

/** Presentational: only an input, no store. */
@Component({
  selector: 'app-order-status-badge',
  template: `<span [class]="css()">{{ status() }}</span>`,
})
export class OrderStatusBadge {
  readonly status = input.required<OrderStatus>();

  protected readonly css = computed(() => `badge text-bg-${COLOURS[this.status()]}`);
}
