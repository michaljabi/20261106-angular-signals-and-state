import { FetchBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Where shop-api lives, seen from the server (SSR, prerender), e.g. 'http://localhost:3000'.
 * The browser never needs it: it calls relative `/api/...` and the dev proxy / SSR server forwards.
 */
export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN');

/**
 * Server only (app.config.server.ts): sends `/api/...` requests to API_ORIGIN.
 *
 * Why a backend and not an interceptor: our interceptors run BEFORE Angular's HTTP transfer cache.
 * An interceptor would make the URL absolute, the server would store the response under
 * 'http://localhost:3000/api/...', the browser would look for '/api/...' → cache miss →
 * every request runs twice (server + browser). The backend runs AFTER the cache,
 * so the cache key stays '/api/...' on both sides.
 * Extends FetchBackend: still fetch underneath (and no NG02801 "not using fetch" warning).
 */
@Injectable()
export class ApiOriginBackend extends FetchBackend {
  private readonly origin = inject(API_ORIGIN);

  override handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    // On the server Angular has already resolved '/api/x' against the page URL (http://host/api/x).
    const url = new URL(req.url, 'http://placeholder');
    return url.pathname.startsWith('/api/')
      ? super.handle(req.clone({ url: this.origin + url.pathname + url.search }))
      : super.handle(req);
  }
}
