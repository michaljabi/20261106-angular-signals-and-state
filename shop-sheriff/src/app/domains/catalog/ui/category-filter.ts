import { Component, input, model } from '@angular/core';
import { Category } from '../util';

/**
 * Presentational category pills. `model()` = two-way binding:
 * the parent writes `[(selected)]="category"` and owns the state.
 */
@Component({
  selector: 'app-category-filter',
  template: `
    <div class="d-flex flex-wrap gap-2" role="group" aria-label="Category">
      <button
        type="button"
        class="btn btn-sm"
        [class]="selected() === null ? 'btn-dark' : 'btn-outline-secondary'"
        [attr.aria-pressed]="selected() === null"
        (click)="selected.set(null)"
      >
        All
      </button>
      @for (c of categories(); track c.id) {
        <button
          type="button"
          class="btn btn-sm"
          [class]="selected() === c.slug ? 'btn-dark' : 'btn-outline-secondary'"
          [attr.aria-pressed]="selected() === c.slug"
          (click)="selected.set(c.slug)"
        >
          {{ c.name }}
        </button>
      }
    </div>
  `,
})
export class CategoryFilter {
  readonly categories = input.required<Category[]>();
  /** Category slug, `null` = all. */
  readonly selected = model<string | null>(null);
}
