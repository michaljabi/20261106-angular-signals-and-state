import { Component, computed, input } from '@angular/core';

/** Presentational: inputs only, no services. Stock level with a colour. */
@Component({
  selector: 'app-stock-badge',
  template: `<span [class]="css()">{{ label() }}</span>`,
})
export class StockBadge {
  readonly stock = input.required<number>();
  readonly lowAt = input(5);

  protected readonly css = computed(() => {
    const stock = this.stock();
    if (stock === 0) return 'badge text-bg-danger';
    if (stock < this.lowAt()) return 'badge text-bg-warning';
    return 'badge text-bg-success';
  });

  protected readonly label = computed(() =>
    this.stock() === 0 ? 'Out of stock' : `${this.stock()} in stock`,
  );
}
