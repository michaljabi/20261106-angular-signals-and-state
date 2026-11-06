import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '../util';

const COLOUR: Record<OrderStatus, string> = {
  new: 'text-bg-primary',
  shipped: 'text-bg-success',
  cancelled: 'text-bg-secondary',
};

/** Presentational: only an input, no store. */
@Component({
  selector: 'app-order-status-badge',
  template: `<span class="badge" [class]="css()">{{ status() }}</span>`,
})
export class OrderStatusBadge {
  readonly status = input.required<OrderStatus>();
  protected readonly css = computed(() => COLOUR[this.status()]);
}
