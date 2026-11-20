import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required, minLength, validateHttp} from '@angular/forms/signals';
import { PageHeader } from '../../../shared/ui';
import { WishlistItem } from './wishlist-item';
import { WishlistToggle } from '../ui';
import { WishlistStore, wishlistProductRequest } from '../data-access';
import { WishlistDetails, WishlistProduct } from '../util';


/** Real slugs from shop-api. */
const DEMO_SLUGS = [
  'typeforge-tkl-mechanical-keyboard',
  'typeforge-75-wireless-keyboard',
  'typeforge-low-profile-keyboard',
  'typeforge-ergonomic-split-keyboard',
  'typeforge-60-compact-keyboard',
  'sampler'
];


@Component({
  selector: 'app-wishlist-page',
  imports: [PageHeader, WishlistToggle, FormField, FormRoot, WishlistItem],
  template: `
    <app-page-header title="My wishlist" subtitle="Click ♡ to like a product." />

    <ul class="list-group">
      @for (slug of demoSlugs; track slug) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          {{ slug }}
          <app-wishlist-toggle
            [active]="wishlist.has(slug)"
            (toggled)="wishlist.toggleOnList(slug)"
          />
        </li>
      }
    </ul>

    <hr />
    <h2 class="h5 mt-4">List details</h2>

    <!-- formRoot: dodaje novalidate, on submit zaznacza pola jako touched, uruchamia submission.action tylko jeśli pola valid! -->
    <form [formRoot]="detailsForm" class="vstack gap-3" style="max-width: 32rem">
      @let name = detailsForm.name();
      <div>
        <label class="form-label" for="wishlist-name">Name</label>
        <input
          id="wishlist-name"
          class="form-control"
          [class.is-invalid]="name.touched() && name.invalid()"
          [class.is-valid]="name.touched() && name.valid()"
          [formField]="detailsForm.name"
        />
        @if (name.touched()) {
          @for (error of name.errors(); track error.kind) {
            <div class="invalid-feedback">{{ error.message }}</div>
          }
        }
      </div>

      <div>
        @let desc = detailsForm.description();
        <label class="form-label" for="wishlist-description">Description</label>
        <textarea
          id="wishlist-description"
          class="form-control"
          rows="3"
          [class.is-invalid]="detailsForm.description().touched() && desc.invalid()"
          [class.is-valid]="desc.touched() && desc.valid()"
          [formField]="detailsForm.description"
        ></textarea>
        @if (desc.touched()) {
          @for (error of desc.errors(); track error.kind) {
            <div class="invalid-feedback">{{ error.message }}</div>
          }
        }
      </div>

      <!-- SLUG (gift) -->
      <div>
        @let giftSlug = detailsForm.giftSlug();
        <label class="form-label" for="wishlist-gift">Gift idea (product slug, optional)</label>
        <div class="input-group has-validation">
          <input
            id="wishlist-gift"
            class="form-control font-monospace"
            placeholder="e.g. typeforge-75-wireless-keyboard"
            autocomplete="off"
            [class.is-invalid]="giftSlug.touched() && giftSlug.invalid()"
            [class.is-valid]="giftSlug.touched() && giftSlug.valid()"
            [formField]="detailsForm.giftSlug"
          />
          @if (detailsForm().pending()) {
            <span class="input-group-text">
              <span class="spinner-border spinner-border-sm" aria-label="Checking…"></span>
            </span>
          }
        </div>
        <!-- błędy: jak przy name, ale z d-block (pole jest w input-group) -->

        @if (giftSlug.touched()) {
          @for (error of giftSlug.errors(); track error.kind) {
            <div class="invalid-feedback d-block">{{ error.message }}</div>
          }
        }
      </div>

      <div class="d-flex gap-2">
        <button
          type="submit"
          [style.opacity]="detailsForm().invalid() ? 0.5 : 1"
          class="btn btn-primary"
        >
          Save
        </button>

        <button type="button" class="btn btn-outline-secondary" (click)="resetForm()">Reset</button>
      </div>
      <!--<pre>
        {{ detailsModel() | json }}
      </pre>-->
    </form>

    <h2 class="h5 mt-4 d-flex justify-content-between">
      Liked<span class="badge text-bg-danger">{{ wishlist.count() }}</span>
    </h2>
    @if (wishlist.count()) {
      <ul class="list-group">
        @for (slug of wishlist.slugs(); track slug) {
          <app-wishlist-item [slug]="slug" />
        }
      </ul>
    } @else {
      <p class="text-body-secondary">Nothing here yet.</p>
    }
  `,
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistStore);
  protected readonly demoSlugs = DEMO_SLUGS;

  // Signal Forms docs: https://angular.dev/guide/forms/signals/overview
  //   model:      https://angular.dev/guide/forms/signals/models
  //   validation: https://angular.dev/guide/forms/signals/validation  (async: …/async-operations)
  //   submit:     https://angular.dev/guide/forms/signals/form-submission
  private readonly detailsModel = signal<WishlistDetails>({
    ...this.wishlist.details(),
  });

  protected readonly detailsForm = form(
    this.detailsModel,
    (p) => {
      required(p.name, { message: 'Name is required' });
      minLength(p.description, 5, { message: 'Description must be at least 5 characters' });

      validateHttp<string, WishlistProduct>(p.giftSlug, {
        request: ({ value }) => wishlistProductRequest(value()),
        debounce: 400,
        onSuccess: (res) =>
          res.id ? null : { kind: 'not-exist', message: 'Product does not exist' },
        onError: () => ({ kind: 'server', message: 'Product does not exist' }),
      });
    },
    {
      submission: {
        action: async () => {
          console.log(this.detailsModel());
          this.wishlist.saveDetails(this.detailsModel());
        },
      },
    },
  );

  resetForm(): void {
    this.detailsModel.set({ name: '', giftSlug: '', description: '' });
    this.detailsForm().reset();
  }
}
