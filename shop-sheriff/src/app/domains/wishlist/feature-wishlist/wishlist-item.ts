import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PricePipe } from '../../../shared/ui';

import { ProblemDetails, toProblem } from '../../../shared/util';
import { WishlistStore, wishlistProductResource } from '../data-access';

@Component({
  imports: [RouterLink, PricePipe],
  selector: 'app-wishlist-item',
  styles: ``,
  // standalone: true,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<li class="list-group-item d-flex justify-content-between">
    @if (product.isLoading()) {
      <!-- ładowanie -->
      <span class="text-body-secondary">Loading…</span>
    } @else if (product.error()) {
      <span class="text-danger"
        >Could not load wishlist product :( {{ problemDetail().status }}
      </span>
      <button type="button" class="btn btn-sm btn-outline-secondary" (click)="product.reload()">
        Try again
      </button>
    } @else if (product.hasValue()) {
      <a [routerLink]="['/products', slug()]">{{ product.value().name }}</a>
      {{ product.value().priceCents | price }}
      <button type="button" class="btn btn-sm btn-outline-danger" (click)="wishlistStore.toggleOnList(slug())">Remove</button>
    }
  </li>`,
})
export class WishlistItem {
  slug = input.required<string>();

  product = wishlistProductResource(this.slug);

  wishlistStore = inject(WishlistStore);

  // 2. poprawna obsługa błędu
  problemDetail = computed<ProblemDetails>(() => toProblem(this.product.error()));
}
