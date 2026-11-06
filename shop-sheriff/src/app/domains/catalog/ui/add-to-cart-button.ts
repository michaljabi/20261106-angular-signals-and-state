import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Presentational: "Add to cart", or "Log in to buy" for visitors.
 * The parent decides who may buy (it knows the session); this component only shows it.
 */
@Component({
  selector: 'app-add-to-cart-button',
  imports: [RouterLink],
  template: `
    @if (canBuy()) {
      <button
        type="button"
        class="btn btn-outline-primary w-100"
        [disabled]="soldOut()"
        (click)="add.emit()"
      >
        @if (soldOut()) {
          {{ stock() === 0 ? 'Out of stock' : 'All in cart' }}
        } @else {
          Add to cart
        }
        @if (inCart()) {
          <span class="badge text-bg-primary ms-1">{{ inCart() }} in cart</span>
        }
      </button>
    } @else {
      <a
        class="btn btn-outline-secondary w-100"
        routerLink="/login"
        [queryParams]="{ returnUrl: returnUrl() }"
        >Log in to buy</a
      >
    }
  `,
})
export class AddToCartButton {
  readonly stock = input.required<number>();
  readonly inCart = input(0);
  readonly canBuy = input(false);
  /** Where to come back after login. */
  readonly returnUrl = input('/');
  readonly add = output();

  /** You cannot put more in the cart than is on the shelf. */
  protected readonly soldOut = computed(() => this.inCart() >= this.stock());
}
