import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Cart } from './state';
import { CartSummary } from './ui';

// Smart: connects Cart state with presentational CartSummary.
@Component({
  selector: 'app-a4-cart-widget',
  imports: [CartSummary],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-a4-cart-summary [count]="cart.count()" [total]="cart.total()" (clear)="clearCart()" />
  `,
})
export class CartWidget {
  protected readonly cart = inject(Cart);

  protected clearCart(): void {
    this.cart.clear();
  }
}
