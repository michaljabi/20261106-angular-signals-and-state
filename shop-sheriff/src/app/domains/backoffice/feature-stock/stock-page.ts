import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { ServerEvents, Session } from '../../../shared/data-access';
import { PageHeader, Pager, PricePipe, ProblemAlert } from '../../../shared/ui';
import { ProblemDetails, toProblem } from '../../../shared/util';
import { StockApi } from '../data-access';
import { StockBadge } from '../ui';
import { Product } from '../util';
import { NewProductForm } from './new-product-form';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-stock-page',
  imports: [NewProductForm, PageHeader, Pager, PricePipe, ProblemAlert, StockBadge],
  templateUrl: './stock-page.html',
})
export class StockPage {
  private readonly api = inject(StockApi);
  private readonly session = inject(Session);

  // ── UI state (signals) ──
  /** What is in the search box right now. */
  protected readonly searchText = signal('');
  /** Debounced copy: typing "keyb" sends one request, not four. Time-based → RxJS. */
  private readonly search = toSignal(
    toObservable(this.searchText).pipe(
      debounceTime(300),
      map((text) => text.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );
  /** Writable, but back to page 1 whenever the search changes. */
  protected readonly page = linkedSignal({ source: this.search, computation: () => 1 });
  /** Product being changed right now (its buttons are disabled). */
  protected readonly busyId = signal<string | null>(null);
  protected readonly actionProblem = signal<ProblemDetails | null>(null);

  // ── Server state (httpResource): re-fetches when search or page change ──
  protected readonly products = this.api.list(() => ({
    q: this.search(),
    page: this.page(),
    pageSize: PAGE_SIZE,
  }));
  protected readonly loadProblem = computed(() => {
    const error = this.products.error();
    return error ? toProblem(error) : null;
  });

  protected readonly isAdmin = computed(() => this.session.role() === 'admin');

  constructor() {
    // Stock changed somewhere (other staff, a new order) → patch the row, no re-fetch.
    inject(ServerEvents)
      .on('stock.changed')
      .pipe(takeUntilDestroyed())
      .subscribe(({ productId, stock }) => this.patchStock(productId, stock));
  }

  protected async adjust(product: Product, delta: number): Promise<void> {
    await this.run(product, async () => {
      const updated = await this.api.adjustStock(product.id, delta);
      this.patchStock(updated.id, updated.stock);
    });
  }

  protected async remove(product: Product): Promise<void> {
    if (!confirm(`Delete ${product.sku} "${product.name}"? Old orders keep it.`)) return;
    await this.run(product, async () => {
      await this.api.remove(product.id);
      this.products.reload(); // the page now has a gap: ask the server again
    });
  }

  protected onCreated(): void {
    this.products.reload();
  }

  /** One place for "busy + error" around a row action. */
  private async run(product: Product, action: () => Promise<void>): Promise<void> {
    this.busyId.set(product.id);
    this.actionProblem.set(null);
    try {
      await action();
    } catch (error) {
      this.actionProblem.set(toProblem(error));
    } finally {
      this.busyId.set(null);
    }
  }

  /**
   * An httpResource's `value` is writable: a local, immutable patch of the cached server state.
   * The next fetch replaces it with fresh data anyway.
   */
  private patchStock(id: string, stock: number): void {
    if (!this.products.hasValue()) return; // narrows: value is a Page from here on
    this.products.value.update((page) => ({
      ...page,
      items: page.items.map((p) => (p.id === id ? { ...p, stock } : p)),
    }));
  }
}
