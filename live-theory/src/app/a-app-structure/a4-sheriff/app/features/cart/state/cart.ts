import { computed, Injectable, signal } from '@angular/core';
import { CartItem, CartProduct } from '../data';

// providedIn 'root' on purpose: shared by several features (products, cart widget, orders…).
@Injectable({ providedIn: 'root' })
export class Cart {
  readonly #items = signal<CartItem[]>([]);
  readonly items = this.#items.asReadonly();

  readonly count = computed(() => this.#items().reduce((sum, i) => sum + i.quantity, 0));
  readonly total = computed(() => this.#items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  add(product: CartProduct): void {
    this.#items.update((items) =>
      items.some((i) => i.id === product.id)
        ? items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...items, { ...product, quantity: 1 }],
    );
  }

  clear(): void {
    this.#items.set([]);
  }
}
