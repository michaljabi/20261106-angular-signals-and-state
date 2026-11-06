import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Page } from '../../shared/util';

// ── DTOs (shop-api: src/modules/articles/articles.mapper.ts, only what we show) ──

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface LinkedProduct {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
}

export interface Article extends ArticleSummary {
  body: string;
  products: LinkedProduct[];
}

// ── Service ─────────────────────────────────────────────────────────────────

/**
 * The shop owner's buying guides. Read-only in this app:
 * they change with a release, not every minute.
 */
@Injectable({ providedIn: 'root' })
export class ArticlesService {
  /** All live articles. Only a handful, so no paging (API max pageSize = 50). Injection context! */
  listResource() {
    return httpResource<Page<ArticleSummary>>(() => ({
      url: '/api/articles',
      params: { pageSize: 50 },
    }));
  }

  /** One article. Injection context! */
  articleResource(slug: () => string) {
    return httpResource<Article>(() => `/api/articles/${encodeURIComponent(slug())}`);
  }

  /** "2026-10-12T08:00:00.000Z" → "2026-10-12" (same on server and browser → no hydration diff). */
  formatDate(iso: string | null): string {
    return iso ? iso.slice(0, 10) : '—';
  }
}
