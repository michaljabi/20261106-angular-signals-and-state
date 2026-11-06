import { Component, computed, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { PageHeader, Pager, ProblemAlert } from '../../../shared/ui';
import { toProblem } from '../../../shared/util';
import { categoriesResource, pageWithStock, productsResource, syncLiveStock } from '../data-access';
import { CategoryFilter, ProductCard } from '../ui';
import { PRODUCT_SORTS, ProductSort, SORT_LABELS, isProductSort } from '../util';

const PAGE_SIZE = 12;

/** Smart component: owns the filter state and reads server state. */
@Component({
  selector: 'app-browse-page',
  imports: [PageHeader, Pager, ProblemAlert, CategoryFilter, ProductCard],
  templateUrl: './browse-page.html',
})
export class BrowsePage {
  protected readonly pageSize = PAGE_SIZE;
  protected readonly sorts = PRODUCT_SORTS;
  protected readonly sortLabels = SORT_LABELS;

  // Search: keystrokes are EVENTS over TIME → RxJS (debounce); the result is STATE → signal.
  private readonly searchInput$ = new Subject<string>();
  protected readonly q = toSignal(
    this.searchInput$.pipe(
      map((text) => text.trim()),
      debounceTime(300),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );
  protected readonly category = signal<string | null>(null);
  protected readonly sort = signal<ProductSort>('name');
  /**
   * Writable, but derived: back to page 1 whenever the filters change.
   * linkedSignal, not an effect that calls `page.set(1)`.
   */
  protected readonly page = linkedSignal({
    source: () => ({ q: this.q(), category: this.category(), sort: this.sort() }),
    computation: () => 1,
  });

  // Server state. New params → old request cancelled, new one sent.
  private readonly categories = categoriesResource();
  /** `value()` throws while a resource is in error state → guard with `hasValue()`. */
  protected readonly categoryList = computed(() =>
    this.categories.hasValue() ? this.categories.value() : [],
  );
  protected readonly products = productsResource(() => ({
    q: this.q(),
    category: this.category(),
    sort: this.sort(),
    page: this.page(),
    pageSize: PAGE_SIZE,
  }));
  protected readonly loadProblem = computed(() => {
    const error = this.products.error();
    return error ? toProblem(error) : null;
  });

  constructor() {
    syncLiveStock(this.products, pageWithStock);
  }

  protected onSearch(text: string): void {
    this.searchInput$.next(text);
  }

  protected onSort(value: string): void {
    if (isProductSort(value)) this.sort.set(value);
  }
}
