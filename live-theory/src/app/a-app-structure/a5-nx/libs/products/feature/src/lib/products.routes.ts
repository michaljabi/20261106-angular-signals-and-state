import { Routes } from '@angular/router';
import { ProductCatalog } from '@shop/products/data-access';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [ProductCatalog],
    loadComponent: () => import('./products-page').then((m) => m.ProductsPage),
  },
];
