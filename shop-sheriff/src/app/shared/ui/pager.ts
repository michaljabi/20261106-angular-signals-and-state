import { Component, computed, input, output } from '@angular/core';

/** Simple prev / next pager for `Page<T>` lists. */
@Component({
  selector: 'app-pager',
  template: `
    @if (pages() > 1) {
      <nav class="d-flex align-items-center gap-2" aria-label="Pages">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          [disabled]="page() <= 1"
          (click)="pageChange.emit(page() - 1)"
        >
          ‹ Prev
        </button>
        <span class="small text-body-secondary">Page {{ page() }} of {{ pages() }}</span>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          [disabled]="page() >= pages()"
          (click)="pageChange.emit(page() + 1)"
        >
          Next ›
        </button>
      </nav>
    }
  `,
})
export class Pager {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
}
