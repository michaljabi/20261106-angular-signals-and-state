import {
  HttpClient,
  HttpResourceRef,
  HttpResourceRequest,
  httpResource,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Page } from '../../../shared/util';
import { Category, NewProduct, Product, ProductsQuery } from '../util';

/**
 * Products for staff. Reads = `httpResource` (server state as signals),
 * writes = HttpClient → Promise (one-shot commands).
 */
@Injectable({ providedIn: 'root' })
export class StockApi {
  private readonly http = inject(HttpClient);

  /**
   * Products page. Call in an injection context (a field initializer): the resource then lives
   * as long as the caller and re-fetches whenever `query()` changes.
   */
  list(query: () => ProductsQuery): HttpResourceRef<Page<Product> | undefined> {
    return httpResource<Page<Product>>(() => {
      const { q, page, pageSize } = query();
      return { url: '/api/products', params: { page, pageSize, ...(q ? { q } : {}) } };
    });
  }

  categories(): HttpResourceRef<Category[] | undefined> {
    return httpResource<Category[]>(() => '/api/categories');
  }

  /** Request for the async "is this SKU free?" validator (`validateHttp` in the form). */
  skuAvailableRequest(sku: string): HttpResourceRequest {
    return { url: '/api/products/sku-available', params: { sku } };
  }

  create(product: NewProduct): Promise<Product> {
    return firstValueFrom(this.http.post<Product>('/api/products', product));
  }

  /** `delta`: +10 = delivery arrived, -1 = damaged item. The API refuses to go below 0 (409). */
  adjustStock(id: string, delta: number): Promise<Product> {
    return firstValueFrom(this.http.patch<Product>(`/api/products/${id}/stock`, { delta }));
  }

  /** Soft delete (admin only): old orders still point at the product. */
  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/products/${id}`));
  }
}
