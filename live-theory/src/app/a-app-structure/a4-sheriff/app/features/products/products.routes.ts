import { Routes } from '@angular/router';
import { ProductCatalog } from './state';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [ProductCatalog], // feature-level state scope
    loadComponent: () => import('./products-page').then((m) => m.ProductsPage),
  },
];
