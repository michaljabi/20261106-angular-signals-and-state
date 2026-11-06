import { Component, input } from '@angular/core';
import { ProblemDetails } from '../util';

/** Shows an API error (problem+json) as a Bootstrap alert. */
@Component({
  selector: 'app-problem-alert',
  template: `
    @if (problem(); as p) {
      <div class="alert alert-danger py-2" role="alert">
        <strong>{{ p.title }}</strong>
        @if (p.detail) {
          <span> · {{ p.detail }}</span>
        }
        @if (p.errors?.length) {
          <ul class="mb-0 mt-1 small">
            @for (e of p.errors; track e.path) {
              <li>{{ e.path }}: {{ e.message }}</li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export class ProblemAlert {
  readonly problem = input<ProblemDetails | null | undefined>();
}
