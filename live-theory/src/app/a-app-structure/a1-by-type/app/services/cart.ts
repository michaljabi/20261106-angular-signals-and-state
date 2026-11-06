import { computed, Injectable, signal } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class Cart {
  readonly #items = signal<CartItem[]>([]);
  readonly items = this.#items.asReadonly();

  readonly count = computed(() => this.#items().reduce((sum, i) => sum + i.quantity, 0));
  readonly total = computed(() =>
    this.#items().reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );

  add(product: Product): void {
    this.#items.update((items) =>
      items.some((i) => i.product.id === product.id)
        ? items.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...items, { product, quantity: 1 }],
    );
  }

  clear(): void {
    this.#items.set([]);
  }
}
