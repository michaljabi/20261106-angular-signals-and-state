import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product';

// Naive: everything providedIn 'root' – global by default, no scope decision.
@Injectable({ providedIn: 'root' })
export class Catalog {
  readonly #products = signal<Product[]>([
    { id: 1, name: 'Klawiatura', price: 129.99 },
    { id: 2, name: 'Mysz', price: 49.5 },
    { id: 3, name: 'Monitor', price: 899 },
  ]);
  readonly products = this.#products.asReadonly();
}
