import {
  Injectable,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CartLine, CartProduct } from '../util';

const STORAGE_KEY = 'shop-sheriff.cart';

/**
 * Client state: the cart. A signal-based service store:
 * private writable signal → public readonly signals / computed → mutations only via methods.
 * Global scope (`root`): the navbar badge and the cart page share it.
 */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _lines = signal<CartLine[]>([]);

  readonly lines = this._lines.asReadonly();
  /** Number of items (navbar badge). */
  readonly count = computed(() => this._lines().reduce((sum, l) => sum + l.quantity, 0));
  readonly totalCents = computed(() =>
    this._lines().reduce((sum, l) => sum + l.priceCents * l.quantity, 0),
  );
  readonly isEmpty = computed(() => this._lines().length === 0);

  constructor() {
    const injector = inject(Injector);
    // localStorage exists only in the browser, and the first client render must match the
    // server HTML (empty cart) to hydrate cleanly. So: load AFTER the first render…
    afterNextRender(() => {
      this._lines.set(readStorage());
      // …and only then start saving. An effect is right here: syncing to storage is a side effect.
      effect(() => writeStorage(this._lines()), { injector });
    });
  }

  /** How many of a product are in the cart (0 if none). */
  quantityOf(productId: string): number {
    return this._lines().find((l) => l.productId === productId)?.quantity ?? 0;
  }

  /** Adds one (or more); never more than the known stock. Refreshes price and stock. */
  add(product: CartProduct, quantity = 1): void {
    const existing = this._lines().find((l) => l.productId === product.id);
    const line: CartLine = {
      productId: product.id,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      stock: product.stock,
      quantity: Math.min((existing?.quantity ?? 0) + quantity, product.stock),
    };
    if (line.quantity <= 0) return;
    this._lines.update((lines) =>
      existing ? lines.map((l) => (l.productId === product.id ? line : l)) : [...lines, line],
    );
  }

  /** Sets the quantity, clamped to the known stock. 0 (or less) removes the line. */
  setQuantity(productId: string, quantity: number): void {
    this._lines.update((lines) =>
      lines
        .map((l) =>
          l.productId === productId ? { ...l, quantity: Math.min(quantity, l.stock) } : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }

  /**
   * Live stock (SSE) told us the real stock. Updates it but keeps the quantity:
   * the user decides (the cart page warns when quantity > stock).
   */
  updateStock(productId: string, stock: number): void {
    this._lines.update((lines) =>
      lines.map((l) => (l.productId === productId && l.stock !== stock ? { ...l, stock } : l)),
    );
  }

  /** "Set to available" after a 409: stock = available, quantity clamped (0 → removed). */
  fitToStock(productId: string, available: number): void {
    this.updateStock(productId, available);
    this.setQuantity(productId, available);
  }

  remove(productId: string): void {
    this._lines.update((lines) => lines.filter((l) => l.productId !== productId));
  }

  clear(): void {
    this._lines.set([]);
  }
}

function readStorage(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return []; // corrupt JSON or storage blocked: start with an empty cart
  }
}

function writeStorage(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // storage full or blocked (private mode): the cart still works in memory
  }
}

/** Storage is user-editable input: check the shape before trusting it. */
function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const l = value as Record<string, unknown>;
  return (
    typeof l['productId'] === 'string' &&
    typeof l['sku'] === 'string' &&
    typeof l['slug'] === 'string' &&
    typeof l['name'] === 'string' &&
    typeof l['priceCents'] === 'number' &&
    typeof l['stock'] === 'number' &&
    typeof l['quantity'] === 'number' &&
    l['quantity'] > 0
  );
}
