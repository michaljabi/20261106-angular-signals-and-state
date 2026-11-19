import { httpResource, HttpResourceRef, HttpResourceRequest } from '@angular/common/http';
import { WishlistProduct } from '../util';

/*
 * Server state → httpResource. Factory must run in an injection context
 * (component field initializer) → resource lives as long as that component.
 * Param = signal-reading fn: on change, old request cancelled, new one starts.
 */

/** `GET /api/products/:slug` request. Empty slug → `undefined` (no request). */
export function wishlistProductRequest(slug: string | undefined): HttpResourceRequest | undefined {
  return slug ? { url: `/api/products/${encodeURIComponent(slug)}` } : undefined;
}

/** `GET /api/products/:slug`. No slug → no request (resource stays idle). */
export function wishlistProductResource(
  slug: () => string | undefined,
): HttpResourceRef<WishlistProduct | undefined> {
  return httpResource<WishlistProduct>(() => wishlistProductRequest(slug()));
}
