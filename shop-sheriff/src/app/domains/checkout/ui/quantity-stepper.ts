import { Component, input, output } from '@angular/core';

/**
 * Presentational − n + control. It does not own the quantity: it asks for a new one via
 * `quantityChange` and the parent (the store) decides. One source of truth.
 */
@Component({
  selector: 'app-quantity-stepper',
  template: `
    <div class="input-group input-group-sm flex-nowrap" style="width: 7.5rem">
      <button
        type="button"
        class="btn btn-outline-secondary"
        [attr.aria-label]="'One less ' + label()"
        (click)="quantityChange.emit(quantity() - 1)"
      >
        −
      </button>
      <span class="input-group-text flex-grow-1 justify-content-center" aria-live="polite">
        {{ quantity() }}
      </span>
      <button
        type="button"
        class="btn btn-outline-secondary"
        [attr.aria-label]="'One more ' + label()"
        [disabled]="quantity() >= max()"
        (click)="quantityChange.emit(quantity() + 1)"
      >
        +
      </button>
    </div>
  `,
})
export class QuantityStepper {
  readonly quantity = input.required<number>();
  readonly max = input.required<number>();
  /** For screen readers ("One more Glidex mouse"). */
  readonly label = input('');
  readonly quantityChange = output<number>();
}
