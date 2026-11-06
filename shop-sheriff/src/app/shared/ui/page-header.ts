import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="d-flex align-items-baseline justify-content-between mb-4">
      <div>
        <h1 class="h3 mb-1">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-body-secondary mb-0">{{ subtitle() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
