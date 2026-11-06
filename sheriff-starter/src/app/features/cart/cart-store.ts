import { Injectable, computed, signal } from '@angular/core';

/** What the cart needs to know about a product. Any object with these fields fits. */
export interface CartItem {
  id: string;
  name: string;
  priceCents: number;
}

export interface CartLine extends CartItem {
  quantity: number;
}

/** Cart state: private signal, read-only view, changes only through methods. */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _lines = signal<CartLine[]>([]);

  readonly lines = this._lines.asReadonly();
  readonly count = computed(() => this._lines().reduce((sum, l) => sum + l.quantity, 0));

  // Zadanie 6: napraw niedziałający licznik sumy koszyka:
  /*
  ### 6. Napraw totalCents

    6.1 Przelicz sumę koszyka na podstawie wszystkich jego elementów
    6.2 Suma powinna aktualizować się na podstawie wszystkich elementów koszyka
  */
  readonly totalCents = computed(() => 0);

  add(item: CartItem): void {
    this._lines.update((lines) =>
      lines.some((l) => l.id === item.id)
        ? lines.map((l) => (l.id === item.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...lines, { id: item.id, name: item.name, priceCents: item.priceCents, quantity: 1 }],
    );
  }

  remove(id: string): void {
    this._lines.update((lines) => lines.filter((l) => l.id !== id));
  }

  clear(): void {
    // Zadanie 5: napraw, czyszczenie zawartości koszyka
  }
}
