// NOTE: this domain is intentionally unstructured (exercise: Day 1, Sheriff task 3).
import { Routes } from '@angular/router';

/** Public pages. Mounted at /articles. */
export const articlesRoutes: Routes = [
  {
    path: '',
    title: 'Articles',
    loadComponent: () => import('./article-list.component').then((m) => m.ArticleListComponent),
  },
  {
    path: ':slug',
    title: 'Article',
    loadComponent: () => import('./article-detail.component').then((m) => m.ArticleDetailComponent),
  },
];
