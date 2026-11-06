import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  // One instance (singleton) for the whole app – available to any component.
  providedIn: 'root',
})
export class VegetableStore {
  readonly #vegetables = signal(['lettuce', 'tomato', 'cucumber']);
  // Public read-only view: consumers cannot write.
  readonly vegetables = this.#vegetables.asReadonly();

  // Derived state from #vegetables.
  readonly numberOfVegetables = computed(() => this.#vegetables().length);

  add(veggie: string): void {
    // Immutable update: new array, no push().
    this.#vegetables.update((vegetables) => [...vegetables, veggie]);
  }

  removeAll(): void {
    this.#vegetables.set([]);
  }
}
