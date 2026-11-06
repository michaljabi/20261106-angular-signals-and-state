import { httpResource } from '@angular/common/http';
import { WritableResource, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServerEvents } from '../../../shared/data-access';
import { Page } from '../../../shared/util';
import {
  parseArticleRefs,
  parseCategories,
  parseProduct,
  parseProductPage,
  withStock,
} from './catalog.mappers';
import { Product, ProductsQuery, StockChange } from '../util';

/*
 * Server state → httpResource. Each factory must run in an injection context
 * (field initializer of a component), so the resource lives as long as that component.
 * Params are a signal-reading function: when they change, the old request is cancelled
 * and a new one starts (no race conditions, no manual switchMap).
 */

/** `GET /api/categories` */
export function categoriesResource() {
  return httpResource(() => '/api/categories', { parse: parseCategories, defaultValue: [] });
}

/** `GET /api/products?q&category&sort&page&pageSize` */
export function productsResource(query: () => ProductsQuery) {
  return httpResource(
    () => {
      const { q, category, sort, page, pageSize } = query();
      // Only send what is set: the API rejects `q=` (min length 1).
      const params: Record<string, string | number> = { sort, page, pageSize };
      if (q) params['q'] = q;
      if (category) params['category'] = category;
      return { url: '/api/products', params };
    },
    { parse: parseProductPage },
  );
}

/** `GET /api/products/:slug`. No slug → no request (resource stays idle). */
export function productResource(slug: () => string | undefined) {
  return httpResource(
    () => {
      const s = slug();
      return s ? `/api/products/${encodeURIComponent(s)}` : undefined;
    },
    { parse: parseProduct },
  );
}

/** `GET /api/articles?product=:slug` — published articles that mention this product. */
export function articlesMentioningResource(slug: () => string | undefined) {
  return httpResource(
    () => {
      const product = slug();
      return product ? { url: '/api/articles', params: { product, pageSize: 5 } } : undefined;
    },
    { parse: parseArticleRefs, defaultValue: [] },
  );
}

/** Applies a stock change to a page of products (immutable). */
export const pageWithStock = (page: Page<Product>, change: StockChange): Page<Product> => ({
  ...page,
  items: page.items.map((p) => withStock(p, change)),
});

/**
 * Live stock: patches a loaded resource when `stock.changed` arrives over SSE.
 * Events are a stream (RxJS); the resource value is state (signal) → we write into it,
 * instead of copying data around with an effect. Call in an injection context.
 * On the server the event stream is empty, so this is a no-op during SSR.
 */
export function syncLiveStock<T>(
  resource: WritableResource<T | undefined>,
  apply: (value: T, change: StockChange) => T,
): void {
  inject(ServerEvents)
    .on('stock.changed')
    .pipe(takeUntilDestroyed())
    .subscribe(({ productId, stock }) => {
      // Reading the value of a resource in error state throws → only patch loaded data.
      const current = resource.hasValue() ? resource.value() : undefined;
      if (current !== undefined) resource.set(apply(current, { productId, stock }));
    });
}
