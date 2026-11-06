import { Routes } from '@angular/router';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('@shop/products/feature').then((m) => m.PRODUCTS_ROUTES),
  },
];
