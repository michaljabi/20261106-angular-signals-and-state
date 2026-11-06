import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Session } from '../../../shared/data-access';
import { PricePipe } from '../../../shared/ui';
import { CartStore } from '../../checkout/data-access';
import { Product } from '../util';
import { AddToCartButton } from './add-to-cart-button';
import { StockBadge } from './stock-badge';

/**
 * Product tile with a working "Add to cart" button.
 * The card talks to the cart itself, so any page can drop it in with just [product].
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, PricePipe, StockBadge, AddToCartButton],
  host: { class: 'card h-100' },
  template: `
    <div class="card-body">
      <!--
        zobacz możliwe tutaj użycie: https://angular.dev/api/core/@let#description
      -->
      <div class="small text-body-secondary mb-1">{{ product().category.name }}</div>
      <h2 class="h6 card-title">
        <a
          class="link-body-emphasis text-decoration-none"
          [routerLink]="['/products', product().slug]"
        >
          {{ product().name }}
        </a>
      </h2>
      <p class="small text-body-secondary mb-2">{{ product().description }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <span class="fw-semibold">{{ product().priceCents | price }}</span>
        <app-stock-badge [stock]="product().stock" />
      </div>
    </div>
    <div class="card-footer bg-transparent border-0 pb-3">
      <app-add-to-cart-button
        [stock]="product().stock"
        [inCart]="inCart()"
        [canBuy]="canBuy()"
        (add)="add()"
      />
    </div>
  `,
})
export class ProductCard {
  // https://angular.dev/guide/di#injecting-dependencies-with-inject
  private readonly cart = inject(CartStore);
  private readonly session = inject(Session);

  // https://angular.dev/guide/components/inputs
  readonly product = input.required<Product>();

  // Zadanie: dostęp do session i cart tutaj?
  // trzeba to naprawić, zrefaktoryzuj
  /** How many of this product are already in the cart. */
  protected readonly inCart = computed(() => this.cart.quantityOf(this.product().id));
  protected readonly canBuy = computed(() => this.session.hasRole('buyer'));

  protected add(): void {
    this.cart.add(this.product());
  }
}
