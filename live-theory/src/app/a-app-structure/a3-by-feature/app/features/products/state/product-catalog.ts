import { inject, Injectable, signal } from '@angular/core';
import { ProductApi } from '../data/product-api';

// No providedIn: provided in products.routes.ts → lives only while the feature is active.
@Injectable()
export class ProductCatalog {
  readonly #products = signal(inject(ProductApi).getAll());
  readonly products = this.#products.asReadonly();
}
