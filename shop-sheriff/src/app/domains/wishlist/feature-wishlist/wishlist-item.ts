import { Component, computed, inject, input } from '@angular/core';
import { outputFromObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { ServerEvents } from '../../../shared/data-access';
import { PricePipe } from '../../../shared/ui';

import { ProblemDetails, toProblem } from '../../../shared/util';
import { WishlistStore, wishlistProductResource } from '../data-access';

@Component({
  imports: [RouterLink, PricePipe],
  selector: 'app-wishlist-item',
  styles: ``,
  // standalone: true,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<li class="list-group-item d-flex justify-content-between align-items-center  gap-3">
    @if (product.isLoading()) {
      <!-- ładowanie -->
      <span class="text-body-secondary">Loading…</span>
    } @else if (product.error()) {
      <span class="text-danger">
        Could not load wishlist product :( {{ problemDetail().status }}
      </span>
      <button type="button" class="btn btn-sm btn-outline-secondary" (click)="product.reload()">
        Try again
      </button>
    } @else if (product.hasValue()) {
      <a [routerLink]="['/products', slug()]">{{ product.value().name }}</a>
      @if (product.value().stock === 0) {
        @if (backInStock()) {
          <span class="ms-auto badge text-bg-success">Back in stock</span>
        } @else {
          <span class="ms-auto badge text-bg-secondary">Sold out</span>
        }
      } @else {
        <span class="ms-auto"> {{ product.value().priceCents | price }}</span>
      }
      <button
        type="button"
        class="btn btn-sm btn-outline-danger"
        (click)="wishlistStore.toggleOnList(slug())"
      >
        Remove
      </button>
    }
  </li>`,
})
export class WishlistItem {
  slug = input.required<string>();

  product = wishlistProductResource(this.slug);

  wishlistStore = inject(WishlistStore);

  // 2. poprawna obsługa błędu
  problemDetail = computed<ProblemDetails>(() => toProblem(this.product.error()));

  // 8. RxJS: stream of SSE events (all products) → only this product → "is in stock?"
  private readonly inStock$ = inject(ServerEvents)
    .on('stock.changed')
    .pipe(
      // Event has `productId`, not slug → compare with `id` of loaded product.
      // Only products that were sold out when loaded can come "back".
      filter(
        ({ productId }) =>
          this.product.hasValue() &&
          this.product.value().id === productId &&
          this.product.value().stock === 0,
      ),
      map(({ stock }) => stock > 0),
      distinctUntilChanged(), // 5 → 4 in stock = no new message; 0 → 3 = message again
    );

  // Interop: toSignal = Observable → Signal (subscribes now, unsubscribes on destroy).
  backInStock = toSignal(this.inStock$, { initialValue: false });

  // Interop: outputFromObservable = Observable → output (parent listens, no manual subscribe).
  //          Emits product name when it comes back in stock.
  cameBackInStock = outputFromObservable(
    this.inStock$.pipe(
      filter((inStock) => inStock),
      map(() => this.product.value()?.name ?? this.slug()),
    ),
  );
}
