import { httpResource } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { PricePipe } from '../../shared';
import { CartStore } from '../cart';
import { ProductPage } from './product';

@Component({
  selector: 'app-catalog-page',
  imports: [PricePipe],
  template: `
    <h1 class="h3 mb-4">Catalog</h1>

    @if (products.error()) {
      <div class="alert alert-danger">Cannot load products. Is shop-api running on port 3000?</div>
    } @else if (products.hasValue()) {
      <div class="row g-3">
        @for (product of products.value().items; track product.id) {
          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="small text-body-secondary">{{ product.category.name }}</div>
                <h2 class="h6 card-title">{{ product.name }}</h2>
                <p class="fw-semibold mb-0">{{ product.priceCents | price }}</p>
              </div>
              <div class="card-footer bg-transparent border-0 pb-3">
                <button
                  type="button"
                  class="btn btn-outline-primary w-100"
                  [disabled]="product.stock === 0"
                  (click)="cart.add(product)"
                >
                  {{ product.stock === 0 ? 'Out of stock' : 'Add to cart' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <p class="text-body-secondary">Loading…</p>
    }
  `,
})
export class CatalogPage {
  protected readonly cart = inject(CartStore);

  // Server state as a signal: value / error / isLoading.
  protected readonly products = httpResource<ProductPage>(() => '/api/products?pageSize=12');
}
