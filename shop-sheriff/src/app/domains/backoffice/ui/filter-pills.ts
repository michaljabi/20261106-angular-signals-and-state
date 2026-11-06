import { Component, input, model } from '@angular/core';

export interface FilterOption<T> {
  value: T;
  label: string;
  /** Optional counter shown next to the label. */
  count?: number;
}

/**
 * Presentational, generic filter (status, role, type...).
 * `model()` = two-way binding: the parent writes `[(value)]="status"` with a signal.
 */
@Component({
  selector: 'app-filter-pills',
  template: `
    <div class="btn-group btn-group-sm flex-wrap" role="group" [attr.aria-label]="label()">
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="btn"
          [class.btn-primary]="option.value === value()"
          [class.btn-outline-primary]="option.value !== value()"
          [attr.aria-pressed]="option.value === value()"
          (click)="value.set(option.value)"
        >
          {{ option.label }}
          @if (option.count !== undefined) {
            <span class="badge text-bg-light ms-1">{{ option.count }}</span>
          }
        </button>
      }
    </div>
  `,
})
export class FilterPills<T> {
  readonly options = input.required<readonly FilterOption<T>[]>();
  readonly value = model.required<T>();
  readonly label = input('Filter');
}
