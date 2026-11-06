import { Component, computed, input } from '@angular/core';

/** Presentational: stock as a coloured badge. Only inputs, no store. */
@Component({
  selector: 'app-stock-badge',
  template: `<span class="badge" [class]="css()">{{ label() }}</span>`,
})
export class StockBadge {
  readonly stock = input.required<number>();
  readonly lowAt = input(5);

  protected readonly css = computed(() => {
    if (this.stock() === 0) return 'text-bg-danger';
    if (this.stock() < this.lowAt()) return 'text-bg-warning';
    return 'text-bg-success';
  });

  protected readonly label = computed(() =>
    this.stock() === 0 ? 'Out of stock' : `${this.stock()} in stock`,
  );
}
