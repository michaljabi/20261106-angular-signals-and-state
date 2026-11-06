import { inject, Injectable, signal } from '@angular/core';
import { ProductApi } from './product-api'; // same lib → relative import

// data-access = A4's data/ + state/ in one lib. Provided in products.routes.ts.
@Injectable()
export class ProductCatalog {
  readonly #products = signal(inject(ProductApi).getAll());
  readonly products = this.#products.asReadonly();
}
