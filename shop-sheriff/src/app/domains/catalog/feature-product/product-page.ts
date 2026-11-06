import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Session } from '../../../shared/data-access';
import { PricePipe, ProblemAlert } from '../../../shared/ui';
import { toProblem } from '../../../shared/util';
import { CartStore } from '../../checkout/data-access';
import {
  articlesMentioningResource,
  productResource,
  syncLiveStock,
  withStock,
} from '../data-access';
import { AddToCartButton, StockBadge } from '../ui';

/** Product detail. Server-rendered (SEO): only signals + httpResource, no browser APIs. */
@Component({
  selector: 'app-product-page',
  imports: [RouterLink, PricePipe, ProblemAlert, AddToCartButton, StockBadge],
  templateUrl: './product-page.html',
})
export class ProductPage {
  private readonly session = inject(Session);
  private readonly cart = inject(CartStore);

  /** Route param `:slug` (router input binding). */
  readonly slug = input.required<string>();

  /** A new slug (link from an article to another product) → new request, same component. */
  protected readonly product = productResource(this.slug);
  protected readonly articles = articlesMentioningResource(this.slug);

  protected readonly loadProblem = computed(() => {
    const error = this.product.error();
    return error ? toProblem(error) : null;
  });
  protected readonly mentions = computed(() =>
    this.articles.hasValue() ? this.articles.value() : [],
  );
  protected readonly inCart = computed(() =>
    this.product.hasValue() ? this.cart.quantityOf(this.product.value().id) : 0,
  );
  protected readonly canBuy = computed(() => this.session.hasRole('buyer'));
  protected readonly returnUrl = computed(() => `/products/${this.slug()}`);

  constructor() {
    syncLiveStock(this.product, withStock);

    // Browser tab title is outside Angular's template → a side effect → effect() is right.
    const title = inject(Title);
    effect(() => {
      if (this.product.hasValue()) title.setTitle(`${this.product.value().name} · Shop`);
    });
  }

  protected add(): void {
    if (this.product.hasValue()) this.cart.add(this.product.value());
  }
}
