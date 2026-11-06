import { Injectable, signal } from '@angular/core';
import { Product } from './product.model';

// ≤ v19 style: type suffix in file AND class name – product-catalog.service.ts / ProductCatalogService.
@Injectable({ providedIn: 'root' })
export class ProductCatalogService {
  readonly #products = signal<Product[]>([
    { id: 1, name: 'Klawiatura', price: 129.99 },
    { id: 2, name: 'Mysz', price: 49.5 },
    { id: 3, name: 'Monitor', price: 899 },
  ]);
  readonly products = this.#products.asReadonly();
}
